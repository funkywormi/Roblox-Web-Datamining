import { getItem, removeItem, setItem } from "@rbx/core-lib/local-storage";

const PERSISTED_CHAT_LAYOUT_VERSION = 1;

/** Single localStorage key holding every user's layout as a userId → layout map. */
const STORAGE_KEY = "reactChatOpenDialogs" as const;

/**
 * Open/minimized chat dialog state persisted across page loads, keyed per user.
 * Mirrors the legacy AngularJS chat, which stored a per-layoutId dialog library
 * in localStorage so open windows survived a reload.
 *
 * `openedConversationLayoutIds` is the full open-intent list (never trimmed for
 * width); which of those are visible vs parked in the tray is re-derived from the
 * viewport on load. `minimizedConversationLayoutIds` holds only dialogs the user
 * minimized manually, which stay minimized regardless of viewport width.
 * `collapsedConversationLayoutIds` holds dialogs collapsed in place (header only) so
 * they reload collapsed, matching legacy chat. Optional for back-compat with layouts
 * persisted before it existed.
 */
export type TPersistedChatLayout = {
  version: number;
  openedConversationLayoutIds: string[];
  minimizedConversationLayoutIds: string[];
  collapsedConversationLayoutIds?: string[];
  focusedLayoutId: string | null;
  isCollapsed: boolean;
};

// Register the key with the sanctioned localStorage wrapper (@rbx/core-lib/local-storage) so access
// is typed and centralized instead of raw window.localStorage. One key holds a per-user map.
declare module "@rbx/core-lib/local-storage" {
  interface LocalStorageRegistry {
    reactChatOpenDialogs: Record<string, TPersistedChatLayout>;
  }
}

const userKey = (userId: number | null): string => String(userId ?? "anonymous");

const isPersistedChatLayout = (value: unknown): value is TPersistedChatLayout => {
  if (value == null || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<TPersistedChatLayout>;
  return (
    candidate.version === PERSISTED_CHAT_LAYOUT_VERSION &&
    Array.isArray(candidate.openedConversationLayoutIds) &&
    Array.isArray(candidate.minimizedConversationLayoutIds)
  );
};

// The core-lib wrapper touches `localStorage` directly (no SSR guard), so guard here — keeps this
// safe if the chat ever renders server-side (it mounts client-only today).
const hasWindow = (): boolean => typeof window !== "undefined";

export const readPersistedChatLayout = (userId: number | null): TPersistedChatLayout | null => {
  if (!hasWindow()) {
    return null;
  }
  const entry = getItem(STORAGE_KEY)?.[userKey(userId)];
  return entry != null && isPersistedChatLayout(entry) ? entry : null;
};

export const writePersistedChatLayout = (
  userId: number | null,
  layout: Omit<TPersistedChatLayout, "version">,
): void => {
  if (!hasWindow()) {
    return;
  }
  const layouts = getItem(STORAGE_KEY) ?? {};
  setItem(STORAGE_KEY, {
    ...layouts,
    [userKey(userId)]: { version: PERSISTED_CHAT_LAYOUT_VERSION, ...layout },
  });
};

/**
 * Removes every persisted chat layout. Called on logout to match the legacy chat's
 * destroyChatCookie cleanup, so open dialogs don't restore after a logout/login.
 */
export const clearAllPersistedChatLayouts = (): void => {
  if (!hasWindow()) {
    return;
  }
  removeItem(STORAGE_KEY);
};

/** Keep only layoutIds that still map to a restorable conversation, preserving order. */
export const reconcilePersistedLayoutIds = (
  layoutIds: string[],
  restorableLayoutIds: Set<string>,
): string[] => layoutIds.filter(layoutId => restorableLayoutIds.has(layoutId));
