import { WebClient } from "@slack/web-api";
import { Office, Room, RoomLink } from "./generateOffice";
import { ScheduleEnvironment } from "../config";
import { logger } from "../log";
import { iconUrlFor } from "./extractLinks";

interface Channel {
  id: string;
  name: string;
}

class SlackClient {
  private client: WebClient;
  private enableRateLimiting: boolean;
  private lastRequestTimestamps: { [method: string]: number } = {};

  constructor(config: { SLACK_ENABLE_RATE_LIMITING?: "true" | "false"; SLACK_TOKEN: string }) {
    this.client = new WebClient(config.SLACK_TOKEN);
    this.enableRateLimiting = config.SLACK_ENABLE_RATE_LIMITING === "true";
  }

  async getAllChannels(): Promise<Channel[]> {
    const channels: Channel[] = [];

    let cursor;
    do {
      logger.info(`Fetching Slack channels${cursor ? ` for cursor ${cursor}` : ""}`);
      const result = await this.client.conversations.list({
        limit: 1000,
        types: "public_channel",
        // eslint-disable-next-line @typescript-eslint/camelcase
        exclude_archived: true,
        cursor,
      });
      if (result.ok) {
        cursor = result.response_metadata?.next_cursor;
        channels.push(...(result.channels as Channel[]));
      } else {
        throw new Error(result.error);
      }
    } while (cursor);

    return channels;
  }

  async createChannelIfNotExists(options: { name: string }): Promise<boolean> {
    await this.limitRate("conversations.create", 1000 * 3);
    try {
      const result = await this.client.conversations.create(options);
      return result.ok;
    } catch (e) {
      const error = e?.data?.error;
      if (error === "name_taken") {
        return false;
      }
      throw e;
    }
  }

  private async limitRate(functionName: string, millisBetweenRequests: number): Promise<void> {
    if (this.enableRateLimiting && this.lastRequestTimestamps[functionName]) {
      const millisSinceLastRequest = Date.now() - this.lastRequestTimestamps[functionName];
      if (millisBetweenRequests - millisSinceLastRequest > 0) {
        await new Promise((resolve) => setTimeout(resolve, millisBetweenRequests - millisSinceLastRequest));
      }
    }
    this.lastRequestTimestamps[functionName] = Date.now();
  }
}

function getChannelLink(baseUrl, channelName: string): RoomLink {
  const href = `${baseUrl}/app_redirect?channel=${channelName}`;
  return { text: "Slack", href, icon: iconUrlFor(href) };
}

function getSlackChannelName(room: Room): string {
  const channelNameTitle = room.name
    .toLowerCase()
    .replace(/[+\-/\\(){}[\]<>!§$%&=?*#€¿_".,:;]/g, "")
    .replace(/\s+/g, "_");
  return `vsr20-${channelNameTitle}`.substring(0, 80);
}

export async function createSlackChannelsAndInsertLinks(office: Office, config: ScheduleEnvironment): Promise<Office> {
  const slackClient = new SlackClient(config);

  for (const room of office.rooms) {
    if (!room.hasSlackChannel) {
      continue;
    }
    const name = getSlackChannelName(room);
    if (await slackClient.createChannelIfNotExists({ name })) {
      logger.info(`Created slack channel ${name}`);
    } else {
      logger.info(`Channel ${name} already exists`);
    }
    room.links.push(getChannelLink(config.SLACK_BASE_URL, name));
  }
  return office;
}
