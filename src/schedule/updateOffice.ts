import axios from "axios";

import { ScheduleEnvironment } from "../config";
import { Office } from "./generateOffice";
import { logger } from "../log";

export async function updateOfficeInstance(baseUrl: string, username: string, password: string, office: Office) {
  const url = `${baseUrl}/api/admin/replaceOffice`;
  logger.info("Replacing virtual office", { url });

  try {
    await axios.post(url, office, {
      auth: {
        username,
        password,
      },
    });
  } catch (error) {
    throw new Error(`Could not replace virtual office: ${error.message}`);
  }
}
