import { ZoomMeeting, ZoomUser } from "./zoom";
import { authorize } from "./google";
import { Environment } from "../config";
import { google } from "googleapis";
import { logger } from "../log";

export async function uploadToSpreadsheet(
  spreadsheetId: string,
  meetings: { user: ZoomUser; meeting: ZoomMeeting }[],
  config: Environment
): Promise<unknown> {
  logger.info("Uploading spreadsheet");
  const auth = await authorize(config);

  const sheets = google.sheets({ version: "v4", auth });
  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.update(
      {
        spreadsheetId,
        range: "Meetings",
        valueInputOption: "RAW",
        requestBody: {
          range: "Meetings",
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
