import { ZoomMeeting, ZoomUser } from "./zoom";
import { authorize } from "../google";
import { CreateMeetingsEnvironment } from "../config";
import { google } from "googleapis";
import { logger } from "../log";

export async function uploadToSpreadsheet(
  spreadsheetId: string,
  meetings: { user: ZoomUser; meeting: ZoomMeeting }[],
  config: CreateMeetingsEnvironment
): Promise<unknown> {
  logger.info("Uploading spreadsheet");
  const auth = await authorize(config);

  const sheets = google.sheets({ version: "v4", auth });
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.update(
      {
        spreadsheetId,
        range: config.MEETINGS_SHEET_NAME,
        valueInputOption: "RAW",
        requestBody: {
          range: config.MEETINGS_SHEET_NAME,
          majorDimension: "ROWS",
          values: [
            ["email", "meetingId", "joinUrl"],
            ...meetings.map(({ user, meeting }) => [user.email, meeting.id, meeting.join_url]),
          ],
        },
      },
      (err, res) => {
        if (err) {
          return reject(new Error("The API returned an error: " + err));
        }
        resolve(res);
      }
    );
  });
}
