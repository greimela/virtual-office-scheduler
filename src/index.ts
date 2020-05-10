#!/usr/bin/env node

import { Configuration, parseConfig } from "./config";
import chalk from "chalk";
import { getTimetable } from "./timetable";

const main = (): void => {
    const config = getConfigOrExit();

    getTimetable(config.googleSpreadsheetId)
        .then(console.log);
};

const getConfigOrExit = (): Configuration => {
    try {
        return parseConfig();
    } catch (e) {
        console.log(chalk.red(e));
        process.exit(1);
    }
};

main();
