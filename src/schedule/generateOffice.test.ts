import { generateOffice, GenerateOfficeConfig } from "./generateOffice";
import fakeTimers, { InstalledClock } from "@sinonjs/fake-timers";
import { MeetingJoinUrls } from "./joinUrls";

function joinUrlsFor(meetingIds: string[]): MeetingJoinUrls {
  return meetingIds.reduce((agg, meetingId) => {
    agg[meetingId] = `http://zoom.us/joinMe/${meetingId}`;
    return agg;
  }, {} as MeetingJoinUrls);
}

describe("generateOffice", () => {
  let clock: InstalledClock;
  const config: GenerateOfficeConfig = { ENABLE_ROOM_JOIN_MINUTES_BEFORE_START: "5" };

  afterEach(() => {
    clock.uninstall();
  });

  beforeEach(() => {
    clock = fakeTimers.install({ now: 1590130800000 });
  });

  it("works with valid spreadsheet", () => {
    const spreadsheet = [
      {
        Start: "08:30",
        Title: "Break",
        Subtitle: "",
        Link: "",
        MeetingIds: ["2", "3"],
        ReservedIds: ["2", "3", "4", "5"],
        RandomJoin: true,
      },
      {
        Start: "09:00",
        Title: "Welcome",
        Subtitle: "Earthlings",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "09:05",
        Title: "Keynote",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "10:05",
        Title: "The Funnel",
        Subtitle: "",
        Link: "",
        MeetingIds: ["3"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "10:15",
        Title: "Break",
        Subtitle: "Lunch",
        Link: "",
        MeetingIds: ["1", "2", "3", "4"],
        ReservedIds: [],
        RandomJoin: true,
      },
      {
        Start: "10:30",
        Slot: "A1",
        Title: "Topic A",
        Subtitle: "",
        Link: "[Topic A](http://shouting.machine/topicA)",
        MeetingIds: ["1"],
        ReservedIds: [],
        RandomJoin: false,
      },
      {
        Start: "10:30",
        Slot: "A2",
        Title: "Topic B 1",
        Subtitle: "Poggers",
        Link: "[Topic B](http://shouting.machine/topicB)",
        MeetingIds: ["2"],
        ReservedIds: ["2", "3"],
        RandomJoin: false,
      },
      {
        Start: "10:30",
        Slot: "A3",
        Title: "Topic B 2",
        Subtitle: "in the Chat",
        Link: "[Topic B](http://shouting.machine/topicB)",
        MeetingIds: ["4"],
        ReservedIds: ["4", "5"],
        RandomJoin: false,
      },
      {
        Start: "12:00",
        Title: "Break",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: ["1", "2"],
        RandomJoin: true,
      },
    ];

    const joinUrls = joinUrlsFor(["1", "2", "3", "4", "5"]);

    const office = generateOffice(spreadsheet, joinUrls, config);
    const groupJoinDescription =
      'Wenn ihr mögt, könnt ihr durch den untenstehenden "Join"-Button einem zufällig ausgewählten Raum beitreten.';
    expect(office).toEqual({
      rooms: [
        {
          roomId: "group-08:30:room-2",
          meetingId: "2",
          groupId: "group-08:30",
          name: "(1) Break",
          subtitle: "",
          joinUrl: joinUrls["2"],
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-08:30:room-3",
          meetingId: "3",
          groupId: "group-08:30",
          name: "(2) Break",
          subtitle: "",
          joinUrl: joinUrls["3"],
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-09:00:room-1",
          meetingId: "1",
          groupId: "group-09:00",
          name: "Welcome",
          subtitle: "Earthlings",
          joinUrl: joinUrls["1"],
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-09:05:room-1",
          meetingId: "1",
          groupId: "group-09:05",
          name: "Keynote",
          subtitle: "",
          joinUrl: joinUrls["1"],
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-10:05:room-3",
          meetingId: "3",
          groupId: "group-10:05",
          name: "The Funnel",
          subtitle: "",
          joinUrl: joinUrls["3"],
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-10:15:room-1",
          meetingId: "1",
          groupId: "group-10:15",
          name: "(1) Break",
          subtitle: "Lunch",
          joinUrl: joinUrls["1"],
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-10:15:room-2",
          meetingId: "2",
          groupId: "group-10:15",
          name: "(2) Break",
          subtitle: "Lunch",
          joinUrl: joinUrls["2"],
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-10:15:room-3",
          meetingId: "3",
          groupId: "group-10:15",
          name: "(3) Break",
          subtitle: "Lunch",
          joinUrl: joinUrls["3"],
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-10:15:room-4",
          meetingId: "4",
          groupId: "group-10:15",
          name: "(4) Break",
          subtitle: "Lunch",
          joinUrl: joinUrls["4"],
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-10:30:room-1",
          meetingId: "1",
          groupId: "group-10:30",
          name: "A1 Topic A",
          subtitle: "",
          joinUrl: joinUrls["1"],
          links: [
            {
              text: "Topic A",
              href: "http://shouting.machine/topicA",
            },
          ],
          hasSlackChannel: true,
        },
        {
          roomId: "group-10:30:room-2",
          meetingId: "2",
          groupId: "group-10:30",
          name: "A2 Topic B 1",
          subtitle: "Poggers",
          joinUrl: joinUrls["2"],
          links: [
            {
              text: "Topic B",
              href: "http://shouting.machine/topicB",
            },
          ],
          hasSlackChannel: true,
        },
        {
          roomId: "group-10:30:room-4",
          meetingId: "4",
          groupId: "group-10:30",
          name: "A3 Topic B 2",
          subtitle: "in the Chat",
          joinUrl: joinUrls["4"],
          links: [
            {
              text: "Topic B",
              href: "http://shouting.machine/topicB",
            },
          ],
          hasSlackChannel: true,
        },
        {
          roomId: "group-12:00:room-1",
          meetingId: "1",
          groupId: "group-12:00",
          name: "Break",
          subtitle: "",
          joinUrl: joinUrls["1"],
          links: [],
          hasSlackChannel: false,
        },
      ],
      groups: [
        {
          id: "group-08:30",
          name: "08:30",
          groupJoin: {
            minimumParticipantCount: 5,
            title: "Break",
            subtitle: "",
            description: groupJoinDescription,
          },
          disabledBefore: "2020-05-22T08:30:00.000+02:00",
          disabledAfter: "2020-05-22T09:00:00.000+02:00",
          joinableAfter: "2020-05-22T08:25:00.000+02:00",
        },
        {
          id: "group-09:00",
          name: "09:00",
          disabledBefore: "2020-05-22T09:00:00.000+02:00",
          disabledAfter: "2020-05-22T09:05:00.000+02:00",
          joinableAfter: "2020-05-22T08:55:00.000+02:00",
        },
        {
          id: "group-09:05",
          name: "09:05",
          disabledBefore: "2020-05-22T09:05:00.000+02:00",
          disabledAfter: "2020-05-22T10:05:00.000+02:00",
          joinableAfter: "2020-05-22T09:00:00.000+02:00",
        },
        {
          id: "group-10:05",
          name: "10:05",
          disabledBefore: "2020-05-22T10:05:00.000+02:00",
          disabledAfter: "2020-05-22T10:15:00.000+02:00",
          joinableAfter: "2020-05-22T10:00:00.000+02:00",
        },
        {
          id: "group-10:15",
          name: "10:15",
          groupJoin: {
            minimumParticipantCount: 5,
            title: "Break",
            subtitle: "Lunch",
            description: groupJoinDescription,
          },
          disabledBefore: "2020-05-22T10:15:00.000+02:00",
          disabledAfter: "2020-05-22T10:30:00.000+02:00",
          joinableAfter: "2020-05-22T10:10:00.000+02:00",
        },
        {
          id: "group-10:30",
          name: "10:30",
          disabledBefore: "2020-05-22T10:30:00.000+02:00",
          disabledAfter: "2020-05-22T12:00:00.000+02:00",
          joinableAfter: "2020-05-22T10:25:00.000+02:00",
        },
        {
          id: "group-12:00",
          name: "12:00",
          groupJoin: {
            minimumParticipantCount: 5,
            title: "Break",
            subtitle: "",
            description: groupJoinDescription,
          },
          disabledBefore: "2020-05-22T12:00:00.000+02:00",
          disabledAfter: "2020-05-22T23:59:59.000+02:00",
          joinableAfter: "2020-05-22T11:55:00.000+02:00",
        },
      ],
    });
  });
});
