import { GoogleSpreadsheet } from "google-spreadsheet";
import { ScheduleEnvironment } from "../config";

export interface RawScheduleSpreadsheetRow {
  Start: string;
  Title: string;
  Subtitle: string;
  Link: string;
  MeetingIds: string;
  ReservedIds: string;
  RandomJoin: string;
}

export interface RawMeetingsSpreadsheetRow {
  email: string;
  meetingId: string;
  joinUrl: string;
}

export interface RawSpreadsheetData {
  schedule: RawScheduleSpreadsheetRow[];
  meetings: RawMeetingsSpreadsheetRow[];
}

async function sheetRowsFor<T>(document: GoogleSpreadsheet, name: string): Promise<T[]> {
  for (let i = 0; i < document.sheetCount; i++) {
    const sheet = document.sheetsByIndex[i];
    if (sheet.title === name) {
      const rows = await sheet.getRows();
      return (rows as unknown) as T[];
    }
  }
  throw new Error(`could not find sheet for name ${name}`);
}

export async function fetchScheduleSpreadsheet(config: ScheduleEnvironment): Promise<RawSpreadsheetData> {
  const doc = new GoogleSpreadsheet(config.GOOGLE_SPREADSHEET_ID);
  await doc.useServiceAccountAuth({
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_email: config.GOOGLE_SERVICE_ACCOUNT_MAIL,
    // eslint-disable-next-line @typescript-eslint/camelcase
    private_key: config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
  });

  await doc.loadInfo();

  return {
    meetings: await sheetRowsFor<RawMeetingsSpreadsheetRow>(doc, config.MEETINGS_SHEET_NAME),
    schedule: await sheetRowsFor<RawScheduleSpreadsheetRow>(doc, config.SCHEDULE_SHEET_NAME),
  };
}
