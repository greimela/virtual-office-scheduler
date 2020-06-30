import { hostKey, Office, Room } from "./generateOffice";
import { logger } from "../log";
import { iconUrlFor } from "./extractLinks";
import { ConfluenceClient, ConfluenceConfig } from "./ConfluenceClient";

export async function createConfluencePagesAndInsertLinks(office: Office, config: ConfluenceConfig): Promise<Office> {
  const confluenceClient = new ConfluenceClient(config);
  const templateStorageContent = await confluenceClient.getPageBody(config.CONFLUENCE_TEMPLATE_PAGE_ID);

  const allSessionPages = await confluenceClient.getPageChildren(config.CONFLUENCE_PARENT_PAGE_ID);

  const pagesToCreate = office.rooms
    .filter((room) => room.hasConfluencePage)
    .map((room) => ({ room, title: `vSR20 - Session ${room.name}` }));
  for (const { room, title } of pagesToCreate) {
    if (!room.hasConfluencePage) {
      continue;
    }

    const pageLink = await getOrCreateConfluencePage(
      confluenceClient,
      config.CONFLUENCE_SPACE_KEY,
      room,
      title,
      templateStorageContent
    );
    room.links.push({
      text: "Confluence",
      href: pageLink,
      icon: iconUrlFor(config.CONFLUENCE_BASE_URL),
    });
  }

  await removeObsoletePages(confluenceClient, allSessionPages, pagesToCreate);

  return office;
}

async function getOrCreateConfluencePage(
  client: ConfluenceClient,
  spaceKey: string,
  room: Room,
  pageTitle: string,
  templateStorageContent: string
): Promise<string> {
  const pageLink = await client.findLinkForPage(spaceKey, pageTitle);
  if (pageLink) {
    logger.info(`Confluence page '${pageTitle}' already exists`);
    return pageLink;
  }

  const linkList = room.links.map((link) => {
    if (link.text.startsWith(hostKey)) {
      return `<li><a href="${encode(room.joinUrl)}">Zoom</a> (<a href="${encode(link.href)}">${link.text}</a>)</li>`;
    }
    return `<li><a href="${encode(link.href)}">${link.text}</a></li>`;
  });
  const content = templateStorageContent.replace("$LINKS", `<ul>${linkList.join("")}</ul>`);

  const result = await client.createSessionPage(pageTitle, content);
  logger.info(`Created Confluence page '${pageTitle}'`);
  return result;
}

async function removeObsoletePages(
  client: ConfluenceClient,
  allSessionPages: { id: string; title: string }[],
  pagesToCreate: { room: Room; title: string }[]
): Promise<void> {
  const obsoletePages = allSessionPages.filter(
    (page) => !pagesToCreate.some((pageToCreate) => pageToCreate.title === page.title)
  );
  for (const obsoletePage of obsoletePages) {
    logger.info(`Confluence page ${obsoletePage.title} is obsolete => deleting`);
    await client.removeSessionPage(obsoletePage.id);
    logger.info(`Deleted Confluence page ${obsoletePage.title}`);
  }
}

function encode(uri: string): string {
  return encodeURI(uri).replace(/&/g, "&amp;");
}
