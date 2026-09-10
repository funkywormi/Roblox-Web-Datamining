import { CHAT_DEEP_LINK_URL_PARAMS } from "../constants/chatDeepLinkUrlParams";

export type TChatDeepLinkIntent =
  | { kind: "openConversationById"; conversationId: string }
  | { kind: "startConversationWithUser"; userId: number }
  | { kind: "none" };

const MAX_CONVERSATION_ID_LEN = 64;

function sanitizeConversationId(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_CONVERSATION_ID_LEN) {
    return null;
  }
  if (!/^[0-9a-zA-Z_-]+$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function parseUserId(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const n = Number(trimmed);
  if (!Number.isSafeInteger(n) || n <= 0) {
    return null;
  }
  return n;
}

/**
 * Defensive parser for `window.location.search`-style query strings (leading `?` optional).
 * Honors legacy param names used by Angular web chat.
 */
export function parseChatDeepLinkFromSearchString(search: string): TChatDeepLinkIntent {
  const normalized = search.trim().startsWith("?") ? search.trim().slice(1) : search.trim();
  if (normalized.length === 0) {
    return { kind: "none" };
  }

  let startUser: string | undefined;
  let convId: string | undefined;

  for (const part of normalized.split("&")) {
    if (part.length === 0) {
      continue;
    }
    const eq = part.indexOf("=");
    const key = eq === -1 ? part : part.slice(0, eq);
    const value = eq === -1 ? "" : part.slice(eq + 1);
    const decoded = ((): string => {
      try {
        return decodeURIComponent(value.replace(/\+/g, " "));
      } catch {
        return value;
      }
    })();

    if (key === CHAT_DEEP_LINK_URL_PARAMS.startConversationWithUserId) {
      startUser = decoded;
    } else if (key === CHAT_DEEP_LINK_URL_PARAMS.conversationId) {
      convId = decoded;
    }
  }

  if (convId !== undefined) {
    const id = sanitizeConversationId(convId);
    if (id !== null) {
      return { kind: "openConversationById", conversationId: id };
    }
  }

  if (startUser !== undefined) {
    const userId = parseUserId(startUser);
    if (userId !== null) {
      return { kind: "startConversationWithUser", userId };
    }
  }

  return { kind: "none" };
}

/**
 * Removes consumed legacy chat query params without navigation.
 */
export function replaceLocationRemovingChatDeepLinkParams(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const url = new URL(window.location.href);
    if (
      !url.searchParams.has(CHAT_DEEP_LINK_URL_PARAMS.conversationId) &&
      !url.searchParams.has(CHAT_DEEP_LINK_URL_PARAMS.startConversationWithUserId)
    ) {
      return;
    }
    url.searchParams.delete(CHAT_DEEP_LINK_URL_PARAMS.conversationId);
    url.searchParams.delete(CHAT_DEEP_LINK_URL_PARAMS.startConversationWithUserId);
    const search = url.searchParams.toString();
    const next = `${url.pathname}${search.length > 0 ? `?${search}` : ""}${url.hash}`;
    window.history.replaceState({}, "", next);
  } catch {
    /* ignore malformed URLs */
  }
}
