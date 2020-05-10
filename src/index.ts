#!/usr/bin/env node

import { Configuration, parseConfig } from "./config";
import chalk from "chalk";

const main = (): void => {
    const config = getConfigOrExit();

    console.log(config);
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
