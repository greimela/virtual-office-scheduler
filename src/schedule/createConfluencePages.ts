import { hostKey, Office } from "./generateOffice";
import { logger } from "../log";
import { iconUrlFor } from "./extractLinks";
import { ConfluenceClient, ConfluenceConfig } from "./ConfluenceClient";

export async function createConfluencePagesAndInsertLinks(office: Office, config: ConfluenceConfig): Promise<Office> {
  const confluenceClient = new ConfluenceClient(config);
  const templateStorageContent = await confluenceClient.getPageBody(config.CONFLUENCE_TEMPLATE_PAGE_ID);

  const confluencePages = office.rooms
    .filter((room) => room.hasConfluencePage)
    .map((room) => ({ room, pageTitle: `vSR20 - Session ${room.name}` }));
  for (const { room, pageTitle } of confluencePages) {
    let pageLink = await confluenceClient.findLinkForPage(config.CONFLUENCE_SPACE_KEY, pageTitle);

    if (pageLink === undefined) {
      const linkList = room.links.map((link) => {
        if (link.text.startsWith(hostKey)) {
          return `<li><a href="${room.joinUrl}">Zoom</a> (<a href="${link.href}">${link.text}</a>)</li>`;
        }
        return `<li><a href="${link.href}">${link.text}</a></li>`;
      });
      const content = templateStorageContent.replace("$LINKS", `<ul>${linkList}</ul>`);

      pageLink = await confluenceClient.createSessionPage(pageTitle, content);
      logger.info(`Created Confluence page ${pageTitle}`);
    } else {
      logger.info(`Confluence page ${pageTitle} already exists`);
    }

    room.links.push({
      text: "Confluence",
      href: pageLink,
      icon: iconUrlFor(config.CONFLUENCE_BASE_URL),
    });
  }
  return office;
}
