import { JiraIssue } from "./jira_client";

export class Updater {
  constructor(private jiraIssue: JiraIssue) {}

  title(title: string, branchName: string): string {
    if (title.includes(`${this.jiraIssue.key} | `)) {
      return title;
    }

    let match = /[a-zA-Z]+\//.exec(branchName);
    if(match != null && match.length >= 0) {
      if(match[0].indexOf("/") !== -1) {
        match[0] = match[0].replace("/", "");
      }
    }
    let branchType = match ? "("+match[0]+"): " : "";

    const patternsToStrip = [
      `^${this.jiraIssue.key.project} ${this.jiraIssue.key.number}`,
      `^${this.jiraIssue.key.project}-${this.jiraIssue.key.number}`,
      `${this.jiraIssue.key}$`,
    ];

    for (const pattern of patternsToStrip) {
      const regex = new RegExp(`${pattern}`, "i");
      title = title.replace(regex, "").trim();
      title = title.replace(/^\|+/, "").trim();
      title = title.replace(/\|+$/, "").trim();
    }

    return `${branchType} ${this.jiraIssue.key} | ${this.jiraIssue.title}`;
  }

  body(body: string | undefined): string | undefined {
    if (
      body?.includes(`${this.jiraIssue.key}`) &&
      !body?.includes(`References ${this.jiraIssue.key}`)
    ) {
      return body;
    }

    if (!body) {
      body = "";
    }

    const patternsToStrip = [
      `References ${this.jiraIssue.key}$`,
      `References ${this.jiraIssue.key.project}-$`,
      `${this.jiraIssue.key.project}-$`,
      `${this.jiraIssue.key}$`,
    ];

    for (const pattern of patternsToStrip) {
      const regex = new RegExp(`${pattern}`, "i");
      body = body.replace(regex, "").trim();
    }

    return `[**${this.jiraIssue.key}** | ${this.jiraIssue.title}](${this.jiraIssue.link})\n\n${body}`.trim();
  }

  addFixVersionsToBody(body: string | undefined): string | undefined {
    const { fixVersions } = this.jiraIssue;

    if (!fixVersions?.length) {
      return body;
    }

    if (!body) {
      body = "";
    }

    if (body.includes("**Fix versions**:")) {
      body = body.replace(
        /\*\*Fix versions\*\*:.*$/,
        `**Fix versions**: ${fixVersions.join(",")}`,
      );
    } else {
      body = `${body}\n\n**Fix versions**: ${fixVersions.join(",")}`.trim();
    }

    return body;
  }
}
