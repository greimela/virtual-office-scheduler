import { FreizeitSpreadsheetRow, MeetingDictionary, ScheduleSpreadsheet, Topic } from "./fetchSpreadsheet";
import { logger } from "../log";

export const hostKey = `Host-Key`;

export interface Office {
  rooms: Room[];
  groups: Group[];
  schedule: Schedule;
}

export interface Schedule {
  tracks: Track[];
  sessions: Session[];
}

export interface Track {
  id: string;
  name: string;
}

export interface Session {
  roomId?: string;
  groupId?: string;
  trackId?: string;
  start: string;
  end: string;
  alwaysActive?: boolean;
}

export interface Room {
  roomId?: string;
  meetingId: string;
  name: string;
  subtitle?: string;
  joinUrl: string;
  links: RoomLink[];
  groupId?: string;
  icon?: string;
  openForNewbies: boolean;
}

export interface RoomLink {
  href: string;
  text: string;
  icon?: string;
}

export interface Group {
  id: string;
  name: string;
  groupJoin?: GroupJoinConfig;
}

export type GroupJoinConfig = {
  minimumParticipantCount: number;
  title: string;
  subtitle?: string;
  description: string;
};

export function generateOffice(
  schedule: ScheduleSpreadsheet,
  meetings: MeetingDictionary,
  topics: Topic[],
  freizeit: FreizeitSpreadsheetRow[]
): Office {
  logger.info("Generating office based on spreadsheet", { spreadsheet: schedule });

  const groups: Group[] = [
    {
      id: "workshops-morning",
      name: "(09:15 - 12:15) 1. Workshoprunde",
    },
    {
      id: "workshops-morning-2",
      name: "(09:15 - 12:15) 1. Workshoprunde (cont.)",
    },
    {
      id: "workshops-afternoon",
      name: "(13:30 - 16:30) 2. Workshoprunde",
    },
    {
      id: "workshops-afternoon-2",
      name: "(13:30 - 16:30) 2. Workshoprunde (cont.)",
    },
    {
      id: "abendprogramm",
      name: "Abendprogramm",
    },
    // {
    //   id: "freizeitprogramm",
    //   name: "Samstagsaktivitäten",
    // },
    {
      id: "lunch-break",
      name: "(12:15 - 13:30) Mittagspause",
      groupJoin: {
        minimumParticipantCount: 10,
        title: "Mittagstisch",
        description: "Einem zufälligen Raum beitreten.",
      },
    },
    {
      id: "break-1015",
      name: "(10:15 - 10:45) Pause",
      groupJoin: {
        minimumParticipantCount: 10,
        title: "Kaffeeküche",
        description: "Einem zufälligen Raum beitreten.",
      },
    },
    {
      id: "break-1445",
      name: "(14:45 - 15:15) Pause",
      groupJoin: {
        minimumParticipantCount: 10,
        title: "Kaffeeküche",
        description: "Einem zufälligen Raum beitreten.",
      },
    },
    {
      id: "break-1630",
      name: "(16:30 - 16:45) Pause",
      groupJoin: {
        minimumParticipantCount: 10,
        title: "Kaffeeküche",
        description: "Einem zufälligen Raum beitreten.",
      },
    },
    {
      id: "break-1715",
      name: "(17:15 - 18:30) Pause",
      groupJoin: {
        minimumParticipantCount: 10,
        title: "Kaffeeküche",
        description: "Einem zufälligen Raum beitreten.",
      },
    },
    {
      id: "check-in",
      name: "Ankunft",
      groupJoin: {
        minimumParticipantCount: 10,
        title: "Ankunft",
        description: "Einem zufälligen Raum beitreten.",
      },
    },
  ];

  const rooms: Room[] = topics
    .sort((a, b) => (a.title > b.title ? 1 : -1))
    .flatMap((topic): Room[] => {
      const meeting = meetings[topic.meetingIds[0]];
      const roomTemplate = {
        name: topic.title,
        meetingId: topic.meetingIds[0],
        links: [
          {
            href: "#",
            icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/zoom-icon.png",
            text: `Host-Key: ${meeting.hostKey}`,
          },
          ...topic.links,
        ],
        subtitle: "",
        joinUrl: meeting.joinUrl,
        openForNewbies: topic.openForNewbies,
      };
      if (topic.type === "FULL_DAY") {
        return [
          { ...roomTemplate, roomId: topic.title + "-morning", groupId: "workshops-morning" },
          { ...roomTemplate, roomId: topic.title + "-morning-2", groupId: "workshops-morning-2" },
          { ...roomTemplate, roomId: topic.title + "-afternoon", groupId: "workshops-afternoon" },
          { ...roomTemplate, roomId: topic.title + "-afternoon-2", groupId: "workshops-afternoon-2" },
        ];
      } else {
        const groupId = topic.slot === "MORNING" ? "workshops-morning" : "workshops-afternoon";
        return [
          { ...roomTemplate, roomId: topic.title, groupId: groupId },
          { ...roomTemplate, roomId: topic.title, groupId: `${groupId}-2` },
        ];
      }
    });

  const sessions: Session[] = [];
  for (let i = 0; i < schedule.length; i++) {
    const scheduleEntry = schedule[i];

    const session = { start: schedule[i].Start, end: schedule?.[i + 1]?.Start ?? "23:59" };
    const groupWithSessionName = groups.find((group) => group.name.indexOf(scheduleEntry.Title) > -1);
    if (groupWithSessionName) {
      sessions.push({ ...session, groupId: groupWithSessionName.id });

      const roomsForGroup = rooms.filter((room) => room.groupId === groupWithSessionName.id);
      if (scheduleEntry.MeetingIds.length > 1 && roomsForGroup.length === 0) {
        rooms.push(
          ...scheduleEntry.MeetingIds.map((meetingId) => ({
            roomId: `${groupWithSessionName.name}-${meetingId}`,
            meetingId: meetingId,
            name: groupWithSessionName.groupJoin?.title || "",
            joinUrl: meetings[meetingId].joinUrl,
            links: [],
            groupId: groupWithSessionName.id,
            openForNewbies: groupWithSessionName.name !== "Ankunft",
          }))
        );
      }
    } else {
      rooms.push({
        roomId: scheduleEntry.Title,
        joinUrl: scheduleEntry.JoinUrl,
        name: scheduleEntry.Title,
        links: [],
        meetingId: scheduleEntry.MeetingIds[0],
        openForNewbies: true,
      });
      sessions.push({ ...session, roomId: scheduleEntry.Title });
    }
  }

  groups.push({ id: "retreat-orga", name: "" });
  rooms.push({
    groupId: "retreat-orga",
    meetingId: "94935499829",
    joinUrl: meetings["94935499829"].joinUrl,
    name: "Retreat-Orga",
    openForNewbies: true,
    links: [],
  });
  // sessions.push({ start: "10:30", end: "23:00", groupId: "freizeitprogramm" });

  for (const freizeitEntry of freizeit) {
    if (freizeitEntry.Day === "Freitag") {
      const meeting = freizeitEntry.MeetingIds[0] ? meetings[freizeitEntry.MeetingIds[0]] : undefined;
      rooms.push({
        groupId: "abendprogramm",
        meetingId: freizeitEntry.MeetingIds[0],
        joinUrl: meeting ? meeting.joinUrl : freizeitEntry.JoinUrl,
        name: freizeitEntry.Title,
        subtitle: `${freizeitEntry.Start} - ${freizeitEntry.End}`,
        openForNewbies: true,
        links: [
          ...(meeting
            ? [
                {
                  href: "#",
                  icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/zoom-icon.png",
                  text: `Host-Key: ${meeting.hostKey}`,
                },
              ]
            : []),
        ],
      });
    }
  }
  return {
    rooms,
    groups,
    schedule: {
      sessions,
      tracks: [
        { id: "track-1", name: "" },
        { id: "track-2", name: "" },
      ],
    },
  };
}
