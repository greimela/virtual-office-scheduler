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

    const spreadsheet = await fetchSpreadsheet(config);
    validateSpreadsheet(spreadsheet);

    const office = generateOffice(config, spreadsheet);
    await updateOffice(config, office);

    logger.info("Successfully updated virtual office");
  } catch (error) {
    logger.error("Failed to update virtual office", error);
    // ugly workaround to get logs printed on the console and still being able to set an exit code
    setTimeout(() => process.exit(1), 10);
  }
}

main();
