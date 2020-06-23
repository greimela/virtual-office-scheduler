import { parseCreateMeetingsConfig, parseScheduleConfig } from "./config";
import { config, DotenvConfigOutput } from "dotenv";

jest.mock("dotenv");
const mockConfig = config as jest.MockedFunction<typeof config>;

describe("'config' should", () => {
  it("throw Error if env is not processable", () => {
    mockConfig.mockImplementation(
      (): DotenvConfigOutput => {
        return { error: Error("foo") };
      }
    );

    expect(() => parseScheduleConfig()).toThrowError("foo");
  });

  it("throw Error if processed env does not contain correct structure", () => {
    mockConfig.mockImplementation(
      (): DotenvConfigOutput => {
        return { parsed: { UNKNOWN: "u" } };
      }
    );

    expect(() => parseScheduleConfig()).toThrowError(
      /Parsing dotenv config failed: Invalid value undefined supplied to .*/
    );
  });

  it("return correctly parsed schedule configuration", () => {
    const env = {
      GOOGLE_SPREADSHEET_ID: "1",
      SCHEDULE_SHEET_NAME: "Day 1",
      MEETINGS_SHEET_NAME: "Meetings",
      VIRTUAL_OFFICE_BASE_URL: "http://example.com",
      VIRTUAL_OFFICE_USERNAME: "username",
      VIRTUAL_OFFICE_PASSWORD: "password",
      GOOGLE_SERVICE_ACCOUNT_MAIL: "a@b.com",
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: "",
      ENABLE_ROOM_JOIN_MINUTES_BEFORE_START: "5",
      SLACK_BASE_URL: "https://<your-domain>.slack.com",
      SLACK_TOKEN: "xoxb-token",
      SLACK_ENABLE_RATE_LIMITING: "false",
    };

    mockConfig.mockImplementation(
      (): DotenvConfigOutput => {
        return { parsed: env };
      }
    );

    expect(parseScheduleConfig()).toStrictEqual(env);
  });

  it("return correctly parsed create meeting configuration", () => {
    const env = {
      GOOGLE_SPREADSHEET_ID: "1",
      MEETINGS_SHEET_NAME: "Meetings",
      ZOOM_JWT: "secret",
      USER_EMAIL_FILE: "./emails.txt",
      MEETING_TOPIC: "my meeting",
      MEETING_PASSWORD: "secret",
      MEETING_START_TIME: "09:00",
      MEETING_DURATION: "720",
      GOOGLE_SERVICE_ACCOUNT_MAIL: "a@b.com",
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: "",
      ENABLE_ROOM_JOIN_MINUTES_BEFORE_START: "",
    };

    mockConfig.mockImplementation(
      (): DotenvConfigOutput => {
        return { parsed: env };
      }
    );

    expect(parseCreateMeetingsConfig()).toStrictEqual(env);
  });
});
