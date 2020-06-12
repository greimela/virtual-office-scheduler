#!/usr/bin/env node

import { parseScheduleConfig } from "../config";
import { fetchSpreadsheet } from "./fetchSpreadsheet";
import { generateOffice } from "./generateOffice";
import { updateOffice } from "./updateOffice";
import { validateSpreadsheet } from "./validateSpreadsheet";
import { logger } from "../log";
import { joinUrlsFrom } from "./joinUrls";

async function main(): Promise<void> {
  try {
    logger.info("Updating virtual office from spreadsheet");
    const config = parseScheduleConfig();

    const { meetings, schedule } = await fetchSpreadsheet(config);
    const joinUrls = joinUrlsFrom(meetings);

    validateSpreadsheet(schedule, joinUrls);

    const office = generateOffice(schedule, joinUrls);
    await updateOffice(config, office);

    logger.info("Successfully updated virtual office");
  } catch (error) {
    logger.error("Failed to update virtual office", error);
    // ugly workaround to get logs printed on the console and still being able to set an exit code
    setTimeout(() => process.exit(1), 10);
  }
}

main();
