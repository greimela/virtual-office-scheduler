import axios from "axios";
import parse from "csv-parse/lib/sync";
import * as t from "io-ts";
import { isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";
import { CastingContext } from "csv-parse";

import { Environment } from "../config";
import { logger } from "../log";

const SpreadsheetRowCodec = t.type({
  Start: t.string,
  Title: t.string,
  Subtitle: t.string,
  Link: t.string,
  MeetingIds: t.array(t.string),
  ReservedIds: t.array(t.string),
  RandomJoin: t.boolean,
});
const SpreadsheetCodec = t.array(SpreadsheetRowCodec);

export type Spreadsheet = t.TypeOf<typeof SpreadsheetCodec>;
export type SpreadsheetRow = t.TypeOf<typeof SpreadsheetRowCodec>;

export async function fetchSpreadsheet(config: Environment): Promise<Spreadsheet> {
  const googleSpreadsheetId = config.GOOGLE_SPREADSHEET_ID;
  const googleSheetName = config.GOOGLE_SHEET_NAME;
  const url = `https://docs.google.com/spreadsheets/u/0/d/${googleSpreadsheetId}/gviz/tq?tqx=out:csv&sheet=${googleSheetName}`;
  logger.info("Downloading spreadsheet from Google Docs", { url });

  const response = await axios.get(url);
  const csv = await response.data;

  logger.info("Parsing received CSV document", { csv });
  return parseSpreadsheetCsv(csv);
}

async function parseSpreadsheetCsv(data: string): Promise<Spreadsheet> {
  const parseResult = await parse(data, {
    cast: castValue,
    columns: true,
    // eslint-disable-next-line @typescript-eslint/camelcase
    skip_empty_lines: true,
    trim: true,
  });

  const spreadsheet = SpreadsheetCodec.decode(parseResult);
  if (isLeft(spreadsheet)) {
    throw Error(`Parsing spreadsheet failed due to '${PathReporter.report(spreadsheet)}'.`);
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
