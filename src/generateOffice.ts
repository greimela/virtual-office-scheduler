import { compact, groupBy } from "lodash";
import { DateTime } from "luxon";

import { Environment } from "./config";
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
  subtitle: string;
  joinUrl: string;
  links: RoomLink[];
  groupId: string;
}

export interface RoomLink {
  href: string;
  text: string;
  icon: string;
}

export interface Group {
  id: string;
  name: string;
  disabledBefore: string;
  disabledAfter: string;
  groupJoin?: GroupJoinConfig;
}

export type GroupJoinConfig = {
  minimumParticipantCount: number;
  title: string;
  subtitle: string;
  description: string;
};

export function generateOffice(config: Environment, spreadsheet: Spreadsheet): Office {
  logger.info("Generating office based on spreadsheet", { spreadsheet });
  const password = config.MEETING_PASSWORD;

  const groups = groupBy(spreadsheet, (row) => row.Start);
  const groupStarts = Object.keys(groups).sort();

  const groupConfigs = groupStarts.map((groupStart, index) => {
    const groupEnd = groupStarts[index + 1];
    return mapSpreadsheetGroup(groupStart, groupEnd, groups[groupStart], password);
  });

  return {
    rooms: groupConfigs.flatMap((groupConfig) => groupConfig.rooms),
    groups: groupConfigs.flatMap((groupConfig) => groupConfig.groups),
  };
}

function mapSpreadsheetGroup(start: string, end: string | undefined, rows: SpreadsheetRow[], password: string): Office {
  const groupId = `group-${start}`;
  const groupJoinRow = rows.find((row) => row.RandomJoin);
  const group: Group = {
    id: groupId,
    name: DateTime.fromISO(start).toFormat("HH:mm"),
    groupJoin: groupJoinRow && {
      minimumParticipantCount: 5,
      title: groupJoinRow.Title,
      subtitle: groupJoinRow.Subtitle,
      description: `Wenn ihr mögt, könnt ihr durch den untenstehenden "Join"-Button einem zufällig ausgewählten Raum beitreten.`,
    },
    disabledBefore: sanitizeDateTime(start),
    disabledAfter: sanitizeDateTime(end),
  };

  const icon = "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/confluence-icon.png";
  const rooms: Room[] = rows.flatMap((row) =>
    row.MeetingIds.sort().map((meetingId, index) => {
      const roomId = `${groupId}:room-${meetingId}`;
      const roomNumber = row.MeetingIds.length > 1 ? ` (${index + 1})` : "";
      const links = compact([
        row.Link && {
          text: "Confluence",
          href: row.Link,
          icon,
        },
      ]);

      return {
        roomId,
        meetingId,
        groupId,
        name: `${row.Title}${roomNumber}`,
        subtitle: row.Subtitle,
        joinUrl: `https://zoom.us/s/${meetingId}?pwd=${password}`,
        links,
      };
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
