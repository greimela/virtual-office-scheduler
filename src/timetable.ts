import fetch from "node-fetch";
import parse from "csv-parse/lib/sync";
import * as t from "io-ts";
import { isRight } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";

export const getTimetable = (googleSpreadsheetId: string): Promise<t.TypeOf<typeof SpreadsheetCodec>> => {
    return fetch(`https://docs.google.com/spreadsheets/u/0/d/${googleSpreadsheetId}/export?format=csv`, { method: "GET" })
        .then((res) => res.text())
        .then((text) =>
            parse(text, {
                cast_date: true,
                columns: true,
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
        });
};

const SpreadsheetCodec = t.array(
    t.type(
        {
            Zeit: t.string,
            Name: t.string,
            Session: t.string,
        },
        "SpreadsheetColumn",
    ),
    "Spreadsheet",
);
