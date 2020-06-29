import { groupBy } from "lodash";
import { DateTime, Duration } from "luxon";

import { MeetingDictionary, ScheduleSpreadsheet, ScheduleSpreadsheetRow } from "./fetchSpreadsheet";
import { logger } from "../log";
import { joinUrlsFrom } from "./joinUrls";
import { extractLinks, iconUrlFor } from "./extractLinks";

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
  hasSlackChannel: boolean;
}

export interface RoomLink {
  href: string;
  text: string;
  icon?: string;
}

export interface Group {
  id: string;
  name: string;
  disabledBefore?: string;
  disabledAfter?: string;
  joinableAfter?: string;
  groupJoin?: GroupJoinConfig;
}

export type GroupJoinConfig = {
  minimumParticipantCount: number;
  title: string;
  subtitle: string;
  description: string;
};

export interface GenerateOfficeConfig {
  ENABLE_ROOM_JOIN_MINUTES_BEFORE_START: string;
  SCHEDULE_DATE?: string;
}

export function generateOffice(
  schedule: ScheduleSpreadsheet,
  meetings: MeetingDictionary,
  config: GenerateOfficeConfig
): Office {
  logger.info("Generating office based on spreadsheet", { spreadsheet: schedule });

  const groups = groupBy(schedule, (row) => row.Start);
  const groupStarts = Object.keys(groups).sort();

  const groupConfigs = groupStarts.map((groupStart, index) => {
    const groupEnd = groupStarts[index + 1];
    const rows = groups[groupStart];
    return mapSpreadsheetGroup(groupStart, rows[0]?.OpenEnd ? undefined : groupEnd, rows, meetings, config);
  });

  return {
    rooms: groupConfigs.flatMap((groupConfig) => groupConfig.rooms),
    groups: groupConfigs.flatMap((groupConfig) => groupConfig.groups),
  };
}

function mapSpreadsheetGroup(
  start: string,
  end: string | undefined,
  rows: ScheduleSpreadsheetRow[],
  meetings: MeetingDictionary,
  config: GenerateOfficeConfig
): Office {
  const dateTimeAtScheduleDay = (time?: string): string | undefined =>
    sanitizeDateTime({ date: config.SCHEDULE_DATE, time });
  const groupId = `group-${start}`;
  const groupJoinRow = rows.find((row) => row.RandomJoin);
  const startAsIso = toDateTime({ date: config.SCHEDULE_DATE, time: start });
  const joinableAfter = startAsIso.minus(
    Duration.fromObject({ minutes: parseInt(config.ENABLE_ROOM_JOIN_MINUTES_BEFORE_START, 10) })
  );

  const group: Group = {
    id: groupId,
    name: DateTime.fromISO(start).toFormat("HH:mm"),
    groupJoin: groupJoinRow && {
      minimumParticipantCount: 5,
      title: groupJoinRow.Title,
      subtitle: groupJoinRow.Subtitle,
      description: `Wenn ihr mögt, könnt ihr durch den rechts stehenden "Join"-Button einem zufällig ausgewählten Raum beitreten.`,
    },
    joinableAfter: joinableAfter.toISO(),
    disabledBefore: dateTimeAtScheduleDay(start),
    disabledAfter: dateTimeAtScheduleDay(end),
  };

  const rooms: Room[] = rows
    .filter((row) => row.Title)
    .flatMap((row) =>
      row.MeetingIds.sort().map((meetingId, index) => {
        const roomId = `${groupId}:room-${meetingId}`;
        const slot = row.Slot ? `${row.Slot} ` : "";
        const roomNumber = row.MeetingIds.length > 1 ? `(${index + 1}) ` : "";
        const links = extractLinks(row.Link);

        const joinUrl = joinUrlsFrom(meetings)[meetingId];

        if (row.Slot) {
          links.unshift({
            text: `Host-Key: ${meetings[meetingId].hostKey}`,
            icon: iconUrlFor("zoom"),
            href: "https://confluence.tngtech.com/x/vJXSF",
          });
        }

        return {
          roomId,
          meetingId,
          groupId,
          name: `${slot}${roomNumber}${row.Title}`,
          subtitle: row.Subtitle,
          joinUrl,
          links,
          hasSlackChannel: !!row.Slot,
        };
      })
    );

  return {
    rooms: rooms,
    groups: [group],
  };
}

function sanitizeDateTime({ date, time }: { date: string | undefined; time: string | undefined }): string | undefined {
  return time && toDateTime({ date, time }).toISO();
}

function toDateTime({ date, time }: { date: string | undefined; time: string }): DateTime {
  const toParse = date ? `${date}T${time}` : time;
  return DateTime.fromISO(toParse, { zone: "Europe/Berlin" });
}
