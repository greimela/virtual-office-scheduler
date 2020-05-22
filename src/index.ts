#!/usr/bin/env node

import { parseConfig } from "./config";
import { fetchSpreadsheet } from "./fetchSpreadsheet";

import { generateOffice } from "./generateOffice";
import { updateOffice } from "./updateOffice";

async function main(): Promise<void> {
  const config = parseConfig();
  console.log(config);

  const spreadsheet = await fetchSpreadsheet(config.GOOGLE_SPREADSHEET_ID, config.GOOGLE_SHEET_NAME);
  const office = generateOffice(spreadsheet);

  await updateOffice(config, office);
}

main();
