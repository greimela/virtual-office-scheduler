#!/usr/bin/env node

import { parseCreateMeetingsConfig } from "../config";
import { logger } from "../log";
import { uploadToSpreadsheet } from "./uploadToSpreadsheet";
import { createZoomMeetings } from "./createZoomMeetings";
import { fetchZoomUsers } from "./fetchZoomUsers";

async function main(): Promise<void> {
  try {
    logger.info("Parsing config");
    const config = parseCreateMeetingsConfig();

    logger.info("Fetching zoom users for all given user emails");
    const zoomUsers = await fetchZoomUsers(config);

    logger.info("Generating zoom meetings for all users");
    const meetings = await createZoomMeetings({ config, zoomUsers });
    logger.info(
      "Generated all meetings",
      meetings.map(({ user, meeting }) => `${user.email} - ${meeting.id}`)
    );

    logger.info("Uploading meetings into spreadsheet");
    await uploadToSpreadsheet(meetings, config);

    logger.info("Successfully updated spreadsheet");
  } catch (error) {
    logger.error("Failed to update spreadsheet", error);
    if (error?.response?.data?.errors) {
      logger.error("Request failed", error?.response?.data);
    }
    // ugly workaround to get logs printed on the console and still being able to set an exit code
    setTimeout(() => process.exit(1), 10);
  }
}

main();
