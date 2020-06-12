import { ZoomMeeting, ZoomUser } from "./zoom";
import { CreateMeetingsEnvironment } from "../config";
import { logger } from "../log";
import { findSheet, getSpreadsheet } from "../googleSpreadsheet";

export async function uploadToSpreadsheet(
  meetings: { user: ZoomUser; meeting: ZoomMeeting }[],
  config: CreateMeetingsEnvironment
): Promise<void> {
  logger.info("Uploading spreadsheet");
  const doc = await getSpreadsheet(config);
  const sheet = findSheet(doc, config.MEETINGS_SHEET_NAME);
  if (!sheet) {
    throw new Error(`cannot find meetings sheet (${config.MEETINGS_SHEET_NAME})`);
  }
  await sheet.clear();
  sheet.headerValues = ["email", "meetingId", "joinUrl"];
  await sheet.addRow({ email: "email", meetingId: "meetingId", joinUrl: "joinUrl" });

  for (const { user, meeting } of meetings) {
    await sheet.addRow({ email: user.email, meetingId: meeting.id, joinUrl: meeting.join_url });
  }
}
