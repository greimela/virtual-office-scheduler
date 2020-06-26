import axios from "axios";
import { logger } from "../log";
import * as t from "io-ts";
import { isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";

/* eslint-disable @typescript-eslint/camelcase */
// Zoom API uses snake_case therefore ignore in this file

const ZoomListUserCodec = t.type({
  id: t.string,
  first_name: t.string,
  last_name: t.string,
  email: t.string,
  type: t.number,
});

const ZoomUserCodec = t.type({
  id: t.string,
  first_name: t.string,
  last_name: t.string,
  email: t.string,
  type: t.number,
  host_key: t.string,
});

const PaginatedGetCodec = t.type({
  page_count: t.number,
  page_number: t.number,
  page_size: t.number,
  total_records: t.number,
});
const ZoomUsersCodec = t.array(ZoomListUserCodec);

const ZoomMeetingCodec = t.type({
  uuid: t.string,
  id: t.number,
  type: t.number,
  topic: t.string,
  startTime: t.union([t.string, t.undefined]),
  join_url: t.string,
});
const ZoomMeetingsCodec = t.array(ZoomMeetingCodec);

export type PaginatedGet = t.TypeOf<typeof PaginatedGetCodec>;
export type ZoomUser = t.TypeOf<typeof ZoomUserCodec>;
export type ZoomListUser = t.TypeOf<typeof ZoomListUserCodec>;
export type ZoomMeeting = t.TypeOf<typeof ZoomMeetingCodec>;

export async function getAllUsers(zoomJwt: string): Promise<ZoomListUser[]> {
  const allPaginatedItems = await getAllPaginatedItems("https://api.zoom.us/v2/users", {
    token: zoomJwt,
    key: "users",
  });

  const decoded = ZoomUsersCodec.decode(allPaginatedItems);
  if (isLeft(decoded)) {
    throw Error(`Parsing GET /users response failed due to '${PathReporter.report(decoded)}'.`);
  }

  return decoded.right;
}

export async function getUser(userId: string, token: string): Promise<ZoomUser> {
  logger.info(`Getting details for user ${userId}`);
  const response = await axios.get(`https://api.zoom.us/v2/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const zoomGetUsersResponse = await response.data;

  const decoded = ZoomUserCodec.decode(zoomGetUsersResponse);
  if (isLeft(decoded)) {
    throw Error(`Parsing GET /users/${userId} response failed due to '${PathReporter.report(decoded)}'.`);
  }

  return decoded.right;
}

export async function getAllUpcomingMeetingsForUser(userId: string, zoomJwt: string): Promise<ZoomMeeting[]> {
  const allPaginatedItems = await getAllPaginatedItems(`https://api.zoom.us/v2/users/${userId}/meetings`, {
    key: "meetings",
    token: zoomJwt,
    params: { type: "upcoming" },
  });

  const decoded = ZoomMeetingsCodec.decode(allPaginatedItems);
  if (isLeft(decoded)) {
    throw Error(`Parsing GET /users/${userId}/meetings response failed due to '${PathReporter.report(decoded)}'.`);
  }

  return decoded.right;
}

export async function createMeeting(userId: string, meeting: object, token: string): Promise<ZoomMeeting> {
  const response = await axios.post(`https://api.zoom.us/v2/users/${userId}/meetings`, meeting, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

async function getAllPaginatedItems(
  url: string,
  { token, key, params }: { token: string; key: string; params?: object }
): Promise<unknown[]> {
  const allItems: any[] = [];
  let pageNumber = 0;
  let pageCount = 0;
  do {
    const response = await axios.get(url, {
      params: { ...params, page_size: 300, page_number: pageNumber + 1 },
      headers: { Authorization: `Bearer ${token}` },
    });
    const zoomGetUsersResponse = await response.data;
    const decodedResponse = decodePaginatedItems(zoomGetUsersResponse);
    const { page_number, page_count, total_records } = decodedResponse;

    const items = (decodedResponse as any)[key];
    if (!items) {
      throw new Error(`Key ${key} is missing in response`);
    }

    pageCount = page_count;
    pageNumber = page_number;

    allItems.push(...items);
    logger.info(`Received page ${pageNumber} of ${pageCount}: ${allItems.length} / ${total_records} items`);
  } while (pageCount > pageNumber);

  return allItems;
}

function decodePaginatedItems(data: unknown): PaginatedGet {
  const decoded = PaginatedGetCodec.decode(data);
  if (isLeft(decoded)) {
    throw Error(`Parsing paginated items failed due to '${PathReporter.report(decoded)}'.`);
  }

  return decoded.right;
}
