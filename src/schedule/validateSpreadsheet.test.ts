import { validateSpreadsheet } from "./validateSpreadsheet";
import { ScheduleSpreadsheet } from "./fetchSpreadsheet";
import { Violation } from "./ValidationError";
import { MeetingJoinUrls } from "./joinUrls";

function joinUrlsFor(meetingIds: string[]): MeetingJoinUrls {
  return meetingIds.reduce((agg, meetingId) => {
    agg[meetingId] = `http://zoom.us/joinMe/${meetingId}`;
    return agg;
  }, {} as MeetingJoinUrls);
}

describe("validateSpreadsheet", () => {
  function expectNoViolations(spreadsheet: ScheduleSpreadsheet, joinUrls: MeetingJoinUrls): void {
    try {
      validateSpreadsheet(spreadsheet, joinUrls);
    } catch (error) {
      fail(`expected no error, but got: ${error.message}`);
    }
  }

  function expectViolations(
    spreadsheet: ScheduleSpreadsheet,
    joinUrls: MeetingJoinUrls,
    violations: Violation[]
  ): void {
    try {
      validateSpreadsheet(spreadsheet, joinUrls);
      fail("expected validation error");
    } catch (error) {
      expect(error.violations).toEqual(violations);
    }
  }

  it("allows valid spreadsheet", () => {
    const spreadsheet = [
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
    ];

    const joinUrls = joinUrlsFor(["1", "2", "3", "4", "5"]);

    expectNoViolations(spreadsheet, joinUrls);
  });

  it("rejects empty sheet", () => {
    const joinUrls = joinUrlsFor([]);

    expectViolations([], joinUrls, [
      { group: "-", rule: "You are not allowed to upload a spreadsheet without any rows", locations: [] },
    ]);
  });

  it("allows rows with overlapping MeetingIds but different Start", () => {
    const spreadsheet = [
      {
        Start: "08:00:00",
        Title: "One",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1", "3"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "09:00:00",
        Title: "Two",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1", "2"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "09:00:00",
        Title: "Three",
        Subtitle: "",
        Link: "",
        MeetingIds: ["3"],
        ReservedIds: [],
        RandomJoin: false,
      },
    ];

    const joinUrls = joinUrlsFor(["1", "2", "3"]);

    expectNoViolations(spreadsheet, joinUrls);
  });

  it("rejects rows with overlapping MeetingIds and same Start", () => {
    const spreadsheet = [
      {
        Start: "08:00:00",
        Title: "One",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1", "3"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "08:00:00",
        Title: "Two",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1", "2"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "08:00:00",
        Title: "Three",
        Subtitle: "",
        Link: "",
        MeetingIds: ["3"],
        ReservedIds: [],
        RandomJoin: false,
      },
    ];
    const joinUrls = joinUrlsFor(["1", "2", "3"]);

    expectViolations(spreadsheet, joinUrls, [
      {
        group: "08:00:00",
        rule: "You cannot use overlapping MeetingIds during the same Start time",
        locations: ["One", "Two", "Three"],
      },
      {
        group: "08:00:00",
        rule: "You cannot use overlapping MeetingIds during the same Start time",
        locations: ["Two", "One"],
      },
      {
        group: "08:00:00",
        rule: "You cannot use overlapping MeetingIds during the same Start time",
        locations: ["Three", "One"],
      },
    ]);
  });

  it("allows rows with overlapping ReservedIds but different Start", () => {
    const spreadsheet = [
      {
        Start: "08:00:00",
        Title: "One",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: ["1", "3"],
        RandomJoin: false,
      },
      {
        Start: "09:00:00",
        Title: "Two",
        Subtitle: "",
        Link: "",
        MeetingIds: ["2"],
        ReservedIds: ["1", "2"],
        RandomJoin: false,
      },
      {
        Start: "09:00:00",
        Title: "Three",
        Subtitle: "",
        Link: "",
        MeetingIds: ["3"],
        ReservedIds: ["3"],
        RandomJoin: false,
      },
    ];
    const joinUrls = joinUrlsFor(["1", "2", "3"]);

    expectNoViolations(spreadsheet, joinUrls);
  });

  it("rejects rows with overlapping ReservedIds and same Start", () => {
    const spreadsheet = [
      {
        Start: "08:00:00",
        Title: "One",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: ["1", "3"],
        RandomJoin: false,
      },
      {
        Start: "08:00:00",
        Title: "Two",
        Subtitle: "",
        Link: "",
        MeetingIds: ["2"],
        ReservedIds: ["1", "2"],
        RandomJoin: false,
      },
      {
        Start: "08:00:00",
        Title: "Three",
        Subtitle: "",
        Link: "",
        MeetingIds: ["3"],
        ReservedIds: ["3"],
        RandomJoin: false,
      },
    ];
    const joinUrls = joinUrlsFor(["1", "2", "3"]);

    expectViolations(spreadsheet, joinUrls, [
      {
        group: "08:00:00",
        rule: "You cannot use overlapping ReservedIds during the same Start time",
        locations: ["One", "Two", "Three"],
      },
      {
        group: "08:00:00",
        rule: "You cannot use overlapping ReservedIds during the same Start time",
        locations: ["Two", "One"],
      },
      {
        group: "08:00:00",
        rule: "You cannot use overlapping ReservedIds during the same Start time",
        locations: ["Three", "One"],
      },
    ]);
  });

  it("allows rows with RandomJoin when no other row has the same Start", () => {
    const spreadsheet = [
      {
        Start: "08:00:00",
        Title: "One",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: [],
        RandomJoin: true,
      },
      {
        Start: "09:00:00",
        Title: "Two",
        Subtitle: "",
        Link: "",
        MeetingIds: ["2"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "10:00:00",
        Title: "Three",
        Subtitle: "",
        Link: "",
        MeetingIds: ["3"],
        ReservedIds: [],
        RandomJoin: true,
      },
    ];
    const joinUrls = joinUrlsFor(["1", "2", "3"]);

    expectNoViolations(spreadsheet, joinUrls);
  });

  it("rejects rows with RandomJoin when another row has the same Start", () => {
    const spreadsheet = [
      {
        Start: "08:00:00",
        Title: "One",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: [],
        RandomJoin: true,
      },
      {
        Start: "08:00:00",
        Title: "Two",
        Subtitle: "",
        Link: "",
        MeetingIds: ["2"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "10:00:00",
        Title: "Three",
        Subtitle: "",
        Link: "",
        MeetingIds: ["3"],
        ReservedIds: [],
        RandomJoin: true,
      },
    ];
    const joinUrls = joinUrlsFor(["1", "2", "3"]);

    expectViolations(spreadsheet, joinUrls, [
      {
        group: "08:00:00",
        rule: "You can only set RandomJoin to TRUE when no other row has the same Start time",
        locations: ["One", "Two"],
      },
    ]);
  });

  it("rejects unknown meeting ids", () => {
    const spreadsheet = [
      {
        Start: "08:00:00",
        Title: "One",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: [],
        RandomJoin: true,
      },
    ];
    const joinUrls = joinUrlsFor(["2"]);

    expectViolations(spreadsheet, joinUrls, [
      {
        group: "08:00:00",
        rule: "There's no join URL for meeting with id 1 configured.",
        locations: ["One"],
      },
    ]);
  });
  it("rejects unknown reserve meeting ids", () => {
    const spreadsheet = [
      {
        Start: "08:00:00",
        Title: "One",
        Subtitle: "",
        Link: "",
        MeetingIds: ["2"],
        ReservedIds: ["1"],
        RandomJoin: true,
      },
    ];
    const joinUrls = joinUrlsFor(["2"]);

    expectViolations(spreadsheet, joinUrls, [
      {
        group: "08:00:00",
        rule: "There's no join URL for reserve meeting with id 1 configured.",
        locations: ["One"],
      },
    ]);
  });
});
