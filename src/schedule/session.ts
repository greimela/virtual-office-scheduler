#!/usr/bin/env node

import { parseScheduleConfig } from "../config";
import { fetchSpreadsheet } from "./fetchSpreadsheet";
import { logger } from "../log";
import { generateOffice } from "./generateOffice";
import { updateOfficeInstance } from "./updateOffice";
import { createConfluencePagesAndInsertLinks } from "./createConfluencePages";
import { ConfluenceConfig } from "./ConfluenceClient";

async function main(): Promise<void> {
  try {
    logger.info("Updating virtual office from spreadsheet");
    const config = parseScheduleConfig();

    let { schedule, meetings, topics, freizeit } = await fetchSpreadsheet(config);
    //
    // if (config.SLACK_TOKEN && config.SLACK_BASE_URL) {
    //   topics = await createSlackChannelsAndInsertLinks(topics, config as SlackConfig);
    // }

    topics = topics.map((topic) => {
      const meeting = meetings[topic.meetingIds[0]];

      return {
        ...topic,
        links: [
          ...topic.links,
          {
            href: "#",
            icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/zoom-icon.png",
            text: `Host-Key: ${meeting.hostKey}`,
          },
        ],
      };
    });
    if (
      config.CONFLUENCE_BASE_URL &&
      config.CONFLUENCE_USER &&
      config.CONFLUENCE_PASSWORD &&
      config.CONFLUENCE_SPACE_KEY &&
      config.CONFLUENCE_PARENT_PAGE_ID &&
      config.CONFLUENCE_TEMPLATE_PAGE_ID
    ) {
      topics = await createConfluencePagesAndInsertLinks(topics, meetings, config as ConfluenceConfig);
    }

    const office = generateOffice(schedule, meetings, topics, freizeit);

    await updateOfficeInstance(
      config.VIRTUAL_OFFICE_BASE_URL,
      config.VIRTUAL_OFFICE_USERNAME,
      config.VIRTUAL_OFFICE_PASSWORD,
      office
    );

    office.rooms = office.rooms.filter((room) => room.openForNewbies);
    office.rooms.push({
      roomId: "neu-bei-tng",
      meetingId: "96951842676",
      joinUrl: meetings["96951842676"].joinUrl,
      name: "Neu bei TNG",
      openForNewbies: true,
      links: [],
    });
    office.schedule.sessions.push({ start: "08:30", end: "09:00", roomId: "neu-bei-tng" });
    await updateOfficeInstance(
      config.NEWBIE_VIRTUAL_OFFICE_BASE_URL,
      config.VIRTUAL_OFFICE_USERNAME,
      config.VIRTUAL_OFFICE_PASSWORD,
      office
    );

    return;
    // const joinUrls = joinUrlsFrom(meetings);
    //
    // validateSpreadsheet(schedule, joinUrls);
    //
    // if (config.SLACK_TOKEN && config.SLACK_BASE_URL) {
    //   office = await createSlackChannelsAndInsertLinks(office, config as SlackConfig);
    // }
    // if (
    //   config.CONFLUENCE_BASE_URL &&
    //   config.CONFLUENCE_USER &&
    //   config.CONFLUENCE_PASSWORD &&
    //   config.CONFLUENCE_SPACE_KEY &&
    //   config.CONFLUENCE_PARENT_PAGE_ID &&
    //   config.CONFLUENCE_TEMPLATE_PAGE_ID
    // ) {
    //   office = await createConfluencePagesAndInsertLinks(office, config as ConfluenceConfig);
    // }
    logger.info("Successfully updated virtual office");
  } catch (error) {
    logger.error("Failed to update virtual office", error);
    // ugly workaround to get logs printed on the console and still being able to set an exit code
    setTimeout(() => process.exit(1), 10);
  }
}

main();
