import { ScheduleEnvironment } from "../config";
import {
  fetchScheduleSpreadsheet,
  RawFreizeitSpreadsheetRow,
  RawFullDayTopicRow,
  RawHalfDayTopicRow,
  RawMeetingsSpreadsheetRow,
  RawScheduleSpreadsheetRow,
} from "./getGoogleSpreadsheet";
import { RoomLink } from "./generateOffice";
import { extractLinks } from "./extractLinks";

export type MeetingDictionary = { [meetingId: string]: MeetingsSpreadsheetRow };
export type ScheduleSpreadsheet = ScheduleSpreadsheetRow[];

export interface ScheduleSpreadsheetRow {
  Start: string;
  Title: string;
  MeetingIds: string[];
  JoinUrl: string;
  AlwaysActive: boolean;
}

export interface MeetingsSpreadsheetRow {
  email: string;
  meetingId: string;
  joinUrl: string;
  hostKey: string;
}

export interface FreizeitSpreadsheetRow {
  Title: string;
  Day: string;
  Start: string;
  End: string;
  MeetingIds: string[];
  JoinUrl: string;
  AlwaysActive: boolean;
}

export interface FullDayTopic {
  type: "FULL_DAY";
  title: string;
  links: RoomLink[];
  meetingIds: string[];
  openForNewbies: boolean;
}

export interface HalfDayTopic {
  type: "HALF_DAY";
  title: string;
  links: RoomLink[];
  meetingIds: string[];
  slot: "MORNING" | "AFTERNOON";
  openForNewbies: boolean;
}

export type Topic = FullDayTopic | HalfDayTopic;

export interface SpreadsheetData {
  schedule: ScheduleSpreadsheet;
  meetings: MeetingDictionary;
  topics: Topic[];
  freizeit: FreizeitSpreadsheetRow[];
}

function adaptScheduleRow(raw: RawScheduleSpreadsheetRow): ScheduleSpreadsheetRow {
  function splitByComma(value: string): string[] {
    return !value || value.length === 0 ? [] : value.split(",");
  }

  return {
    Start: raw.Start,
    Title: raw.Title,
    MeetingIds: splitByComma(raw.MeetingIds),
    JoinUrl: raw.JoinUrl,
    AlwaysActive: raw.AlwaysActive === "TRUE",
  };
}

function adaptFreizeitRow(raw: RawFreizeitSpreadsheetRow): FreizeitSpreadsheetRow {
  function splitByComma(value: string): string[] {
    return !value || value.length === 0 ? [] : value.split(",");
  }

  return {
    Title: raw.Title,
    Day: raw.Day,
    Start: raw.Start,
    End: raw.End,
    MeetingIds: splitByComma(raw.MeetingIds),
    JoinUrl: raw.JoinUrl,
    AlwaysActive: raw.AlwaysActive === "TRUE",
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

function isValidSlot(slot: string): slot is "MORNING" | "AFTERNOON" {
  return slot === "MORNING" || slot === "AFTERNOON";
}

function adaptFullDayTopicRow(raw: RawFullDayTopicRow): FullDayTopic {
  function splitByComma(value: string): string[] {
    return !value || value.length === 0 ? [] : value.split(",");
  }

  return {
    type: "FULL_DAY",
    title: raw.Title,
    meetingIds: splitByComma(raw.MeetingIds),
    links: extractLinks(raw.Links),
    openForNewbies: raw.OpenForNewbies === "TRUE",
  };
}

function adaptHalfDayTopicRow(raw: RawHalfDayTopicRow): HalfDayTopic {
  function splitByComma(value: string): string[] {
    return !value || value.length === 0 ? [] : value.split(",");
  }

  if (!isValidSlot(raw.Slot)) {
    throw new Error("No valid slot");
  }

  return {
    type: "HALF_DAY",
    title: raw.Title,
    meetingIds: splitByComma(raw.MeetingIds),
    links: extractLinks(raw.Links),
    slot: raw.Slot,
    openForNewbies: raw.OpenForNewbies === "TRUE",
  };
}

export async function fetchSpreadsheet(config: ScheduleEnvironment): Promise<SpreadsheetData> {
  const { schedule, meetings, fullDayTopics, halfDayTopics, freizeit } = await fetchScheduleSpreadsheet(config);

  return {
    meetings: meetings.map(adaptMeetingsRow).reduce((acc, meeting) => ({ ...acc, [meeting.meetingId]: meeting }), {}),
    schedule: schedule.map(adaptScheduleRow),
    freizeit: freizeit.map(adaptFreizeitRow),
    topics: [...fullDayTopics.map(adaptFullDayTopicRow), ...halfDayTopics.map(adaptHalfDayTopicRow)],
  };
}
