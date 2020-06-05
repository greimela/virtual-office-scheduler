import { Environment } from "./config";
import { logger } from "./log";
import {
  createMeeting,
  getAllUpcomingMeetingsForUser,
  ZoomMeeting,
  ZoomUser,
} from "./zoom";

async function createOrGetMeeting(
  user: ZoomUser,
  config: Environment
): Promise<ZoomMeeting> {
  const meetings = await getAllUpcomingMeetingsForUser(
    user.id,
    config.ZOOM_JWT
  );
  const existingMeeting = meetings.find(
    (meeting) => meeting.topic === config.MEETING_TOPIC
  );
  if (existingMeeting) {
    logger.info("Meeting already exists", { id: existingMeeting.id });
    return existingMeeting;
  }

  logger.info("Meeting not found, creating...");
  return createMeeting(
    user.id,
    {
      topic: config.MEETING_TOPIC,
      type: 2,
      start_time: config.MEETING_START_TIME,
      duration: config.MEETING_DURATION,
      password: config.MEETING_PASSWORD,
      tracking_fields: [
        { field: "origin", value: "virtual-office-meeting-scheduler" },
      ],
      settings: { join_before_host: true },
    },
    config.ZOOM_JWT
  );
}

export async function createZoomMeetings({
  config,
  zoomUsers,
}: {
  config: Environment;
  zoomUsers: ZoomUser[];
}): Promise<{ user: ZoomUser; meeting: ZoomMeeting }[]> {
  const meetings: { user: ZoomUser; meeting: ZoomMeeting }[] = [];
  for (const user of zoomUsers) {
    logger.info("Creating or retrieving zoom meeting for user", {
      id: user.id,
      email: user.email,
    });
    const meeting = await createOrGetMeeting(user, config);
    meetings.push({ user, meeting });
  }
  return meetings;
}
