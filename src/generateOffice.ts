import { Spreadsheet } from "./fetchSpreadsheet";

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
  console.log(spreadsheet);
  return {
    rooms: [],
    groups: [],
  };
}
