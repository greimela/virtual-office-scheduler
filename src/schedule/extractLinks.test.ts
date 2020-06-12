import { extractLinks } from "./extractLinks";

describe("extractLinks", () => {
  it("should extract one link", () => {
    expect(extractLinks("[I'm an inline-style link](https://www.google.com)")).toEqual([
      {
        text: "I'm an inline-style link",
        href: "https://www.google.com",
      },
    ]);
  });

  it("should extract multiple links", () => {
    expect(
      extractLinks(
        "[link1](https://www.example1.com),[link2](https://www.example2.com)\n[link3](https://www.example3.com)[link4](https://www.example4.com)"
      )
    ).toEqual([
      {
        text: "link1",
        href: "https://www.example1.com",
      },
      {
        text: "link2",
        href: "https://www.example2.com",
      },
      {
        text: "link3",
        href: "https://www.example3.com",
      },
      {
        text: "link4",
        href: "https://www.example4.com",
      },
    ]);
  });

  describe("icons", () => {
    it("should extract a confluence icon", () => {
      expect(extractLinks("[Confluence](https://confluence.example.com)")).toEqual([
        {
          text: "Confluence",
          href: "https://confluence.example.com",
          icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/confluence-icon.png",
        },
      ]);
    });

    it("should extract a jira icon", () => {
      expect(extractLinks("[Jira](https://jira.example.com)")).toEqual([
        {
          text: "Jira",
          href: "https://jira.example.com",
          icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/jira-icon.png",
        },
      ]);
    });

    it("should extract a mural icon", () => {
      expect(extractLinks("[Mural](https://mural.example.com)")).toEqual([
        {
          text: "Mural",
          href: "https://mural.example.com",
          icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/mural-icon.png",
        },
      ]);
    });

    it("should extract a slack icon", () => {
      expect(extractLinks("[Slack](https://slack.com)")).toEqual([
        {
          text: "Slack",
          href: "https://slack.com",
          icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/slack-icon.png",
        },
      ]);
    });

    it("should extract a Miro icon", () => {
      expect(extractLinks("[Miro](https://miro.com)")).toEqual([
        {
          text: "Miro",
          href: "https://miro.com",
          icon: "https://virtual-office-icons.s3.eu-central-1.amazonaws.com/miro-icon.png",
        },
      ]);
    });
  });
});
