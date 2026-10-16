import {
  ASK_CONTRACT,
  ASK_CONTRACT_VERSION,
  AskArticle,
  AskParseResult,
  AskPortal,
  AskReplyKind,
  AskSupportCategory,
} from "../types/supportAsk";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const asProse = (value: unknown): string | null =>
  typeof value === "string" && value.trim() !== "" ? value : null;

const asPortal = (value: unknown): AskPortal | null => {
  if (!isRecord(value) || typeof value.url !== "string" || typeof value.cta_label !== "string") {
    return null;
  }
  return {
    url: value.url,
    ctaLabel: value.cta_label,
    loginRequired: value.login_required === true,
  };
};

// A kind added by the orchestration after this client shipped renders as prose rather than
// as nothing, which is what lets the two sides deploy independently.
const asKind = (value: unknown): AskReplyKind =>
  Object.values(AskReplyKind).find(kind => kind === value) ?? AskReplyKind.Message;

const asArticles = (value: unknown): AskArticle[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap(article =>
    isRecord(article) && typeof article.title === "string" && typeof article.url === "string"
      ? [{ title: article.title, url: article.url }]
      : [],
  );
};

const asSupportCategory = (value: unknown): AskSupportCategory | null =>
  isRecord(value) && typeof value.category === "string" && typeof value.subcategory === "string"
    ? { category: value.category, subcategory: value.subcategory }
    : null;

const proseOnly = (message: string): AskParseResult => ({
  status: "payload",
  payload: {
    kind: AskReplyKind.Message,
    message,
    portal: null,
    articles: [],
    supportCategory: null,
  },
});

/**
 * Reads a bot interaction's message as an ask payload.
 *
 * The interaction itself does not say whether its message is a payload or plain markdown --
 * the `contract` marker inside the message does. Detection is that marker and not merely
 * "did JSON.parse succeed", so a plain reply that happens to be valid JSON stays prose.
 *
 * Every outcome below still puts words in front of the user. That is the point of the
 * contract rather than a series of edge cases: an unrecognized kind, an unknown version, or
 * a missing portal all fall back to the payload's own prose, and only a violation the
 * orchestration validates against on emit reaches `unrenderable`.
 */
const parseAskPayload = (rawMessage: string): AskParseResult => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawMessage);
  } catch {
    return { status: "plain" };
  }

  if (!isRecord(parsed) || parsed.contract !== ASK_CONTRACT) {
    return { status: "plain" };
  }

  const message = asProse(parsed.message);
  if (message === null) {
    // Marked as a payload, so the raw message is JSON and must not be shown. The
    // orchestration validates this away before persisting, so reaching here is a bug there.
    return { status: "unrenderable" };
  }

  // A newer major version may have changed what an existing field means, so only `message`
  // is safe to read -- holding that field stable across versions is what the version bump
  // buys. Rendering its prose beats guessing at a shape this client was not written against.
  if (parsed.version !== ASK_CONTRACT_VERSION) {
    return proseOnly(message);
  }

  const portal = asPortal(parsed.portal);
  const kind = asKind(parsed.kind);

  return {
    status: "payload",
    payload: {
      // The orchestration downgrades this itself, so this is belt and braces: a portal reply
      // is only renderable with a portal, and prose beats a card whose button is missing.
      kind: kind === AskReplyKind.Portal && portal === null ? AskReplyKind.Message : kind,
      message,
      portal,
      articles: asArticles(parsed.articles),
      supportCategory: asSupportCategory(parsed.support_category),
    },
  };
};

export default parseAskPayload;
