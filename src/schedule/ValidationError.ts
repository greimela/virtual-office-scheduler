import { groupBy } from "lodash";

export interface Violation {
  group: string;
  rule: string;
  locations: string[];
}

export class ValidationError extends Error {
  constructor(public readonly violations: Violation[]) {
    super(`Invalid spreadsheet detected:\n\n${violationsToString(violations)}`);
  }
}

function violationsToString(violations: Violation[]): string {
  const violationGroups = groupBy(violations, (violation) => violation.group);

  return Object.entries(violationGroups)
    .map(([group, violations]) => {
      const ruleGroups = groupBy(violations, (violation) => violation.rule);

      const rules = Object.entries(ruleGroups)
        .map(([rule, violations]) => {
          const locations = violations
            .map((violation) =>
              violation.locations.length > 0
                ? `   Location: ${violation.locations.map((location) => `"${location}"`).join(", ")}`
                : ""
            )
            .join("\n");
          return `   ❗Rule: ${rule}\n${locations}`;
        })
        .join("\n\n");

      return `⚡ [${group}] ⚡ \n\n${rules}\n`;
    })
    .join("\n");
}
