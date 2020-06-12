import axios from "axios";
import parse from "csv-parse/lib/sync";
import * as t from "io-ts";
import { isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { CastingContext } from "csv-parse";

import { Environment } from "../config";
import { logger } from "../log";

const csvParseOptions = {
  cast: castValue,
  columns: true,
  // eslint-disable-next-line @typescript-eslint/camelcase
  skip_empty_lines: true,
  trim: true,
};

const ScheduleSpreadsheetRowCodec = t.type({
  Start: t.string,
  Title: t.string,
  Subtitle: t.string,
  Link: t.string,
  MeetingIds: t.array(t.string),
  ReservedIds: t.array(t.string),
  RandomJoin: t.boolean,
});
const ScheduleSpreadsheetCodec = t.array(ScheduleSpreadsheetRowCodec);

export type ScheduleSpreadsheet = t.TypeOf<typeof ScheduleSpreadsheetCodec>;
export type ScheduleSpreadsheetRow = t.TypeOf<typeof ScheduleSpreadsheetRowCodec>;

const MeetingSpreadsheetRowCodec = t.type({
  email: t.string,
  meetingId: t.string,
  joinUrl: t.string,
});

const MeetingSpreadsheetCodec = t.array(MeetingSpreadsheetRowCodec);
export type MeetingSpreadsheet = t.TypeOf<typeof MeetingSpreadsheetCodec>;
export type MeetingSpreadsheetRow = t.TypeOf<typeof MeetingSpreadsheetRowCodec>;

export async function downloadSpreadsheet(spreadsheetId: string, sheetName: string): Promise<any> {
  const url = `https://docs.google.com/spreadsheets/u/0/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
  logger.info("Downloading spreadsheet from Google Docs", { url });

  const response = await axios.get(url);
  return response.data;
}

export async function fetchScheduleSpreadsheet(config: Environment): Promise<ScheduleSpreadsheet> {
  const csv = await downloadSpreadsheet(config.GOOGLE_SPREADSHEET_ID, config.SCHEDULE_SHEET_NAME);

  logger.info("Parsing received CSV document", { csv });
  return parseScheduleCsv(csv);
}

export async function fetchMeetingsSpreadsheet(config: Environment): Promise<MeetingSpreadsheet> {
  const csv = await downloadSpreadsheet(config.GOOGLE_SPREADSHEET_ID, config.MEETINGS_SHEET_NAME);

  logger.info("Parsing received CSV document", { csv });
  return parseMeetingCsv(csv);
}

async function parseScheduleCsv(data: string): Promise<ScheduleSpreadsheet> {
  const parseResult = await parse(data, csvParseOptions);

  const spreadsheet = ScheduleSpreadsheetCodec.decode(parseResult);
  if (isLeft(spreadsheet)) {
    throw Error(`Parsing schedule spreadsheet failed due to '${PathReporter.report(spreadsheet)}'.`);
  }

  return spreadsheet.right;
}

async function parseMeetingCsv(data: string): Promise<MeetingSpreadsheet> {
  const parseResult = await parse(data, csvParseOptions);

  const spreadsheet = MeetingSpreadsheetCodec.decode(parseResult);
  if (isLeft(spreadsheet)) {
    throw Error(`Parsing meeting spreadsheet failed due to '${PathReporter.report(spreadsheet)}'.`);
  }

  return spreadsheet.right;
}

function castValue(value: any, context: CastingContext): any {
  switch (context.column) {
    case "MeetingIds":
    case "ReservedIds":
      return value.split(",").filter((value: any) => !!value);
    case "RandomJoin":
      return value === "TRUE";
    default:
      return value;
  }
}
