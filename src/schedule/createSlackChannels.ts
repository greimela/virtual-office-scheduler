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
  const allChannels = (await slackClient.getAllChannels()).filter((channel) => channel.name.startsWith("vsr20"));

  const roomsToCreate = office.rooms
    .filter((room) => room.hasSlackChannel)
    .map((room) => ({ room, channelName: getSlackChannelName(room) }));
  for (const { room, channelName } of roomsToCreate) {
    const channel = allChannels.find((channel) => channel.name === channelName);
    if (channel?.archived) {
      await slackClient.unarchiveChannel(channel.id);
      logger.info(`Unarchived slack channel ${channelName}`);
    } else if (channel) {
      logger.info(`Channel ${channelName} already exists`);
    } else {
      if (await slackClient.createChannelIfNotExists({ name: channelName })) {
        logger.info(`Created slack channel ${channelName}`);
      }
    }
    room.links.push(getChannelLink(config.SLACK_BASE_URL, channelName));
  }
  const obsoleteChannels = allChannels.filter(
    (channel) => !roomsToCreate.some((roomToCreate) => roomToCreate.channelName === channel.name)
  );
  for (const obsoleteChannel of obsoleteChannels) {
    logger.info(`Channel ${obsoleteChannel.name} is obsolete => archiving`);
    await slackClient.archiveChannel(obsoleteChannel.id);
  }

  return office;
}
