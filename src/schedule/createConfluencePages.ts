import { hostKey } from "./generateOffice";
import { logger } from "../log";
import { iconUrlFor } from "./extractLinks";
import { ConfluenceClient, ConfluenceConfig } from "./ConfluenceClient";
import { MeetingDictionary, Topic } from "./fetchSpreadsheet";

export async function createConfluencePagesAndInsertLinks(
  topics: Topic[],
  meetings: MeetingDictionary,
  config: ConfluenceConfig
): Promise<Topic[]> {
  const confluenceClient = new ConfluenceClient(config);
  const templateStorageContent = await confluenceClient.getPageBody(config.CONFLUENCE_TEMPLATE_PAGE_ID);

  const pagesToCreate = topics.map((topic) => {
    if (topic.type === "HALF_DAY" && topic.slot === "AFTERNOON") {
      const morningDuplicate = topics.find(
        (otherTopic) =>
          otherTopic.title === topic.title && otherTopic.type === "HALF_DAY" && otherTopic.slot === "MORNING"
      );
      if (morningDuplicate) {
        return { topic, title: `vSR21 - Session "${topic.title}" - Nachmittag` };
      }
    }
    return { topic, title: `vSR21 - Session "${topic.title}"` };
  });
  for (const { topic, title } of pagesToCreate) {
    if (topic.title.startsWith("Spontane Session")) {
      continue;
    }
    const pageLink = await getOrCreateConfluencePage(
      confluenceClient,
      config.CONFLUENCE_SPACE_KEY,
      topic,
      meetings,
      title,
      templateStorageContent
    );
    topic.links.push({
      text: "Confluence",
      href: pageLink,
      icon: iconUrlFor(config.CONFLUENCE_BASE_URL),
    });
  }

  await removeObsoletePages(confluenceClient, pagesToCreate);

  return topics;
}

async function getOrCreateConfluencePage(
  client: ConfluenceClient,
  spaceKey: string,
  topic: Topic,
  meetings: MeetingDictionary,
  pageTitle: string,
  templateStorageContent: string
): Promise<string> {
  const pageLink = await client.findLinkForPage(spaceKey, pageTitle);
  if (pageLink) {
    logger.info(`Confluence page '${pageTitle}' already exists`);
    return pageLink;
  }

  const linkList = topic.links.map((link) => {
    if (link.text.startsWith(hostKey)) {
      return `<li><a href="${encode(meetings[topic.meetingIds[0]].joinUrl)}">Zoom</a> (<a href="${encode(link.href)}">${
        link.text
      }</a>)</li>`;
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
  pagesToCreate: { topic: Topic; title: string }[]
): Promise<void> {
  const allSessionPages = await client.getAllSessionPages();

  const obsoletePages = allSessionPages.filter(
    (page) => !pagesToCreate.some((pageToCreate) => pageToCreate.title === page.title)
  );
  for (const obsoletePage of obsoletePages) {
    logger.info(`Confluence page ${obsoletePage.title} is obsolete => deleting`);
    // await client.removeSessionPage(obsoletePage.id);
    // logger.info(`Deleted Confluence page ${obsoletePage.title}`);
  }
}

function encode(uri: string): string {
  return encodeURI(uri).replace(/&/g, "&amp;");
}
