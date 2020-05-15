import { fetchSpreadsheet } from "./fetchSpreadsheet";

describe("fetchSpreadsheet", () => {
    it("works with example document", async () => {
        const spreadsheetId = "16U7bjY7d-Ba7iq9c7V4M1D9QVXWZilOo1XukeT6WpOE";
        const sheetName = "IntegrationTest";

        const spreadsheet = await fetchSpreadsheet(spreadsheetId, sheetName);

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
});
