import { Office, Room, RoomLink } from "./generateOffice";
import { logger } from "../log";
import { iconUrlFor } from "./extractLinks";
import { SlackClient, SlackConfig } from "./SlackClient";

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

export async function createSlackChannelsAndInsertLinks(office: Office, config: SlackConfig): Promise<Office> {
  const slackClient = new SlackClient(config);
  const allChannels = await slackClient.getAllChannels();

  for (const room of office.rooms) {
    if (!room.hasSlackChannel) {
      continue;
    }
    const name = getSlackChannelName(room);
    if (allChannels.some((channel) => channel.name === name)) {
      logger.info(`Channel ${name} already exists`);
    }
    if (await slackClient.createChannelIfNotExists({ name })) {
      logger.info(`Created slack channel ${name}`);
    } else {
      logger.info(`Channel ${name} already exists`);
    }
    room.links.push(getChannelLink(config.SLACK_BASE_URL, name));
  }
  return office;
}
