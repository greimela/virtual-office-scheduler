import axios from "axios";

import { Environment } from "../config";
import { Office } from "./generateOffice";
import { logger } from "../log";

export async function updateOffice(config: Environment, office: Office): Promise<void> {
  const url = `${config.VIRTUAL_OFFICE_BASE_URL}/api/admin/replaceOffice`;
  logger.info("Replacing virtual office", { url, office });

  try {
    await axios.post(url, office, {
      auth: {
        username: config.VIRTUAL_OFFICE_USERNAME,
        password: config.VIRTUAL_OFFICE_PASSWORD,
      },
    });
  } catch (error) {
    throw new Error(`Could not replace virtual office: ${error.message}`);
  }
}
