#!/usr/bin/env node

import { Configuration, parseConfig } from "./config";
import chalk from "chalk";
import fetch from "node-fetch";

const main = (): void => {
    const config = getConfigOrExit();

    fetch(`https://docs.google.com/spreadsheets/u/0/d/${config.googleSpreadsheetId}/export?format=csv`, { method: "GET" })
        .then((res) => res.text())
        .then((json) => console.log(json));
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
