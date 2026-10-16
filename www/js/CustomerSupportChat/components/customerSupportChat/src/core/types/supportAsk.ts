/** Mirrors the DTOs on `POST /support/ask` in support-web-subsite. */
import { C3ChatMetadataPayload } from "./c3Chat";

export type SupportAskRequest = {
  question: string;
};

/**
 * The endpoint only creates the conversation -- the answer arrives by polling chatbot-api for
 * interactions, the same way the support form's C3 chat does.
 *
 * Every rejection reports through `success: false` rather than a status code, so a non-employee
 * and a disabled flag are indistinguishable from the client. `chatMetadata` is absent whenever
 * `success` is false.
 */
export type SupportAskResponse = {
  success: boolean;
  message: string;
  chatMetadata?: C3ChatMetadataPayload | null;
};

/**
 * Mirrors `POST /support/ask/chat`. The token proves the caller owns the ask conversation, so
 * the Sierra chat can reuse its id for the escalation trail.
 */
export type SupportAskChatRequest = {
  conversationId: string;
  conversationAuthToken: string;
};

/** Like `SupportAskResponse`, rejections arrive as `success: false` with a displayable message. */
export type SupportAskChatResponse = {
  success: boolean;
  message: string;
  conversationId?: string | null;
  userTouRegion?: string | null;
  username?: string | null;
  contactEmail?: string | null;
};

/**
 * Marks a bot message as an ask payload rather than plain markdown, and gates the shape
 * of everything after it. Kept in lockstep with `CONTRACT` / `CONTRACT_VERSION` in the
 * orchestration's `payload.py`; bump the version here only once this client can render
 * the new shape.
 */
export const ASK_CONTRACT = "c3.ask.reply";
export const ASK_CONTRACT_VERSION = 1;

/**
 * What the answer resolved to.
 *
 * Mirrors `AskReplyKind` in the orchestration. Kinds this client does not know about are
 * normalized to `Message`, which renders the payload's prose -- that degradation is the
 * contract working, not an error, and is what lets the orchestration add kinds without
 * waiting on a client release.
 */
export enum AskReplyKind {
  Portal = "portal",
  /** Answered from help-center articles, which are listed alongside the prose. */
  Answer = "answer",
  NoAnswer = "no_answer",
  /** Not a Roblox question, so no support chat is offered for it. */
  OffTopic = "off_topic",
  Message = "message",
}

export type AskPortal = {
  url: string;
  ctaLabel: string;
  loginRequired: boolean;
};

export type AskArticle = {
  title: string;
  url: string;
};

/**
 * The support-form category the orchestration filed the question under, as metadata `name`s.
 * The orchestration cannot see which categories this user is offered, so check it against the
 * support metadata before use.
 */
export type AskSupportCategory = {
  category: string;
  subcategory: string;
};

/**
 * Mirrors `build_payload` in the ask orchestration, which sends it in place of the bot
 * interaction's `message` -- the interaction schema has no field for structured data, so
 * the `contract` marker rather than anything on the interaction identifies it.
 *
 * Normalized from the wire by `parseAskPayload`, which camelCases it: the payload is a
 * Python dict serialized as-is and so arrives snake_cased. The orchestration also sends
 * diagnostic `intent` and `confidence` fields, deliberately dropped here -- they describe
 * how the answer was reached, not what to draw.
 */
export type AskPayload = {
  kind: AskReplyKind;
  /**
   * Always present and always renderable on its own -- what the client falls back to for
   * any kind it does not recognize, and the reason the orchestration can add kinds and
   * fields without breaking a deployed client.
   *
   * Markdown, and it must be rendered as such: answers use numbered steps and bold for
   * on-screen labels, so rendering it as plain text turns a settings path into an
   * unreadable paragraph.
   *
   * May contain inline links, which are model output rather than vetted data -- the
   * prompts only offer the model URLs from the retrieved articles, but nothing enforces
   * that. `portal` and `articles` are the vetted links.
   */
  message: string;
  portal: AskPortal | null;
  articles: AskArticle[];
  supportCategory: AskSupportCategory | null;
};

/**
 * What `parseAskPayload` made of a bot message.
 *
 * `plain` and `payload` are both normal: replies produced outside the ask graph are markdown
 * and carry no marker. `unrenderable` means the message is marked as a payload -- so it is
 * JSON and must not be shown to the user -- but carries no prose to fall back to, which the
 * orchestration validates against before persisting.
 */
export type AskParseResult =
  | { status: "plain" }
  | { status: "payload"; payload: AskPayload }
  | { status: "unrenderable" };
