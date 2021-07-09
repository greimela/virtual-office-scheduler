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
  minimumRoomsToShow?: number;
};

export function generateFridayOffice(
  schedule: ScheduleSpreadsheet,
  meetings: MeetingDictionary,
  topics: Topic[],
  freizeit: FreizeitSpreadsheetRow[]
): Office {
  logger.info("Generating office based on spreadsheet", { spreadsheet: schedule });

  const groups: Group[] = [
    {
      id: "workshops-morning",
      name: "(11:15 - 12:45) Session 1",
    },
    // {
    //   id: "workshops-morning-2",
    //   name: "(09:15 - 12:15) 1. Workshoprunde (cont.)",
    // },
    {
      id: "workshops-afternoon",
      name: "(14:15 - 15:45) Session 2",
    },
    // {
    //   id: "workshops-afternoon-2",
    //   name: "(13:30 - 16:30) 2. Workshoprunde (cont.)",
    //   name: "(13:30 - 16:30) 2. Workshoprunde (cont.)",
    // },
    {
      id: "abendprogramm",
      name: "(18:00 - 03:00) Abendprogramm",
    },
    // {
    //   id: "freizeitprogramm",
    //   name: "Samstagsaktivitäten",
    // },
    {
      id: "lunch-break",
      name: "(12:45 - 14:15) Mittagspause",
      groupJoin: {
        minimumParticipantCount: 10,
        title: "Mittagstisch",
        description: "Einem zufälligen Raum beitreten.",
        minimumRoomsToShow: ThemenKaffeekuechen.length + 5,
      },
    },
    {
      id: "socializing",
      name: "(10:30 - 11:15) Socializing",
      groupJoin: {
        minimumParticipantCount: 10,
        title: "Socializing",
        description: "Einem zufälligen Raum beitreten.",
        minimumRoomsToShow: ThemenKaffeekuechen.length + 5,
      },
    },
    {
      id: "discussion",
      name: "(15:45 - 16:45) Zeit für Diskussion - Ergebnisse sichten",
    },
    {
      id: "ende-socializing",
      name: "(17:00 - 18:00) Ende des offiziellen Programms, Socializing",
      groupJoin: {
        minimumParticipantCount: 10,
        title: "Kaffeeküche",
        description: "Einem zufälligen Raum beitreten.",
        minimumRoomsToShow: ThemenKaffeekuechen.length + 5,
      },
    },
    {
      id: "check-in",
      name: "(08:30 - 09:00) Ankommen",
      groupJoin: {
        minimumParticipantCount: 10,
        title: "Ankommen",
        description: "Einem zufälligen Raum beitreten.",
        minimumRoomsToShow: ThemenKaffeekuechen.length + 5,
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
        links: topic.links,
        subtitle: "",
        joinUrl: meeting.joinUrl,
        openForNewbies: true, //topic.openForNewbies,
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
          ...scheduleEntry.MeetingIds.map((meetingId, index) => {
            const name = ThemenKaffeekuechen?.[index] || groupWithSessionName.groupJoin?.title || "";
            if (name === "gather.town") {
              return {
                roomId: `${groupWithSessionName.id}-${meetingId}`,
                name: name,
                links: [],
                groupId: groupWithSessionName.id,
                meetingId: "",
                joinUrl: "https://gather.town/app/pG5KDCM8CxCY4oZz/vsr21",
                icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/logo-gather.png",
                openForNewbies: true,
              };
            }
            return {
              roomId: `${groupWithSessionName.id}-${meetingId}`,
              meetingId: meetingId,
              name: name,
              joinUrl: meetings[meetingId].joinUrl,
              links: [],
              groupId: groupWithSessionName.id,
              openForNewbies: true,
            };
          })
        );
      } else if (groupWithSessionName.id === "discussion") {
        const discussionRooms = topics
          .sort((a, b) => (a.title > b.title ? 1 : -1))
          .filter((topic, index) => topics?.[index - 1]?.title !== topic.title)
          .map(
            (topic, index): Room => {
              const meeting = meetings[topic.meetingIds[0]];
              return {
                roomId: topic.title + "-discussion",
                groupId: "discussion",
                name: topic.title,
                meetingId: topic.meetingIds[0],
                links: topic.links,
                subtitle: "",
                joinUrl: meeting.joinUrl,
                openForNewbies: true, //topic.openForNewbies,
              };
            }
          );
        rooms.push(...discussionRooms);
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
    meetingId: "99045302162",
    joinUrl: meetings["99045302162"].joinUrl,
    name: "Retreat-Orga",
    openForNewbies: true,
    links: [],
  });
  sessions.push({ start: "08:00", end: "08:30", groupId: "retreat-orga", alwaysActive: true });

  for (const freizeitEntry of freizeit) {
    if (freizeitEntry.Day === "Freitag") {
      const meeting = freizeitEntry.MeetingIds[0] ? meetings[freizeitEntry.MeetingIds[0]] : undefined;
      if (freizeitEntry.Title === "gather.town") {
        rooms.push({
          roomId: `gather-abend`,
          name: freizeitEntry.Title,
          links: [],
          groupId: "abendprogramm",
          meetingId: "",
          joinUrl: "https://gather.town/app/pG5KDCM8CxCY4oZz/vsr21",
          icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/logo-gather.png",
          openForNewbies: true,
        });
      } else {
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

export function generateSaturdayOffice(
  schedule: ScheduleSpreadsheet,
  meetings: MeetingDictionary,
  freizeit: FreizeitSpreadsheetRow[]
): Office {
  logger.info("Generating office based on spreadsheet", { spreadsheet: schedule });

  const groups: Group[] = [
    {
      id: "abendprogramm",
      name: "Abendprogramm",
    },
    {
      id: "freizeitprogramm",
      name: "Samstagsaktivitäten",
    },
  ];

  const sessions: Session[] = [
    { groupId: "abendprogramm", start: "00:00", end: "03:00" },
    { groupId: "freizeitprogramm", start: "10:00", end: "23:59" },
  ];

  const rooms: Room[] = [];
  for (const freizeitEntry of freizeit) {
    if (freizeitEntry.Day === "Freitag") {
      const meeting = freizeitEntry.MeetingIds[0] ? meetings[freizeitEntry.MeetingIds[0]] : undefined;
      if (freizeitEntry.Title === "gather.town") {
        rooms.push({
          roomId: `gather-abend`,
          name: freizeitEntry.Title,
          links: [],
          groupId: "abendprogramm",
          meetingId: "",
          joinUrl: "https://gather.town/app/pG5KDCM8CxCY4oZz/vsr21",
          icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/logo-gather.png",
          openForNewbies: true,
        });
      } else {
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
    } else if (freizeitEntry.Day === "Samstag") {
      const meeting = freizeitEntry.MeetingIds[0] ? meetings[freizeitEntry.MeetingIds[0]] : undefined;
      rooms.push({
        groupId: "freizeitprogramm",
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

const ThemenKaffeekuechen = [
  "gather.town",
  "Gehaltsmodell ff.",
  "Abschluss-Session ff.",
  "Strech and Move your Body",
  "Freizeit",
  "Fußball EM und Sport",
  "Literaturcafé",
  "Kochen und Essen",
  "Nerds unter sich",
  "Open Air",
  "Let the music rock",
];
