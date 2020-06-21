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
}

export class SlackClient {
  private client: WebClient;
  private enableRateLimiting: boolean;
  private lastRequestTimestamps: { [method: string]: number } = {};

  constructor(config: SlackConfig) {
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
