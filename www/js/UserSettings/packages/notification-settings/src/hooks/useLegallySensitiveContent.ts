import { LegallySensitiveContentService } from "Roblox";
import type { LegallySensitiveMapping } from "../constants/legallySensitiveConstants";

type LegallySensitiveContent = {
  wordsOfConsent: Record<string, string>;
};

type LegallySensitiveActions = {
  getBase64EncodedAuditHeader: (additionalContextualData?: Record<string, unknown>) => string;
};

const EMPTY_CONTENT: LegallySensitiveContent = { wordsOfConsent: {} };
const EMPTY_ACTIONS: LegallySensitiveActions = { getBase64EncodedAuditHeader: () => "" };

export function useLegallySensitiveContent(mapping: LegallySensitiveMapping | undefined): {
  content: LegallySensitiveContent;
  actions: LegallySensitiveActions;
} {
  const [rawContent, rawActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      mapping?.consentName ?? "",
      mapping?.surfaceName ?? "",
    );

  const content = rawContent as LegallySensitiveContent | null | undefined;
  const actions = rawActions as LegallySensitiveActions | null | undefined;

  return {
    content: content ?? EMPTY_CONTENT,
    actions: actions ?? EMPTY_ACTIONS,
  };
}
