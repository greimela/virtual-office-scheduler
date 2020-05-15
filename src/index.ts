#!/usr/bin/env node

import { parseConfig } from "./config";
import { getTimetable } from "./timetable";
import fetch from "node-fetch";

async function main(): Promise<void> {
    const config = parseConfig();

    const timetable = await getTimetable(config.googleSpreadsheetId);
    console.log(timetable);

    const health = await fetch(`${config.virtualOfficeBaseUrl}/api/monitoring/health`, { method: "GET" });
    console.log(await health.text());
}

main();
