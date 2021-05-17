import { WebClient } from "@slack/web-api";
import { logger } from "../log";

export interface SlackConfig {
  SLACK_TOKEN: string;
  SLACK_BASE_URL: string;
  SLACK_ENABLE_RATE_LIMITING: "true" | "false" | undefined;
}

interface Channel {
  id: string;
  name: string;
  archived: boolean;
}

export class SlackClient {
  private client: WebClient;
  private enableRateLimiting: boolean;
  private lastRequestTimestamps: { [method: string]: number } = {};

  constructor(config: SlackConfig) {
    this.client = new WebClient(config.SLACK_TOKEN);
    this.enableRateLimiting = config.SLACK_ENABLE_RATE_LIMITING === "true";
  }

  async archiveChannel(channel: string): Promise<void> {
    await this.client.conversations.archive({ channel });
  }

  async unarchiveChannel(channel: string): Promise<void> {
    try {
      await this.client.conversations.unarchive({ channel });
      await this.client.conversations.leave({ channel });
    } catch (e) {
      if (e.message.includes("not_in_channel")) {
        // Not part of API doc, see https://api.slack.com/methods/conversations.unarchive, therefore explicitly handled
        logger.error(
          `Could not un-archive channel with id '${channel}. Please do it manually. This is most likely due to using a bot token rather than the required user token, however it is not documented yet.`
        );
      } else {
        throw e;
      }
    }
  }

  async getAllChannels(): Promise<Channel[]> {
    const channels: Channel[] = [];

    let cursor;
    do {
      logger.info(`Fetching Slack channels${cursor ? ` for cursor ${cursor}` : ""}`);
      const result = await this.client.conversations.list({
        limit: 1000,
        types: "public_channel",
        cursor,
      });
      if (result.ok) {
        cursor = result.response_metadata?.next_cursor;
        channels.push(
          ...(result.channels as unknown as any).map((c) => ({ archived: c.is_archived, ...c } as Channel))
        );
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
