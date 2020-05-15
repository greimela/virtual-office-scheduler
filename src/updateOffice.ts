import { Office } from "./generateOffice";
import fetch from "node-fetch";

export async function updateOffice(virtualOfficeUrl: string, office: Office): Promise<void> {
    console.log(office);

    const health = await fetch(`${virtualOfficeUrl}/api/monitoring/health`, { method: "GET" });
    console.log(await health.text());
}
