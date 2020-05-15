import { config } from "dotenv";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import { isLeft } from "fp-ts/lib/Either";

const EnvironmentCodec = t.type({
    GOOGLE_SPREADSHEET_ID: t.string,
    GOOGLE_SHEET_NAME: t.string,
    VIRTUAL_OFFICE_BASE_URL: t.string,
});

type Environment = t.TypeOf<typeof EnvironmentCodec>;

/**
 * @throws {Error} if env could not be processed or env does not have the correct structure
 */
export function parseConfig(): Environment {
    const result = config();
    if (result.error) {
        throw result.error;
    }

    const configuration = EnvironmentCodec.decode(result.parsed);
    if (isLeft(configuration)) {
        throw Error(`Parsing env failed due to '${PathReporter.report(configuration)}'.`);
    }

    return configuration.right;
}
