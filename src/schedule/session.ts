#!/usr/bin/env node

import { parseScheduleConfig } from "../config";
import { fetchSpreadsheet } from "./fetchSpreadsheet";
import { generateOffice } from "./generateOffice";
import { updateOffice } from "./updateOffice";
import { validateSpreadsheet } from "./validateSpreadsheet";
import { logger } from "../log";
import { joinUrlsFrom } from "./joinUrls";
import { createSlackChannelsAndInsertLinks } from "./createSlackChannels";
import { SlackConfig } from "./SlackClient";

async function main(): Promise<void> {
  try {
    logger.info("Updating virtual office from spreadsheet");
    const config = parseScheduleConfig();

    const { meetings, schedule } = await fetchSpreadsheet(config);
    const joinUrls = joinUrlsFrom(meetings);

    validateSpreadsheet(schedule, joinUrls);

    let office = generateOffice(schedule, joinUrls, config);
    if (config.SLACK_TOKEN && config.SLACK_BASE_URL) {
      office = await createSlackChannelsAndInsertLinks(office, config as SlackConfig);
    }
    await updateOffice(config, office);

    logger.info("Successfully updated virtual office");
  } catch (error) {
    logger.error("Failed to update virtual office", error);
    // ugly workaround to get logs printed on the console and still being able to set an exit code
    setTimeout(() => process.exit(1), 10);
  }
}

main();
