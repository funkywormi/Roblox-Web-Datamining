import type {
  TChatApiConversation,
  TChatApiMessage,
  TChatApiUser,
  TGetUserConversationsResponse,
} from "../types/api";
import type {
  TChatConversation,
  TChatMessage,
  TChatParticipant,
  TPresenceType,
} from "../types/chat";
import { deriveChatPolicyFlags } from "../adapters/chatPolicyAdapters";

const DEFAULT_AVATAR_URL = "";
const TIMESTAMP_BREAK_MS = 30_000;

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

const formatBriefTimestamp = (dateValue?: string): string => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return formatTime(date);
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatMessageTimestamp = (date: Date) => {
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return formatTime(date);
  }

  return `${new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date)} | ${formatTime(date)}`;
};

const toPresence = (presenceValue?: number | string): TPresenceType => {
  if (presenceValue === 1 || presenceValue === "Online") {
    return "Online";
  }
  if (presenceValue === 2 || presenceValue === "InGame") {
    return "InGame";
  }
  if (presenceValue === 3 || presenceValue === "InStudio") {
    return "InStudio";
  }
  return "Offline";
};

export const toChatParticipant = (user: TChatApiUser): TChatParticipant => {
  const displayName = user.combined_name ?? user.display_name ?? user.name ?? String(user.id);
  const username = user.name ?? displayName;

  return {
    id: user.id,
    displayName,
    username,
    avatarUrl: user.avatar_url ?? user.thumbnail_url ?? user.thumbnailUrl ?? DEFAULT_AVATAR_URL,
    profileUrl: `/users/${user.id}/profile`,
    presence: "Offline",
  };
};

const getParticipantUsers = (
  conversation: TChatApiConversation,
  currentUserId: number | null,
): TChatApiUser[] => {
  if (conversation.participants && conversation.participants.length > 0) {
    return conversation.participants.filter(user => user.id !== currentUserId);
  }

  const userData = conversation.user_data ?? {};
  return (conversation.participant_user_ids ?? [])
    .filter(userId => userId !== currentUserId)
    .map(userId => userData[String(userId)])
    .filter((user): user is TChatApiUser => user != null);
};

const getPreviewMessage = (conversation: TChatApiConversation): TChatApiMessage | undefined =>
  conversation.preview_message ?? conversation.messages?.find(message => message.is_previewable);

const getMessageContent = (message: TChatApiMessage): string =>
  message.preview_content ??
  message.content ??
  message.pieces?.map(piece => piece.content ?? "").join("") ??
  "";

export const toChatMessage = (
  message: TChatApiMessage,
  conversationId: string,
  previousMessage?: TChatMessage,
  timestampBreakMs: number = TIMESTAMP_BREAK_MS,
): TChatMessage => {
  const createdAt = message.created_at ? new Date(message.created_at) : null;
  const previousCreatedAt = previousMessage?.createdAt ? new Date(previousMessage.createdAt) : null;
  const shouldShowTimestamp =
    createdAt != null &&
    !Number.isNaN(createdAt.getTime()) &&
    (previousCreatedAt == null ||
      Number.isNaN(previousCreatedAt.getTime()) ||
      createdAt.getTime() - previousCreatedAt.getTime() > timestampBreakMs);

  return {
    id: String(message.id ?? `${conversationId}-${message.created_at ?? Date.now()}`),
    conversationId,
    senderUserId: message.sender_user_id,
    timestampLabel: shouldShowTimestamp ? formatMessageTimestamp(createdAt) : undefined,
    pieces: message.pieces?.map((piece, index) => ({
      id: piece.id ?? `${message.id ?? conversationId}-piece-${index}`,
      content: piece.content ?? "",
    })) ?? [{ id: `${message.id ?? conversationId}-piece`, content: getMessageContent(message) }],
    isSystemMessage: message.type === "system",
    isSending: String(message.id ?? "").startsWith("optimistic-"),
    isClusterMaster:
      previousMessage == null ||
      previousMessage.senderUserId !== message.sender_user_id ||
      shouldShowTimestamp,
    hasLinkCard: message.hasLinkCard,
    contentToDisplay: message.content_to_display,
    createdAt: message.created_at,
  };
};

/** A moderated/removed message is returned with `visibility: "hidden"` and blanked content;
 * rendering it would show an empty bubble, so it is dropped from the timeline. */
const HIDDEN_MESSAGE_VISIBILITY = "hidden";

export const toChatMessages = (
  messages: TChatApiMessage[] | undefined,
  conversationId: string,
  timestampBreakMs: number = TIMESTAMP_BREAK_MS,
): TChatMessage[] =>
  (messages ?? [])
    .filter(message => message.visibility !== HIDDEN_MESSAGE_VISIBILITY)
    .toSorted((firstMessage, secondMessage) => {
      const firstTime = new Date(firstMessage.created_at ?? 0).getTime();
      const secondTime = new Date(secondMessage.created_at ?? 0).getTime();
      return firstTime - secondTime;
    })
    .reduce<TChatMessage[]>((accumulator, message) => {
      accumulator.push(
        toChatMessage(message, conversationId, accumulator.at(-1), timestampBreakMs),
      );
      return accumulator;
    }, []);

export const isFriendPlaceholderConversation = (
  conversation: Pick<TChatConversation, "source">,
): boolean => conversation.source === "friends";

// Hides the 1:1 (Direct) conversation of an unfriended/blocked user until the server drops it —
// the server keeps returning it briefly, so a one-time cache removal would reappear on refetch.
export const filterRemovedFriendConversations = (
  conversations: TChatConversation[],
  removedUserIds: ReadonlySet<number>,
): TChatConversation[] =>
  removedUserIds.size === 0
    ? conversations
    : conversations.filter(
        conversation =>
          !(
            conversation.dialogType === "Direct" &&
            conversation.participants.some(participant => removedUserIds.has(participant.id))
          ),
      );

// Drops tombstoned user ids once the server no longer returns their 1:1 (removal has propagated).
// Returns the same reference when nothing changed so the caller can skip the write.
export const pruneRemovedFriendUserIds = (
  removedUserIds: number[],
  conversations: TChatConversation[],
): number[] => {
  if (removedUserIds.length === 0) {
    return removedUserIds;
  }
  const present = new Set(
    conversations
      .filter(conversation => conversation.dialogType === "Direct")
      .flatMap(conversation => conversation.participants.map(participant => participant.id)),
  );
  const next = removedUserIds.filter(id => present.has(id));
  return next.length === removedUserIds.length ? removedUserIds : next;
};

export const toChatConversation = (
  conversation: TChatApiConversation,
  currentUserId: number | null,
  timestampBreakMs: number = TIMESTAMP_BREAK_MS,
): TChatConversation => {
  const source = conversation.source?.toLowerCase();
  const conversationId =
    conversation.id ??
    `friends-${(conversation.participant_user_ids ?? []).toSorted((a, b) => a - b).join("-")}`;
  const participants = getParticipantUsers(conversation, currentUserId).map(toChatParticipant);
  const previewMessage = getPreviewMessage(conversation);
  const dialogType = conversation.type === "group" ? "Group" : "Direct";
  const fallbackTitle = participants.map(participant => participant.displayName).join(", ");
  const title =
    dialogType === "Group"
      ? (conversation.name ?? fallbackTitle)
      : fallbackTitle.length > 0
        ? fallbackTitle
        : (conversation.name ?? "");

  const policyFlags = deriveChatPolicyFlags(conversation, undefined);

  return {
    id: conversationId,
    layoutId: conversationId ? `conv_${conversationId}` : "",
    dialogType,
    title,
    participants,
    messages: toChatMessages(conversation.messages, conversationId, timestampBreakMs),
    preview: previewMessage ? getMessageContent(previewMessage) : "",
    lastUpdatedLabel: formatBriefTimestamp(previewMessage?.created_at ?? conversation.updated_at),
    unreadCount: conversation.unread_message_count ?? 0,
    isOpen: false,
    isMinimized: false,
    isFocused: false,
    isTyping: false,
    typingParticipantIds: [],
    currentScreen: "Default",
    isConversationUnavailableWithUser: policyFlags.isConversationUnavailableWithUser,
    source,
    moderationType: conversation.moderation_type?.toLowerCase(),
    createdAt: conversation.created_at,
    createdBy: conversation.created_by,
    isUserPending: policyFlags.isUserPending,
    isOsaBlocked: policyFlags.isOsaBlocked,
    isOneToOneOsaServerUnacknowledged: policyFlags.isOneToOneOsaServerUnacknowledged,
    isGroupOsaUnacknowledged: policyFlags.isGroupOsaUnacknowledged,
    isOsaContextCardEligible: policyFlags.isOsaContextCardEligible,
    isChatOptInBlocked: policyFlags.isChatOptInBlocked,
  };
};

/**
 * Flattens the paginated `get-user-conversations` responses into a single ordered
 * conversation list, de-duplicating by id. Cursor pagination can surface the same
 * conversation on two pages when roster activity shifts a conversation between fetches;
 * without de-duping that yields duplicate React keys and double-rendered rows. The first
 * occurrence wins — pages arrive newest-first, so it reflects the most recent placement.
 */
export const flattenConversationPages = (
  pages: TGetUserConversationsResponse[],
  currentUserId: number | null,
  timestampBreakMs: number = TIMESTAMP_BREAK_MS,
): TChatConversation[] => {
  const seenIds = new Set<string>();
  const conversations: TChatConversation[] = [];

  for (const page of pages) {
    for (const apiConversation of page.conversations) {
      const conversation = toChatConversation(apiConversation, currentUserId, timestampBreakMs);
      if (seenIds.has(conversation.id)) {
        continue;
      }
      seenIds.add(conversation.id);
      conversations.push(conversation);
    }
  }

  // Drop a friend placeholder once a real Direct conversation with that friend exists — the friend
  // list keeps returning the suggestion, so a first incoming message would otherwise show the
  // friend twice (a placeholder keyed by friend id + the real conversation keyed by conversation id).
  const friendIdsWithRealConversation = new Set<number>();
  for (const conversation of conversations) {
    if (conversation.dialogType === "Direct" && !isFriendPlaceholderConversation(conversation)) {
      for (const participant of conversation.participants) {
        friendIdsWithRealConversation.add(participant.id);
      }
    }
  }

  return conversations.filter(
    conversation =>
      !isFriendPlaceholderConversation(conversation) ||
      !conversation.participants.some(participant =>
        friendIdsWithRealConversation.has(participant.id),
      ),
  );
};

export const applyPresences = (
  conversations: TChatConversation[],
  presencesByUserId: Record<number, number | string | undefined>,
): TChatConversation[] =>
  conversations.map(conversation => ({
    ...conversation,
    participants: conversation.participants.map(participant => ({
      ...participant,
      presence: toPresence(presencesByUserId[participant.id]),
    })),
  }));

/** Layers moderation-timeout state (`isTimedOut` + `timeoutExpiresAtMs`) onto conversations. */
export const applyModerationTimeouts = (
  conversations: TChatConversation[],
  resolveTimeout: (
    conversationId: string,
    moderationType: string | undefined,
  ) => { isTimedOut: boolean; expiresAtMs: number | null },
): TChatConversation[] =>
  conversations.map(conversation => {
    const { isTimedOut, expiresAtMs } = resolveTimeout(
      conversation.id,
      conversation.moderationType,
    );
    return { ...conversation, isTimedOut, timeoutExpiresAtMs: expiresAtMs ?? undefined };
  });
