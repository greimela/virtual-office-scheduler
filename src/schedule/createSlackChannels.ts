import { RoomLink } from "./generateOffice";
import { logger } from "../log";
import { iconUrlFor } from "./extractLinks";
import { SlackClient, SlackConfig } from "./SlackClient";
import { Topic } from "./fetchSpreadsheet";

function getChannelLink(baseUrl, channelName: string): RoomLink {
  const href = `${baseUrl}/app_redirect?channel=${channelName}`;
  return { text: "Slack", href, icon: iconUrlFor(href) };
}

function getSlackChannelName(topic: Topic): string {
  const channelNameTitle = topic.title
    .toLowerCase()
    .replace(/[+\-/\\(){}[\]<>!§$–%&=?*#€¿_'".,:;]/g, "")
    .replace(/\s+/g, "_");
  return `vwr21-${channelNameTitle}`.substring(0, 80);
}

export async function createSlackChannelsAndInsertLinks(topics: Topic[], config: SlackConfig): Promise<Topic[]> {
  const slackClient = new SlackClient(config);
  const allChannels = (await slackClient.getAllChannels()).filter((channel) => channel.name.startsWith("vwr21"));

  const roomsToCreate = topics.map((topic) => ({ topic, channelName: getSlackChannelName(topic) }));
  for (const { topic, channelName } of roomsToCreate) {
    const channel = allChannels.find((channel) => channel.name === channelName);
    if (channel?.archived) {
      await slackClient.unarchiveChannel(channel.id);
      logger.info(`Unarchived slack channel ${channelName}`);
    } else if (channel) {
      logger.info(`Channel ${channelName} already exists`);
    } else {
      // throw new Error(`Missing channel ${channelName}`);
      if (await slackClient.createChannelIfNotExists({ name: channelName })) {
        logger.info(`Created slack channel ${channelName}`);
      }
    }
    topic.links.push(getChannelLink(config.SLACK_BASE_URL, channelName));
  }

  for (const channel of allChannels) {
    if (!roomsToCreate.some((roomToCreate) => roomToCreate.channelName === channel.name || channel.archived)) {
      logger.info(`Channel ${channel.name} is obsolete => archiving`);
      throw new Error(`Would archive slack channel ${channel.id}`);
      // await slackClient.archiveChannel(channel.id);
    }
  }

  return topics;
}
