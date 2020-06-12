import { readFileSync } from "fs";

import { CreateMeetingsEnvironment } from "../config";
import { logger } from "../log";
import { getAllUsers, ZoomUser } from "./zoom";
import path from "path";

export async function fetchZoomUsers(config: CreateMeetingsEnvironment): Promise<ZoomUser[]> {
  const zoomJwt = config.ZOOM_JWT;
  const userEmailFile = config.USER_EMAIL_FILE;

  logger.info("Reading list of user emails from file", userEmailFile);
  const userEmailFileContent = readFileSync(path.join(process.cwd(), userEmailFile)).toString("utf-8");
  const userEmails = userEmailFileContent.split("\n");
  logger.info("User emails", userEmails);

  logger.info("Gettings all zoom users from account");
  const allZoomUsers = await getAllUsers(zoomJwt);

  return allZoomUsers.filter((user) => userEmails.find((userEmail) => userEmail === user.email && user.type === 2));
}
