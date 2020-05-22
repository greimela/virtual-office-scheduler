import { Office } from "./generateOffice";
import axios from "axios";
import { Environment } from "./config";

export async function updateOffice(config: Environment, office: Office): Promise<void> {
  const response = await axios.post(`${config.VIRTUAL_OFFICE_BASE_URL}/api/admin/replaceOffice`, office, {
    auth: {
      username: config.VIRTUAL_OFFICE_USERNAME,
      password: config.VIRTUAL_OFFICE_PASSWORD,
    },
  });

  if (response.status !== 200) {
    throw new Error(`could not update virtual office, got response code ${response.status}`);
  }
}
