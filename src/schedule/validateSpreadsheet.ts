import { groupBy, intersection, isEmpty } from "lodash";

import { ScheduleSpreadsheet } from "./fetchSpreadsheet";
import { ValidationError, Violation } from "./ValidationError";
import { logger } from "../log";
import { MeetingJoinUrls } from "./joinUrls";

export function validateSpreadsheet(spreadsheet: ScheduleSpreadsheet, joinUrls: MeetingJoinUrls): void {
  logger.info("Validating parsed spreadsheet");

  const violations: Violation[] = [];
  function violation(group: string, rule: string, rows: any[] = []): void {
    violations.push({ group, rule, locations: rows.map((row) => row.Title) });
  }

  if (spreadsheet.length === 0) {
    violation("-", "You are not allowed to upload a spreadsheet without any rows");
  }

  const groups = groupBy(spreadsheet, (row) => row.Start);
  Object.entries(groups).forEach(([time, rows]) => {
    if (rows.some((row) => row.RandomJoin) && rows.length > 1) {
      violation(time, `You can only set RandomJoin to TRUE when no other row has the same Start time`, rows);
    }

    rows.forEach((row) => {
      row.MeetingIds.forEach((meetingId) => {
        if (!joinUrls[meetingId]) {
          violation(time, `There's no join URL for meeting with id ${meetingId} configured.`, [row]);
        }
      });
      row.ReservedIds.forEach((meetingId) => {
        if (!joinUrls[meetingId]) {
          violation(time, `There's no join URL for reserve meeting with id ${meetingId} configured.`, [row]);
        }
      });

      const otherRows = rows.filter((otherRow) => otherRow !== row);

      const meetingIdConflicts = otherRows.filter(
        (otherRow) => !isEmpty(intersection(otherRow.MeetingIds, row.MeetingIds))
      );
      if (meetingIdConflicts.length > 0) {
        violation(time, "You cannot use overlapping MeetingIds during the same Start time", [
          row,
          ...meetingIdConflicts,
        ]);
      }

      const reservedIdConflicts = otherRows.filter(
        (otherRow) => !isEmpty(intersection(otherRow.ReservedIds, row.ReservedIds))
      );
      if (reservedIdConflicts.length > 0) {
        violation(time, "You cannot use overlapping ReservedIds during the same Start time", [
          row,
          ...reservedIdConflicts,
        ]);
      }
    });
  });

  if (violations.length > 0) {
    throw new ValidationError(violations);
  }
}
