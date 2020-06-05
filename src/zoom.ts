import axios from "axios";
import { logger } from "./log";
import * as t from "io-ts";
import { isLeft } from "fp-ts/lib/Either";
import { PathReporter } from "io-ts/lib/PathReporter";

const ZoomUserCodec = t.type({
  id: t.string,
  first_name: t.string,
  last_name: t.string,
  email: t.string,
  type: t.number,
});
const PaginatedGetCodec = t.type({
  page_count: t.number,
  page_number: t.number,
  page_size: t.number,
  total_records: t.number,
});
const ZoomUsersCodec = t.array(ZoomUserCodec);

const ZoomMeetingCodec = t.type({
  uuid: t.string,
  id: t.number,
  type: t.number,
  topic: t.string,
  start_time: t.union([t.string, t.undefined]),
  join_url: t.string,
});
const ZoomMeetingsCodec = t.array(ZoomMeetingCodec);

export type PaginatedGet = t.TypeOf<typeof PaginatedGetCodec>;
export type ZoomUser = t.TypeOf<typeof ZoomUserCodec>;
export type ZoomMeeting = t.TypeOf<typeof ZoomMeetingCodec>;

export async function getAllUsers(zoomJwt: string): Promise<ZoomUser[]> {
  let allPaginatedItems = await getAllPaginatedItems(
    "https://api.zoom.us/v2/users",
    { token: zoomJwt, key: "users" }
  );

  const decoded = ZoomUsersCodec.decode(allPaginatedItems);
  if (isLeft(decoded)) {
    throw Error(
      `Parsing GET /users response failed due to '${PathReporter.report(
        decoded
      )}'.`
    );
  }

  return decoded.right;
}

export async function getAllUpcomingMeetingsForUser(
  userId: string,
  zoomJwt: string
): Promise<ZoomMeeting[]> {
  let allPaginatedItems = await getAllPaginatedItems(
    `https://api.zoom.us/v2/users/${userId}/meetings`,
    { key: "meetings", token: zoomJwt, params: { type: "upcoming" } }
  );

  const decoded = ZoomMeetingsCodec.decode(allPaginatedItems);
  if (isLeft(decoded)) {
    throw Error(
      `Parsing GET /users response failed due to '${PathReporter.report(
        decoded
      )}'.`
    );
  }

  return decoded.right;
}

export async function createMeeting(
  userId: string,
  meeting: object,
  token: string
) {
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

    let items = (decodedResponse as any)[key];
    if (!items) {
      throw new Error(`Key ${key} is missing in response`);
    }

    pageCount = page_count;
    pageNumber = page_number;

    allItems.push(...items);
    logger.info(
      `Received page ${pageNumber} of ${pageCount}: ${allItems.length} / ${total_records} items`
    );
  } while (pageCount > pageNumber);

  return allItems;
}

function decodePaginatedItems(data: unknown): PaginatedGet {
  const decoded = PaginatedGetCodec.decode(data);
  if (isLeft(decoded)) {
    throw Error(
      `Parsing paginated items failed due to '${PathReporter.report(decoded)}'.`
    );
  }

  return decoded.right;
}
