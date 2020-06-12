import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from "google-spreadsheet";

export interface SpreadsheetConfig {
  GOOGLE_SPREADSHEET_ID: string;
  GOOGLE_SERVICE_ACCOUNT_MAIL: string;
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: string;
}

export async function getSpreadsheet(config: SpreadsheetConfig): Promise<GoogleSpreadsheet> {
  const doc = new GoogleSpreadsheet(config.GOOGLE_SPREADSHEET_ID);
  await doc.useServiceAccountAuth({
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_email: config.GOOGLE_SERVICE_ACCOUNT_MAIL,
    // eslint-disable-next-line @typescript-eslint/camelcase
    private_key: config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
  });
  await doc.loadInfo();

  return doc;
}

export function findSheet(document: GoogleSpreadsheet, name: string): GoogleSpreadsheetWorksheet | undefined {
  for (let i = 0; i < document.sheetCount; i++) {
    const sheet = document.sheetsByIndex[i];
    if (sheet.title === name) {
      return sheet;
    }
  }
  return undefined;
}
