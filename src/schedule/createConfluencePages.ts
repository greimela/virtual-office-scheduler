import { hostKey, Office, Room } from "./generateOffice";
import { logger } from "../log";
import { iconUrlFor } from "./extractLinks";
import { ConfluenceClient, ConfluenceConfig } from "./ConfluenceClient";

export async function createConfluencePagesAndInsertLinks(office: Office, config: ConfluenceConfig): Promise<Office> {
  const client = new ConfluenceClient(config);
  const templateStorageContent = await client.getPageBody(config.CONFLUENCE_TEMPLATE_PAGE_ID);

  const confluencePages = office.rooms.filter((room) => room.hasConfluencePage);
  for (const room of confluencePages) {
    if (!room.hasConfluencePage) {
      continue;
    }

    const pageLink = await getOrCreateConfluencePage(client, config.CONFLUENCE_SPACE_KEY, room, templateStorageContent);
    room.links.push({
      text: "Confluence",
      href: pageLink,
      icon: iconUrlFor(config.CONFLUENCE_BASE_URL),
    });
  }
  return office;
}

async function getOrCreateConfluencePage(
  client: ConfluenceClient,
  spaceKey: string,
  room: Room,
  templateStorageContent: string
): Promise<string> {
  const pageTitle = `vSR20 - Session ${room.name}`;

  const pageLink = await client.findLinkForPage(spaceKey, pageTitle);
  if (pageLink) {
    logger.info(`Confluence page '${pageTitle}' already exists`);
    return pageLink;
  }

  const linkList = room.links.map((link) => {
    if (link.text.startsWith(hostKey)) {
      return `<li><a href="${room.joinUrl}">Zoom</a> (<a href="${link.href}">${link.text}</a>)</li>`;
    }
    return `<li><a href="${link.href}">${link.text}</a></li>`;
  });
  const content = templateStorageContent.replace("$LINKS", `<ul>${linkList}</ul>`);

  const result = await client.createSessionPage(pageTitle, content);
  logger.info(`Created Confluence page '${pageTitle}'`);
  return result;
}
