#!/usr/bin/env node

import { parseScheduleConfig } from "../config";
import { fetchSpreadsheet } from "./fetchSpreadsheet";
import { logger } from "../log";
import { generateFridayOffice, generateSaturdayOffice, Office } from "./generateOffice";
import { updateOfficeInstance } from "./updateOffice";
import { createConfluencePagesAndInsertLinks } from "./createConfluencePages";
import { ConfluenceConfig } from "./ConfluenceClient";

async function main(): Promise<void> {
  try {
    logger.info("Updating virtual office from spreadsheet");
    const config = parseScheduleConfig();

    let { schedule, meetings, topics, freizeit } = await fetchSpreadsheet(config);

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

    const date = new Date().toISOString().split("T")[0];
    const shouldDeployFriday = date === "2021-07-08" || date === "2021-07-09";
    const shouldDeploySaturday = date === "2021-07-10";

    let office: Office = {
      rooms: [],
      groups: [],
      schedule: {
        sessions: [],
        tracks: [{ id: "dummy", name: "" }],
      },
    };

    if (shouldDeployFriday) {
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
      office = generateFridayOffice(schedule, meetings, topics, freizeit);
    } else {
      if (shouldDeploySaturday) {
        office = generateSaturdayOffice(schedule, meetings, freizeit);
      }
    }

    await updateOfficeInstance(
      config.VIRTUAL_OFFICE_BASE_URL,
      config.VIRTUAL_OFFICE_USERNAME,
      config.VIRTUAL_OFFICE_PASSWORD,
      office
    );

    if (shouldDeployFriday) {
      office.rooms = office.rooms.filter((room) => room.openForNewbies);
      office.schedule.sessions = office.schedule.sessions.filter((session) => session.groupId !== "check-in");
      office.rooms.push({
        roomId: "neu-bei-tng",
        meetingId: "98202418413",
        joinUrl: meetings["98202418413"].joinUrl,
        name: "Neu bei TNG",
        openForNewbies: true,
        links: [],
      });
      office.schedule.sessions.push({ start: "08:30", end: "09:00", roomId: "neu-bei-tng" });
    }
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
