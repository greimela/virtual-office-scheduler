import { Office, Room, RoomLink } from "./generateOffice";
import { ScheduleEnvironment } from "../config";
import { logger } from "../log";
import { iconUrlFor } from "./extractLinks";
import { SlackClient } from "./SlackClient";

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
