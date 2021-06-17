import { GoogleSpreadsheet } from "google-spreadsheet";
import { ScheduleEnvironment } from "../config";
import { findSheet, getSpreadsheet } from "../googleSpreadsheet";

export interface RawScheduleSpreadsheetRow {
  Start: string;
  Title: string;
  MeetingIds: string;
  JoinUrl: string;
  AlwaysActive: string;
}

export interface RawMeetingsSpreadsheetRow {
  email: string;
  meetingId: string;
  joinUrl: string;
  hostKey: string;
}

export interface RawFreizeitSpreadsheetRow {
  Title: string;
  Day: string;
  Start: string;
  End: string;
  Links: string;
  Icon: string;
  MeetingIds: string;
  JoinUrl: string;
  AlwaysActive: string;
}

export interface RawFullDayTopicRow {
  Title: string;
  Links: string;
  MeetingIds: string;
  OpenForNewbies: "TRUE" | "FALSE";
}

export interface RawHalfDayTopicRow {
  Title: string;
  Links: string;
  MeetingIds: string;
  Slot: string;
  OpenForNewbies: "TRUE" | "FALSE";
}

export interface RawSpreadsheetData {
  fullDayTopics: RawFullDayTopicRow[];
  halfDayTopics: RawHalfDayTopicRow[];
  schedule: RawScheduleSpreadsheetRow[];
  meetings: RawMeetingsSpreadsheetRow[];
  freizeit: RawFreizeitSpreadsheetRow[];
}

async function sheetRowsFor<T>(document: GoogleSpreadsheet, name: string): Promise<T[]> {
  const sheet = findSheet(document, name);
  if (!sheet) {
    throw new Error(`could not find sheet for name ${name}`);
  }

  const rows = await sheet.getRows();
  return rows as unknown as T[];
}

export async function fetchScheduleSpreadsheet(config: ScheduleEnvironment): Promise<RawSpreadsheetData> {
  const doc = await getSpreadsheet(config);

  return {
    schedule: await sheetRowsFor<RawScheduleSpreadsheetRow>(doc, config.SCHEDULE_SHEET_NAME),
    fullDayTopics: await sheetRowsFor<RawFullDayTopicRow>(doc, "Ganztagsthemen"),
    halfDayTopics: await sheetRowsFor<RawHalfDayTopicRow>(doc, "Halbtagsthemen"),
    freizeit: await sheetRowsFor<RawFreizeitSpreadsheetRow>(doc, "Freizeit"),
    meetings: await sheetRowsFor<RawMeetingsSpreadsheetRow>(doc, config.MEETINGS_SHEET_NAME),
  };
}
