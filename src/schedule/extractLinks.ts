import { RoomLink } from "./generateOffice";

export function iconUrlFor(url: string): string | undefined {
  const icon = iconFor(url);
  if (!icon) {
    return undefined;
  }
  return `https://virtual-office-icons.s3.eu-central-1.amazonaws.com/${icon}-icon.png`;
}

const icons = ["confluence", "jira", "mural", "slack", "miro", "zoom", "discord"];
function iconFor(url: string): string | undefined {
  return icons.find((icon) => url.includes(icon));
}

export function extractLinks(text: string): RoomLink[] {
  const matches = Array.from(text.matchAll(/\[([^]+?)]\(([^)]+?)\)/g));

  return matches.map((match) => {
    const url = match[2];
    return {
      text: match[1],
      href: url,
      icon: iconUrlFor(url),
    };
  });
}
