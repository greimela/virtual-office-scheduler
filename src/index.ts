#!/usr/bin/env node

import dotenv from "dotenv";

const result = dotenv.config();
if (result.error) {
    console.log(`Configuration error '${result.error}.`);
    process.exit(1);
}
console.log(result.parsed);
