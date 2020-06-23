import { ScheduleEnvironment } from "../config";
import { fetchScheduleSpreadsheet, RawMeetingsSpreadsheetRow, RawScheduleSpreadsheetRow } from "./getGoogleSpreadsheet";

export type MeetingDictionary = { [meetingId: string]: MeetingsSpreadsheetRow };
export type ScheduleSpreadsheet = ScheduleSpreadsheetRow[];

export interface ScheduleSpreadsheetRow {
  Start: string;
  Slot?: string;
  Title: string;
  Subtitle: string;
  Link: string;
  MeetingIds: string[];
  ReservedIds: string[];
  RandomJoin: boolean;
}

export interface MeetingsSpreadsheetRow {
  email: string;
  meetingId: string;
  joinUrl: string;
  hostKey: string;
}

export interface SpreadsheetData {
  schedule: ScheduleSpreadsheet;
  meetings: MeetingDictionary;
}

function adaptScheduleRow(raw: RawScheduleSpreadsheetRow): ScheduleSpreadsheetRow {
  function splitByComma(value: string): string[] {
    return !value || value.length === 0 ? [] : value.split(",");
  }

  return {
    Link: raw.Link,
    Start: raw.Start,
    Slot: raw.Slot,
    Subtitle: raw.Subtitle,
    Title: raw.Title,
    MeetingIds: splitByComma(raw.MeetingIds),
    ReservedIds: splitByComma(raw.ReservedIds),
    RandomJoin: raw.RandomJoin === "TRUE",
  };
}
function adaptMeetingsRow(raw: RawMeetingsSpreadsheetRow): MeetingsSpreadsheetRow {
  return {
    email: raw.email,
    joinUrl: raw.joinUrl,
    meetingId: raw.meetingId,
    hostKey: raw.hostKey,
  };
}

export async function fetchSpreadsheet(config: ScheduleEnvironment): Promise<SpreadsheetData> {
  const { meetings, schedule } = await fetchScheduleSpreadsheet(config);

  return {
    meetings: meetings.map(adaptMeetingsRow).reduce((acc, meeting) => ({ ...acc, [meeting.meetingId]: meeting }), {}),
    schedule: schedule.map(adaptScheduleRow),
  };
}
