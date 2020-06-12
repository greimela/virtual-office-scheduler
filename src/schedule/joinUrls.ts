import { MeetingSpreadsheet } from "./fetchSpreadsheet";

export interface MeetingJoinUrls {
  [meetingId: string]: string;
}

export function joinUrlsFrom(meetings: MeetingSpreadsheet): MeetingJoinUrls {
  return meetings.reduce((prev, cur) => {
    prev[cur.meetingId] = prev.joinUrl;
    return prev;
  }, {} as MeetingJoinUrls);
}
