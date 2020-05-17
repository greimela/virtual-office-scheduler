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
        const env = {
            GOOGLE_SPREADSHEET_ID: "1",
            GOOGLE_SHEET_NAME: "Day 1",
            VIRTUAL_OFFICE_BASE_URL: "http://example.com",
            VIRTUAL_OFFICE_USERNAME: "username",
            VIRTUAL_OFFICE_PASSWORD: "password",
        };

        mockConfig.mockImplementation(
            (): DotenvConfigOutput => {
                return { parsed: env };
            },
        );

        expect(parseConfig()).toStrictEqual(env);
    });
});
