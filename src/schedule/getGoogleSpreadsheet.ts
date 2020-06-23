import { GoogleSpreadsheet } from "google-spreadsheet";
import { ScheduleEnvironment } from "../config";
import { findSheet, getSpreadsheet } from "../googleSpreadsheet";

export interface RawScheduleSpreadsheetRow {
  Start: string;
  Slot: string;
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
  hostKey: string;
}

export interface RawSpreadsheetData {
  schedule: RawScheduleSpreadsheetRow[];
  meetings: RawMeetingsSpreadsheetRow[];
}

async function sheetRowsFor<T>(document: GoogleSpreadsheet, name: string): Promise<T[]> {
  const sheet = findSheet(document, name);
  if (!sheet) {
    throw new Error(`could not find sheet for name ${name}`);
  }

  const rows = await sheet.getRows();
  return (rows as unknown) as T[];
}

export async function fetchScheduleSpreadsheet(config: ScheduleEnvironment): Promise<RawSpreadsheetData> {
  const doc = await getSpreadsheet(config);

  return {
    meetings: await sheetRowsFor<RawMeetingsSpreadsheetRow>(doc, config.MEETINGS_SHEET_NAME),
    schedule: await sheetRowsFor<RawScheduleSpreadsheetRow>(doc, config.SCHEDULE_SHEET_NAME),
  };
}
