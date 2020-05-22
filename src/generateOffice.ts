import { groupBy } from "lodash";
import { DateTime } from "luxon";

import { Spreadsheet, SpreadsheetRow } from "./fetchSpreadsheet";
import { logger } from "./log";

export interface Office {
  rooms: Room[];
  groups: Group[];
}

export interface Room {
  roomId: string;
  meetingId: string;
  name: string;
  joinUrl?: string;
  temporary?: boolean;
  links?: RoomLink[];
  groupId?: string;
  icon?: string;
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
  startTime?: string;
  endTime?: string;
}

export type GroupJoinConfig = {
  minimumParticipantCount: number;
  description: string;
};

export function generateOffice(spreadsheet: Spreadsheet): Office {
  logger.info("Generating office based on spreadsheet", { spreadsheet });

  const groups = groupBy(spreadsheet, (row) => row.Start);
  const groupStarts = Object.keys(groups).sort();

  const groupConfigs = groupStarts.map((groupStart, index) => {
    const groupEnd = groupStarts[index + 1];
    return mapSpreadsheetGroup(groupStart, groupEnd, groups[groupStart]);
  });

  return {
    rooms: groupConfigs.flatMap((groupConfig) => groupConfig.rooms),
    groups: groupConfigs.flatMap((groupConfig) => groupConfig.groups),
  };
}

function mapSpreadsheetGroup(start: string, end: string | undefined, rows: SpreadsheetRow[]): Office {
  const groupId = `group-${start}`;
  const groupJoinRow = rows.find((row) => row.RandomJoin);
  const group: Group = {
    id: groupId,
    name: start,
    groupJoin: groupJoinRow && {
      minimumParticipantCount: 5,
      description: "You can randomly join one of our coffee rooms. Try it out and meet interesting new people! :)",
    },
    startTime: sanitizeDateTime(start),
    endTime: sanitizeDateTime(end),
  };

  const rooms: Room[] = rows.flatMap((row) =>
    row.MeetingIds.sort().map((meetingId, index) => {
      const roomId = `${groupId}:room-${meetingId}`;
      const roomNumber = row.MeetingIds.length > 1 ? ` (${index + 1})` : "";
      const room: Room = {
        roomId,
        meetingId,
        groupId,
        name: `${row.Title}${roomNumber}`,
        joinUrl: `https://zoom.us/s/${meetingId}`,
      };

      return room;
    })
  );

  return {
    rooms: rooms,
    groups: [group],
  };
}

function sanitizeDateTime(dateString: string | undefined): string {
  return DateTime.fromISO(dateString || "23:59:59", { zone: "Europe/Berlin" }).toISO();
}
