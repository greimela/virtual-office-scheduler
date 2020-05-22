import { config } from "dotenv";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { isLeft } from "fp-ts/lib/Either";

import { logger } from "./log";

const EnvironmentCodec = t.type({
  GOOGLE_SPREADSHEET_ID: t.string,
  GOOGLE_SHEET_NAME: t.string,
  VIRTUAL_OFFICE_BASE_URL: t.string,
  VIRTUAL_OFFICE_USERNAME: t.string,
  VIRTUAL_OFFICE_PASSWORD: t.string,
});

export type Environment = t.TypeOf<typeof EnvironmentCodec>;

/**
 * @throws {Error} if env could not be processed or env does not have the correct structure
 */
export function parseConfig(): Environment {
  logger.info("Loading dotenv config from context");
  const result = config();
  if (result.error) {
    throw result.error;
  }

  const configuration = EnvironmentCodec.decode(result.parsed);
  if (isLeft(configuration)) {
    throw Error(`Parsing dotenv config failed: ${PathReporter.report(configuration)}`);
  }

  const env = configuration.right;
  logger.info("Successfully parsed dotenv config", env);
  return env;
}
