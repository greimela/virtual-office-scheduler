import { generateOffice } from "./generateOffice";
import fakeTimers, { InstalledClock } from "@sinonjs/fake-timers";
import { MeetingDictionary } from "./fetchSpreadsheet";

function meetingsFor(meetingIds: string[]): MeetingDictionary {
  return meetingIds.reduce((agg, meetingId) => {
    agg[meetingId] = {
      hostKey: meetingId,
      meetingId,
      email: `email${meetingId}`,
      joinUrl: `http://zoom.us/joinMe/${meetingId}`,
    };
    return agg;
  }, {} as MeetingDictionary);
}

describe("generateOffice", () => {
  let clock: InstalledClock;
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
        OpenEnd: true,
      },
      {
        Start: "09:00",
        Title: "Welcome",
        Subtitle: "Earthlings",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: [],
        RandomJoin: false,
        OpenEnd: false,
      },
      {
        Start: "09:05",
        Title: "Keynote",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: [],
        RandomJoin: false,
        OpenEnd: false,
      },
      {
        Start: "10:05",
        Title: "The Funnel",
        Subtitle: "",
        Link: "",
        MeetingIds: ["3"],
        ReservedIds: [],
        RandomJoin: false,
        OpenEnd: false,
      },
      {
        Start: "10:15",
        Title: "Break",
        Subtitle: "Lunch",
        Link: "",
        MeetingIds: ["1", "2", "3", "4"],
        ReservedIds: [],
        RandomJoin: true,
        OpenEnd: false,
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
        OpenEnd: false,
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
        OpenEnd: false,
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
        OpenEnd: false,
      },
      {
        Start: "12:00",
        Title: "Break",
        Subtitle: "",
        Link: "",
        MeetingIds: ["1"],
        ReservedIds: ["1", "2"],
        RandomJoin: true,
        OpenEnd: false,
      },
    ];

    const meetings = meetingsFor(["1", "2", "3", "4", "5"]);
    const config = { ENABLE_ROOM_JOIN_MINUTES_BEFORE_START: "5" };

    const office = generateOffice(spreadsheet, meetings, config);
    const groupJoinDescription =
      'Wenn ihr mögt, könnt ihr durch den rechts stehenden "Join"-Button einem zufällig ausgewählten Raum beitreten.';
    expect(office).toEqual({
      rooms: [
        {
          roomId: "group-08:30:room-2",
          meetingId: "2",
          groupId: "group-08:30",
          name: "(1) Break",
          subtitle: "",
          joinUrl: meetings["2"].joinUrl,
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-08:30:room-3",
          meetingId: "3",
          groupId: "group-08:30",
          name: "(2) Break",
          subtitle: "",
          joinUrl: meetings["3"].joinUrl,
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-09:00:room-1",
          meetingId: "1",
          groupId: "group-09:00",
          name: "Welcome",
          subtitle: "Earthlings",
          joinUrl: meetings["1"].joinUrl,
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-09:05:room-1",
          meetingId: "1",
          groupId: "group-09:05",
          name: "Keynote",
          subtitle: "",
          joinUrl: meetings["1"].joinUrl,
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-10:05:room-3",
          meetingId: "3",
          groupId: "group-10:05",
          name: "The Funnel",
          subtitle: "",
          joinUrl: meetings["3"].joinUrl,
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-10:15:room-1",
          meetingId: "1",
          groupId: "group-10:15",
          name: "(1) Break",
          subtitle: "Lunch",
          joinUrl: meetings["1"].joinUrl,
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-10:15:room-2",
          meetingId: "2",
          groupId: "group-10:15",
          name: "(2) Break",
          subtitle: "Lunch",
          joinUrl: meetings["2"].joinUrl,
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-10:15:room-3",
          meetingId: "3",
          groupId: "group-10:15",
          name: "(3) Break",
          subtitle: "Lunch",
          joinUrl: meetings["3"].joinUrl,
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-10:15:room-4",
          meetingId: "4",
          groupId: "group-10:15",
          name: "(4) Break",
          subtitle: "Lunch",
          joinUrl: meetings["4"].joinUrl,
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-10:30:room-1",
          meetingId: "1",
          groupId: "group-10:30",
          name: "A1 Topic A",
          subtitle: "",
          joinUrl: meetings["1"].joinUrl,
          links: [
            {
              href: "https://confluence.tngtech.com/x/vJXSF",
              icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/zoom-icon.png",
              text: "Host-Key: 1",
            },
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
          joinUrl: meetings["2"].joinUrl,
          links: [
            {
              href: "https://confluence.tngtech.com/x/vJXSF",
              icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/zoom-icon.png",
              text: "Host-Key: 2",
            },
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
          joinUrl: meetings["4"].joinUrl,
          links: [
            {
              href: "https://confluence.tngtech.com/x/vJXSF",
              icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/zoom-icon.png",
              text: "Host-Key: 4",
            },
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
          joinUrl: meetings["1"].joinUrl,
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
          disabledAfter: "2020-05-22T23:59:59.000+02:00",
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

  it("can handle a given schedule date", () => {
    const spreadsheet = [
      {
        Start: "08:30",
        Title: "Break",
        Subtitle: "",
        Link: "",
        MeetingIds: ["2", "3"],
        ReservedIds: ["2", "3", "4", "5"],
        RandomJoin: true,
        OpenEnd: false,
      },
    ];

    const meetings = meetingsFor(["2", "3"]);
    const config = { ENABLE_ROOM_JOIN_MINUTES_BEFORE_START: "10", SCHEDULE_DATE: "2020-07-04" };

    const office = generateOffice(spreadsheet, meetings, config);

    const groupJoinDescription =
      'Wenn ihr mögt, könnt ihr durch den rechts stehenden "Join"-Button einem zufällig ausgewählten Raum beitreten.';
    expect(office).toEqual({
      rooms: [
        {
          roomId: "group-08:30:room-2",
          meetingId: "2",
          groupId: "group-08:30",
          name: "(1) Break",
          subtitle: "",
          joinUrl: meetings["2"].joinUrl,
          links: [],
          hasSlackChannel: false,
        },
        {
          roomId: "group-08:30:room-3",
          meetingId: "3",
          groupId: "group-08:30",
          name: "(2) Break",
          subtitle: "",
          joinUrl: meetings["3"].joinUrl,
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
          disabledBefore: "2020-07-04T08:30:00.000+02:00",
          disabledAfter: "2020-07-04T23:59:59.000+02:00",
          joinableAfter: "2020-07-04T08:20:00.000+02:00",
        },
      ],
    });
  });
});
