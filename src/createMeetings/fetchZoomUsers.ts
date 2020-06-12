import { readFileSync } from "fs";

import { Environment } from "../config";
import { logger } from "../log";
import { getAllUsers, ZoomUser } from "./zoom";

export async function fetchZoomUsers(config: Environment): Promise<ZoomUser[]> {
  const zoomJwt = config.ZOOM_JWT;
  const userEmailFile = config.USER_EMAIL_FILE;

  logger.info("Reading list of user emails from file", userEmailFile);
  const userEmailFileContent = readFileSync(userEmailFile).toString("utf-8");
  const userEmails = userEmailFileContent.split("\n");
  logger.info("User emails", userEmails);

  logger.info("Gettings all zoom users from account");
  const allZoomUsers = await getAllUsers(zoomJwt);

  return allZoomUsers.filter((user) => userEmails.find((userEmail) => userEmail === user.email && user.type === 2));
}
