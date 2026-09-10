import type { TChatRealtimeCacheAction } from "./chatRealtimeCacheActions";
import { getCurrentUserId } from "./currentUser";

// The chat-privacy settings whose change affects the chat. A UserSettingsChanged for anything else
// is ignored (matches the legacy chat, which early-returns for non-privacy setting changes).
const CHAT_PRIVACY_SETTING_KEYS = new Set([
  "WhoCanChatWithMeInApp",
  "WhoCanGroupChatWithMeInApp",
  "WhoCanOneOnOnePartyWithMe",
  "WhoCanGroupPartyWithMe",
]);

export type TParsedChatRealtimeTyping = {
  kind: "typing";
  conversationId: string;
  userId: number;
};

export type TParsedChatRealtimeIncomingMessage = {
  kind: "incoming_message";
  conversationId: string;
  isSelfAuthored: boolean;
};

export type TParsedChatRealtimeFeatureIntervention = {
  kind: "feature_intervention";
  interventionType: "timeout" | "nudge";
  /** Conversation targeted by a timeout; undefined ⇒ user-level. */
  conversationId?: string;
  /** Epoch ms the timeout ends (timeout only). */
  endTimeMs?: number;
  /** Configured total timeout length in seconds (timeout only); for the intervention analytics. */
  timeoutDurationSeconds?: number;
  decisionEventId?: string;
  acknowledgeable?: boolean;
  title?: string;
  body?: string;
  timeoutStartTime?: string;
};

export type TParsedChatRealtimeConversationRemoved = {
  kind: "conversation_removed";
  conversationId: string;
};

export type TParsedChatRealtimeFriendshipRemoved = {
  kind: "friendship_removed";
  /** The unfriended/blocked user id(s) whose 1:1 conversation should be dropped. */
  userIds: number[];
};

export type TParsedChatRealtimeEvent =
  | TParsedChatRealtimeTyping
  | TParsedChatRealtimeIncomingMessage
  | TParsedChatRealtimeFeatureIntervention
  | TParsedChatRealtimeConversationRemoved
  | TParsedChatRealtimeFriendshipRemoved
  | {
      kind: "cache";
      actions: TChatRealtimeCacheAction[];
    };

type UnknownRecord = Record<string, unknown>;

function readString(record: UnknownRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return undefined;
}

function readBoolean(record: UnknownRecord, keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") {
      return value;
    }
  }
  return undefined;
}

function readNumber(record: UnknownRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function readStringArray(record: UnknownRecord, keys: string[]): string[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      const strings = value
        .map(item => {
          if (typeof item === "string" && item.length > 0) {
            return item;
          }
          if (typeof item === "number" && Number.isFinite(item)) {
            return String(item);
          }
          return undefined;
        })
        .filter((item): item is string => item !== undefined);
      if (strings.length > 0) {
        return strings;
      }
    }
  }
  return [];
}

function readNumberArray(record: UnknownRecord, keys: string[]): number[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      const numbers = value
        .map(item => {
          if (typeof item === "number" && Number.isFinite(item)) {
            return item;
          }
          if (typeof item === "string") {
            const parsed = Number.parseInt(item, 10);
            if (!Number.isNaN(parsed)) {
              return parsed;
            }
          }
          return undefined;
        })
        .filter((item): item is number => item !== undefined);
      if (numbers.length > 0) {
        return numbers;
      }
    }
  }
  return [];
}

function isUnknownRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

// FriendshipDestroyed carries the affected user ids in `EventArgs`. The platform shapes this as an
// object `{ UserId1, UserId2 }` (one id is the current user, the other is the removed friend), not
// the plain id array reactChat originally assumed — that mismatch is why removal silently no-op'd.
// A plain id array is still accepted for other/legacy senders. (Legacy AngularJS chat only worked
// because angular.forEach iterates an object's values.)
function readFriendshipUserIds(record: UnknownRecord): number[] {
  const fromArray = readNumberArray(record, [
    "EventArgs",
    "eventArgs",
    "event_args",
    "UserIds",
    "userIds",
    "user_ids",
  ]);
  if (fromArray.length > 0) {
    return fromArray;
  }

  const eventArgs = record.EventArgs ?? record.eventArgs ?? record.event_args;
  if (isUnknownRecord(eventArgs)) {
    const first = readNumber(eventArgs, ["UserId1", "userId1", "user_id_1"]);
    const second = readNumber(eventArgs, ["UserId2", "userId2", "user_id_2"]);
    const ids: number[] = [];
    if (first !== undefined) {
      ids.push(first);
    }
    if (second !== undefined) {
      ids.push(second);
    }
    return ids;
  }

  return [];
}

function readConversationOrChannelId(record: UnknownRecord): string | undefined {
  return readString(record, [
    "conversationId",
    "conversation_id",
    "ConversationId",
    "channelId",
    "channel_id",
    "ChannelId",
  ]);
}

function readActorUserId(record: UnknownRecord): number | undefined {
  const actor = record.Actor ?? record.actor;
  if (isUnknownRecord(actor)) {
    return readNumber(actor, ["Id", "id", "UserId", "user_id"]);
  }
  return undefined;
}

function normalizeDetailPayload(detail: unknown): UnknownRecord[] {
  if (detail === null || detail === undefined) {
    return [];
  }

  if (Array.isArray(detail)) {
    return detail.filter(isUnknownRecord);
  }

  if (isUnknownRecord(detail)) {
    return [detail];
  }

  return [];
}

function isSelfAuthoredMessage(record: UnknownRecord): boolean {
  const type = readString(record, ["Type", "type", "eventType", "event_type"])?.toLowerCase() ?? "";
  if (type.includes("newmessagebyself")) {
    return true;
  }

  const senderId =
    readActorUserId(record) ??
    readNumber(record, ["UserId", "user_id", "UserId", "senderUserId", "sender_user_id"]);
  const currentUserId = getCurrentUserId();
  return senderId != null && currentUserId !== null && senderId === currentUserId;
}

function isMessageEnvelope(record: UnknownRecord): boolean {
  const type = readString(record, ["Type", "type", "eventType", "event_type"])?.toLowerCase() ?? "";
  return (
    type.includes("newmessage") ||
    type.includes("new_message") ||
    type.includes("conversationmessage") ||
    type.includes("messagecreated") ||
    type.includes("systemmessagecreated") ||
    type === "message"
  );
}

/**
 * A removal/archival event that should force-close (remove) the open dialog, matching the legacy
 * chat: the current user was removed from a conversation/channel, or the channel was
 * archived/deleted. Participant-level events for OTHER users (participantsRemoved / removedFromGroup)
 * are intentionally excluded — those only refetch the roster, they don't close the dialog.
 */
function isConversationRemovalType(type: string): boolean {
  return (
    type.includes("removedfromconversation") ||
    type.includes("removedfromchannel") ||
    type.includes("channelarchived") ||
    type.includes("channeldeleted")
  );
}

function inferCacheActionsFromEnvelope(record: UnknownRecord): TChatRealtimeCacheAction[] {
  const actions: TChatRealtimeCacheAction[] = [];
  const type = readString(record, ["Type", "type", "eventType", "event_type"])?.toLowerCase() ?? "";

  const conversationId = readConversationOrChannelId(record);

  if (
    type.includes("newmessage") ||
    type.includes("new_message") ||
    type.includes("conversationmessage") ||
    type.includes("messagecreated") ||
    type.includes("systemmessagecreated") ||
    type === "message"
  ) {
    if (conversationId !== undefined) {
      actions.push({
        kind: "refetch_conversation_messages",
        conversationId,
      });
    }
    actions.push({ kind: "invalidate_user_conversations" });
    actions.push({ kind: "invalidate_conversation_metadata" });
    return actions;
  }

  if (
    type.includes("newconversation") ||
    type.includes("new_conversation") ||
    type.includes("participantsadded") ||
    type.includes("participants_added") ||
    type.includes("participantsremoved") ||
    type.includes("participants_removed") ||
    type.includes("removedfromgroup") ||
    type.includes("removed_from_group") ||
    type.includes("removedfromconversation") ||
    type.includes("conversationremoved") ||
    type.includes("conversation_removed") ||
    type.includes("addedtochannel") ||
    type.includes("channelcreated") ||
    type.includes("channelunarchived") ||
    type.includes("channelupdated") ||
    type.includes("channelarchived") ||
    type.includes("channeldeleted") ||
    type.includes("removedfromchannel")
  ) {
    actions.push({ kind: "invalidate_user_conversations" });
    if (conversationId !== undefined) {
      actions.push({
        kind: "invalidate_conversation_messages",
        conversationId,
        reason: "full",
      });
    }
    return actions;
  }

  if (type.includes("friendship") || type.includes("friend")) {
    actions.push({ kind: "invalidate_friends_directory" });
    actions.push({ kind: "invalidate_user_conversations" });
    return actions;
  }

  // User-tag change (display name / verified badge / username): refresh the friends directory
  // (contact info) and the conversation list (participant names are baked into conversation titles).
  if (type.includes("usertag")) {
    actions.push({ kind: "invalidate_friends_directory" });
    actions.push({ kind: "invalidate_user_conversations" });
    return actions;
  }

  // A settings-typed event WITHOUT a parseable `SettingsChanged` payload can't be confirmed as a
  // chat-privacy change, so refresh only the conversation list + metadata here — NOT chat settings
  // (staleTime: Infinity). chat_settings is invalidated solely on the privacy-filtered parse-level
  // path below, matching the legacy chat's "only privacy settings affect chat" rule.
  if (type.includes("settings")) {
    actions.push({ kind: "invalidate_conversation_metadata" });
    actions.push({ kind: "invalidate_user_conversations" });
    return actions;
  }

  if (type.includes("migration") || type.includes("reset")) {
    actions.push({ kind: "invalidate_user_conversations" });
    actions.push({ kind: "invalidate_conversation_metadata" });
    return actions;
  }

  if (conversationId !== undefined) {
    actions.push({
      kind: "invalidate_conversation_messages",
      conversationId,
      reason: "partial",
    });
  } else {
    actions.push({ kind: "invalidate_user_conversations" });
  }

  return actions;
}

/**
 * Parses a FeatureIntervention envelope (moderation nudge / timeout): delivered on the
 * `FeatureIntervention` subscription, gated on `abuseVector === "party_chat"`; the intervention
 * kind is `data.type` ("nudge" | "timeout").
 */
function parseFeatureIntervention(
  record: UnknownRecord,
): TParsedChatRealtimeFeatureIntervention | undefined {
  const abuseVector = readString(record, ["abuseVector", "abuse_vector", "AbuseVector"]);
  if (abuseVector !== "party_chat") {
    return undefined;
  }
  const type = readString(record, ["type", "Type", "eventType", "event_type"])?.toLowerCase();
  const decisionEventId = readString(record, [
    "decisionEventId",
    "decision_event_id",
    "DecisionEventId",
  ]);
  const acknowledgeable = readBoolean(record, ["acknowledgeable", "Acknowledgeable"]);
  const title = readString(record, ["title", "Title"]);
  const body = readString(record, ["body", "Body"]);

  if (type === "nudge") {
    return {
      kind: "feature_intervention",
      interventionType: "nudge",
      decisionEventId,
      acknowledgeable,
      title,
      body,
    };
  }
  if (type === "timeout") {
    const timeoutStartTime = readString(record, ["timeoutStartTime", "timeout_start_time"]);
    const timeoutDurationSeconds = readNumber(record, [
      "timeoutDurationSeconds",
      "timeout_duration_seconds",
    ]);
    const conversationId = readString(record, ["vectorTargetId", "vector_target_id"]);
    const startMs = timeoutStartTime != null ? new Date(timeoutStartTime).getTime() : Date.now();
    const base = Number.isNaN(startMs) ? Date.now() : startMs;
    const endTimeMs = base + (timeoutDurationSeconds ?? 0) * 1000;
    return {
      kind: "feature_intervention",
      interventionType: "timeout",
      conversationId,
      endTimeMs,
      timeoutDurationSeconds,
      decisionEventId,
      acknowledgeable,
      title,
      body,
      timeoutStartTime,
    };
  }
  return undefined;
}

export function parseChatRealtimeDetail(detail: unknown): TParsedChatRealtimeEvent[] {
  const rows = normalizeDetailPayload(detail);
  const events: TParsedChatRealtimeEvent[] = [];

  for (const row of rows) {
    const featureIntervention = parseFeatureIntervention(row);
    if (featureIntervention !== undefined) {
      events.push(featureIntervention);
      continue;
    }

    const typeRaw = readString(row, ["Type", "type", "eventType", "event_type"]) ?? "";
    const normalizedType = typeRaw.toLowerCase();

    if (normalizedType.includes("typing") || normalizedType === "participanttyping") {
      const conversationId = readConversationOrChannelId(row);
      const userId =
        readNumber(row, ["userId", "user_id", "UserId", "senderUserId", "sender_user_id"]) ??
        readActorUserId(row);

      if (conversationId !== undefined && userId !== undefined) {
        events.push({ kind: "typing", conversationId, userId });
        continue;
      }
    }

    // Conversation migration (ChatMigration namespace): `ConversationBackfilled` and
    // `ConversationReset` swap a conversation id for a channel id, so we invalidate BOTH ids'
    // message caches (and the conversation list) so whichever id a dialog holds reloads.
    if (
      normalizedType.includes("conversationbackfilled") ||
      normalizedType.includes("conversationreset")
    ) {
      const actions: TChatRealtimeCacheAction[] = [{ kind: "invalidate_user_conversations" }];
      const migratedIds = new Set(
        [
          readString(row, ["conversationId", "conversation_id", "ConversationId"]),
          readString(row, ["channelId", "channel_id", "ChannelId"]),
        ].filter((id): id is string => id !== undefined),
      );
      for (const migratedId of migratedIds) {
        actions.push({
          kind: "invalidate_conversation_messages",
          conversationId: migratedId,
          reason: "full",
        });
      }
      events.push({ kind: "cache", actions });
      continue;
    }

    // ChatModerationTypeEligibility: payload carries `channels_inspected` (conversation ids whose
    // moderation eligibility was re-evaluated). Match the legacy chat, which refetches those
    // conversations: invalidate the list + metadata and each inspected conversation's messages.
    // (Invalidating an unknown id is a harmless no-op — the parser has no conversation-list access.)
    const inspectedConversationIds = readStringArray(row, [
      "channels_inspected",
      "channelsInspected",
      "ChannelsInspected",
    ]);
    if (inspectedConversationIds.length > 0) {
      const actions: TChatRealtimeCacheAction[] = [
        { kind: "invalidate_user_conversations" },
        { kind: "invalidate_conversation_metadata" },
      ];
      for (const inspectedId of inspectedConversationIds) {
        actions.push({
          kind: "invalidate_conversation_messages",
          conversationId: inspectedId,
          reason: "full",
        });
      }
      events.push({ kind: "cache", actions });
      continue;
    }

    // UserSettingsChanged: payload carries `SettingsChanged` (the changed setting keys, e.g. chat
    // privacy). Refresh chat settings + metadata (+ conversations) so privacy-derived state updates
    // live. Full chat enable/disable teardown is intentionally out of scope for this pass.
    const changedSettings = readStringArray(row, [
      "SettingsChanged",
      "settingsChanged",
      "settings_changed",
    ]);
    if (changedSettings.length > 0) {
      // Only chat-privacy settings affect the chat; any other UserSettingsChanged is a no-op.
      if (changedSettings.some(setting => CHAT_PRIVACY_SETTING_KEYS.has(setting))) {
        events.push({
          kind: "cache",
          actions: [
            { kind: "invalidate_chat_settings" },
            { kind: "invalidate_conversation_metadata" },
            { kind: "invalidate_user_conversations" },
          ],
        });
      }
      continue;
    }

    // Friendship destroyed (unfriend / block): the server keeps the 1:1 conversation, so a refetch
    // won't drop it. Emit a dedicated event to remove it locally (parity with legacy removeFriend).
    // EventArgs holds the affected user id(s); with none, fall through to the friend refresh.
    if (normalizedType.includes("friendshipdestroyed")) {
      const userIds = readFriendshipUserIds(row);
      if (userIds.length > 0) {
        events.push({ kind: "friendship_removed", userIds });
        continue;
      }
    }

    // Removal / archival (self removed from a conversation/channel, or channel archived/deleted):
    // emit a dedicated event so the open dialog is force-closed (parity with the legacy chat), then
    // fall through so the cache action below still refreshes the conversation list.
    if (isConversationRemovalType(normalizedType)) {
      const removedConversationId = readConversationOrChannelId(row);
      if (removedConversationId !== undefined) {
        events.push({ kind: "conversation_removed", conversationId: removedConversationId });
      }
    }

    if (isMessageEnvelope(row)) {
      const conversationId = readConversationOrChannelId(row);
      if (conversationId !== undefined) {
        events.push({
          kind: "incoming_message",
          conversationId,
          isSelfAuthored: isSelfAuthoredMessage(row),
        });
      }
    }

    events.push({ kind: "cache", actions: inferCacheActionsFromEnvelope(row) });
  }

  return events;
}
