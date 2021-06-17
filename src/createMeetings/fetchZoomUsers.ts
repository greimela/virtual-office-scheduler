import { readFileSync } from "fs";

import { CreateMeetingsEnvironment } from "../config";
import { logger } from "../log";
import { getAllUsers, getUser, ZoomUser } from "./zoom";
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
  const filteredZoomUsers = allZoomUsers.filter((user) => userEmails.find((userEmail) => userEmail === user.email));

  logger.info("Getting user details for all users to extract hostKey");
  const detailedZoomUsers: ZoomUser[] = [];
  for (const user of filteredZoomUsers) {
    detailedZoomUsers.push(await getUser(user.id, zoomJwt));
  }

  return detailedZoomUsers;
}
