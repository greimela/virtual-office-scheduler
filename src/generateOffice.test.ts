import { Environment } from "./config";
import { generateOffice } from "./generateOffice";

describe("generateOffice", () => {
  it("works with valid spreadsheet", () => {
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

    const office = generateOffice({ MEETING_PASSWORD: "secret" } as Environment, spreadsheet);
    expect(office).toEqual({
      rooms: [
        {
          roomId: "group-08:30:00:room-2",
          meetingId: "2",
          groupId: "group-08:30:00",
          name: "Break (1)",
          joinUrl: "https://zoom.us/s/2?pwd=secret",
        },
        {
          roomId: "group-08:30:00:room-3",
          meetingId: "3",
          groupId: "group-08:30:00",
          name: "Break (2)",
          joinUrl: "https://zoom.us/s/3?pwd=secret",
        },
        {
          roomId: "group-09:00:00:room-1",
          meetingId: "1",
          groupId: "group-09:00:00",
          name: "Welcome",
          joinUrl: "https://zoom.us/s/1?pwd=secret",
        },
        {
          roomId: "group-09:05:00:room-1",
          meetingId: "1",
          groupId: "group-09:05:00",
          name: "Keynote",
          joinUrl: "https://zoom.us/s/1?pwd=secret",
        },
        {
          roomId: "group-10:05:00:room-3",
          meetingId: "3",
          groupId: "group-10:05:00",
          name: "The Funnel",
          joinUrl: "https://zoom.us/s/3?pwd=secret",
        },
        {
          roomId: "group-10:15:00:room-1",
          meetingId: "1",
          groupId: "group-10:15:00",
          name: "Break (1)",
          joinUrl: "https://zoom.us/s/1?pwd=secret",
        },
        {
          roomId: "group-10:15:00:room-2",
          meetingId: "2",
          groupId: "group-10:15:00",
          name: "Break (2)",
          joinUrl: "https://zoom.us/s/2?pwd=secret",
        },
        {
          roomId: "group-10:15:00:room-3",
          meetingId: "3",
          groupId: "group-10:15:00",
          name: "Break (3)",
          joinUrl: "https://zoom.us/s/3?pwd=secret",
        },
        {
          roomId: "group-10:15:00:room-4",
          meetingId: "4",
          groupId: "group-10:15:00",
          name: "Break (4)",
          joinUrl: "https://zoom.us/s/4?pwd=secret",
        },
        {
          roomId: "group-10:30:00:room-1",
          meetingId: "1",
          groupId: "group-10:30:00",
          name: "Topic A",
          joinUrl: "https://zoom.us/s/1?pwd=secret",
        },
        {
          roomId: "group-10:30:00:room-2",
          meetingId: "2",
          groupId: "group-10:30:00",
          name: "Topic B 1",
          joinUrl: "https://zoom.us/s/2?pwd=secret",
        },
        {
          roomId: "group-10:30:00:room-4",
          meetingId: "4",
          groupId: "group-10:30:00",
          name: "Topic B 2",
          joinUrl: "https://zoom.us/s/4?pwd=secret",
        },
        {
          roomId: "group-12:00:00:room-1",
          meetingId: "1",
          groupId: "group-12:00:00",
          name: "Break",
          joinUrl: "https://zoom.us/s/1?pwd=secret",
        },
      ],
      groups: [
        {
          id: "group-08:30:00",
          name: "08:30:00",
          groupJoin: {
            minimumParticipantCount: 5,
            description:
              "You can randomly join one of our coffee rooms. Try it out and meet interesting new people! :)",
          },
          startTime: "2020-05-22T08:30:00.000+02:00",
          endTime: "2020-05-22T09:00:00.000+02:00",
        },
        {
          id: "group-09:00:00",
          name: "09:00:00",
          startTime: "2020-05-22T09:00:00.000+02:00",
          endTime: "2020-05-22T09:05:00.000+02:00",
        },
        {
          id: "group-09:05:00",
          name: "09:05:00",
          startTime: "2020-05-22T09:05:00.000+02:00",
          endTime: "2020-05-22T10:05:00.000+02:00",
        },
        {
          id: "group-10:05:00",
          name: "10:05:00",
          startTime: "2020-05-22T10:05:00.000+02:00",
          endTime: "2020-05-22T10:15:00.000+02:00",
        },
        {
          id: "group-10:15:00",
          name: "10:15:00",
          groupJoin: {
            minimumParticipantCount: 5,
            description:
              "You can randomly join one of our coffee rooms. Try it out and meet interesting new people! :)",
          },
          startTime: "2020-05-22T10:15:00.000+02:00",
          endTime: "2020-05-22T10:30:00.000+02:00",
        },
        {
          id: "group-10:30:00",
          name: "10:30:00",
          startTime: "2020-05-22T10:30:00.000+02:00",
          endTime: "2020-05-22T12:00:00.000+02:00",
        },
        {
          id: "group-12:00:00",
          name: "12:00:00",
          groupJoin: {
            minimumParticipantCount: 5,
            description:
              "You can randomly join one of our coffee rooms. Try it out and meet interesting new people! :)",
          },
          startTime: "2020-05-22T12:00:00.000+02:00",
          endTime: "2020-05-22T23:59:59.000+02:00",
        },
      ],
    });
  });
});
