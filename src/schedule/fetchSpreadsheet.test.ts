import { fetchMeetingsSpreadsheet, fetchScheduleSpreadsheet } from "./fetchSpreadsheet";
import { ScheduleEnvironment } from "../config";

describe("fetchSpreadsheet", () => {
  it("schedule parsing works with example document", async () => {
    const spreadsheet = await fetchScheduleSpreadsheet({
      GOOGLE_SPREADSHEET_ID: "16U7bjY7d-Ba7iq9c7V4M1D9QVXWZilOo1XukeT6WpOE",
      SCHEDULE_SHEET_NAME: "IntegrationTest",
    } as ScheduleEnvironment);

    expect(spreadsheet).toEqual([
      {
        Start: "08:30:00",
        Title: "Break",
        Subtitle: "",
        Link: "",
        MeetingIds: ["2", "3"],
        ReservedIds: ["2", "3", "4", "5"],
        RandomJoin: true,
      },
      {
        Start: "09:00:00",
        Title: "Welcome",
        Subtitle: "Earthlings",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "09:05:00",
        Title: "Keynote",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "10:05:00",
        Title: "The Funnel",
        Subtitle: "",
        Link: "",
        MeetingIds: ["3"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "10:15:00",
        Title: "Break",
        Subtitle: "Lunch",
        Link: "",
        MeetingIds: ["1", "2", "3", "4"],
        ReservedIds: [],
        RandomJoin: true,
      },
      {
        Start: "10:30:00",
        Title: "Topic A",
        Subtitle: "",
        Link: "http://shouting.machine/topicA",
        MeetingIds: ["1"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "10:30:00",
        Title: "Topic B 1",
        Subtitle: "Poggers",
        Link: "http://shouting.machine/topicB",
        MeetingIds: ["2"],
        ReservedIds: ["2", "3"],
        RandomJoin: false,
      },
      {
        Start: "10:30:00",
        Title: "Topic B 2",
        Subtitle: "in the Chat",
        Link: "http://shouting.machine/topicB",
        MeetingIds: ["4"],
        ReservedIds: ["4", "5"],
        RandomJoin: false,
      },
      {
        Start: "12:00:00",
        Title: "Break",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: ["1", "2"],
        RandomJoin: true,
      },
    ]);
  });

  it("meetings parsing works with example document", async () => {
    const spreadsheet = await fetchMeetingsSpreadsheet({
      GOOGLE_SPREADSHEET_ID: "16U7bjY7d-Ba7iq9c7V4M1D9QVXWZilOo1XukeT6WpOE",
      MEETINGS_SHEET_NAME: "Meetings",
    } as ScheduleEnvironment);

    expect(spreadsheet).toEqual([
      {
        email: "retreat+zoom1@tngtech.com",
        joinUrl: "https://zoom.us/j/95508545228?pwd=abc",
        meetingId: "1",
      },
      {
        email: "retreat+zoom2@tngtech.com",
        joinUrl: "https://zoom.us/j/97331051569?pwd=def",
        meetingId: "2",
      },
      {
        email: "retreat+zoom1@tngtech.com",
        joinUrl: "https://zoom.us/j/95508545228?pwd=abc",
        meetingId: "3",
      },
      {
        email: "retreat+zoom2@tngtech.com",
        joinUrl: "https://zoom.us/j/97331051569?pwd=def",
        meetingId: "4",
      },
      {
        email: "retreat+zoom1@tngtech.com",
        joinUrl: "https://zoom.us/j/95508545228?pwd=abc",
        meetingId: "5",
      },
    ]);
  });
});
