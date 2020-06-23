import { MeetingDictionary } from "./fetchSpreadsheet";

export interface MeetingJoinUrls {
  [meetingId: string]: string;
}

export function joinUrlsFrom(meetings: MeetingDictionary): MeetingJoinUrls {
  return Object.values(meetings).reduce((prev, cur) => {
    prev[cur.meetingId] = cur.joinUrl;
    return prev;
  }, {} as MeetingJoinUrls);
}
