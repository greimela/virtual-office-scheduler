import fetch from "node-fetch";
import parse from "csv-parse/lib/sync";
import * as t from "io-ts";
import { parseTime, Time } from "./time";
import { isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";

export type Timetable = Activity[];

export interface Activity {
    startTime: Time | undefined;
    endTime: Time | undefined;
    name: string;
}

export const getTimetable = (googleSpreadsheetId: string): Promise<Timetable> => {
    return fetch(`https://docs.google.com/spreadsheets/u/0/d/${googleSpreadsheetId}/export?format=csv`, { method: "GET" })
        .then((res) => res.text())
        .then((text) =>
            parse(text, {
                // eslint-disable-next-line @typescript-eslint/camelcase
                cast_date: true,
                columns: true,
                // eslint-disable-next-line @typescript-eslint/camelcase
                skip_empty_lines: true,
                trim: true,
            }),
        )
        .then((v) => {
            const spreadsheet = SpreadsheetCodec.decode(v);
            if (isRight(spreadsheet)) {
                return spreadsheet.right;
            }
            throw Error(`Parsing spreadsheet failed due to '${PathReporter.report(spreadsheet)}'.`);
        })
        .then(mapActivities);
};

const SpreadsheetCodec = t.array(
    t.type(
        {
            Zeit: t.string,
            Name: t.string,
            Session: t.string,
        },
        "SpreadsheetRow",
    ),
    "Spreadsheet",
);

const mapActivities = (spreadsheet: t.TypeOf<typeof SpreadsheetCodec>): Timetable => {
    return spreadsheet.map((row, i, spreadsheet) => ({
        name: row.Name,
        startTime: parseTime(row.Zeit),
        endTime: i + 1 < spreadsheet.length ? parseTime(spreadsheet[i + 1].Zeit) : undefined,
    }));
};
