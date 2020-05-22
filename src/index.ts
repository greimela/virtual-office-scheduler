#!/usr/bin/env node

import { parseConfig } from "./config";
import { fetchSpreadsheet } from "./fetchSpreadsheet";
import { generateOffice } from "./generateOffice";
import { updateOffice } from "./updateOffice";
import { validateSpreadsheet } from "./validateSpreadsheet";
import { logger } from "./log";

async function main(): Promise<void> {
  try {
    logger.info("Updating virtual office from spreadsheet");
    const config = parseConfig();

    const spreadsheet = await fetchSpreadsheet(config.GOOGLE_SPREADSHEET_ID, config.GOOGLE_SHEET_NAME);
    validateSpreadsheet(spreadsheet);

    const office = generateOffice(spreadsheet);
    await updateOffice(config, office);

    logger.info("Successfully updated virtual office");
  } catch (error) {
    logger.error("Failed to update virtual office", error);
  }
}

main();
