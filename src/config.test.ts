import { parseConfig } from "./config";
import { config, DotenvConfigOutput } from "dotenv";

jest.mock("dotenv");
const mockConfig = config as jest.MockedFunction<typeof config>;

describe("'config' should", () => {
    it("throw Error if env is not processable", () => {
        mockConfig.mockImplementation(
            (): DotenvConfigOutput => {
                return { error: Error("foo") };
            },
        );

        expect(() => parseConfig()).toThrowError("foo");
    });

    it("throw Error if processed env does not contain correct structure", () => {
        mockConfig.mockImplementation(
            (): DotenvConfigOutput => {
                return { parsed: { UNKNOWN: "u" } };
            },
        );

        expect(() => parseConfig()).toThrowError(/Parsing env failed due to 'Invalid value undefined supplied to .*'\./);
    });

    it("return correctly parsed configuration", () => {
        const googleSpreadsheetId = "1";
        const virtualOfficeBaseUrl = "http://example.com";

        mockConfig.mockImplementation(
            (): DotenvConfigOutput => {
                return { parsed: { GOOGLE_SPREADSHEET_ID: googleSpreadsheetId, VIRTUAL_OFFICE_BASE_URL: virtualOfficeBaseUrl } };
            },
        );
        expect(parseConfig()).toStrictEqual({
            googleSpreadsheetId,
            virtualOfficeBaseUrl,
        });
    });
});
