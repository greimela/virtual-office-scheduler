#!/usr/bin/env node

import { parseConfig } from "./config";
import { fetchZoomUsers } from "./fetchZoomUsers";
import { logger } from "./log";
import { createZoomMeetings } from "./createZoomMeetings";
import { uploadToSpreadsheet } from "./uploadToSpreadsheet";

async function main(): Promise<void> {
  try {
    logger.info("Parsing config");
    const config = parseConfig();

    logger.info("Fetching zoom users for all given user emails");
    const zoomUsers = await fetchZoomUsers(config);

    logger.info("Generating zoom meetings for all users");
    const meetings = await createZoomMeetings({ config, zoomUsers });
    logger.info(
      "Generated all meetings",
      meetings.map(({ user, meeting }) => `${user.email} - ${meeting.id}`)
    );

    logger.info("Uploading meetings into spreadsheet");
    await uploadToSpreadsheet(config.GOOGLE_SPREADSHEET_ID, meetings, config);

    logger.info("Successfully updated virtual office");
  } catch (error) {
    logger.error("Failed to update virtual office", error);
    // ugly workaround to get logs printed on the console and still being able to set an exit code
    setTimeout(() => process.exit(1), 10);
  }
}

main();
