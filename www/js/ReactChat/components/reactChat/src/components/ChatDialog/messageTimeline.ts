import type { TChatMessage } from "../../types/chat";

export type TMessageGroupTimelineItem = {
  type: "MessageGroup";
  id: string;
  messages: TChatMessage[];
};

export type TMessageTimelineItem =
  | TMessageGroupTimelineItem
  | {
      type: "Timestamp";
      id: string;
      label: string;
    }
  | {
      type: "System";
      id: string;
      label: string;
    };

const getSenderKey = (message: TChatMessage) => String(message.senderUserId);

/**
 * Build the chronological render timeline: time-gap separators, system notices, and grouped
 * user-message bubbles — all in server order, matching the legacy AngularJS chat.
 *
 * System messages (settings/TC reminders, joined/left/renamed events) render INLINE in place,
 * and — like user messages — emit a `Timestamp` separator when there is a time gap before them
 * (Angular's `buildTimeStamp` runs for every message regardless of type). They are not pinned;
 * ordering follows the incoming (server-sorted) `messages` array.
 */
export const createTimelineItems = (messages: TChatMessage[]): TMessageTimelineItem[] => {
  const timelineItems: TMessageTimelineItem[] = [];
  let currentMessageGroup: TMessageGroupTimelineItem | null = null;

  messages.forEach(message => {
    // A time-gap timestamp precedes any message type, breaking the current group.
    if (message.timestampLabel) {
      currentMessageGroup = null;
      timelineItems.push({
        type: "Timestamp",
        id: `${message.id}-timestamp`,
        label: message.timestampLabel,
      });
    }

    if (message.isSystemMessage) {
      currentMessageGroup = null;
      timelineItems.push({
        type: "System",
        id: message.id,
        label: message.pieces.map(piece => piece.content).join(" "),
      });
      return;
    }

    const currentGroupFirstMessage = currentMessageGroup?.messages[0];
    const shouldStartNewGroup =
      currentGroupFirstMessage === undefined ||
      getSenderKey(currentGroupFirstMessage) !== getSenderKey(message);

    if (shouldStartNewGroup) {
      currentMessageGroup = {
        type: "MessageGroup",
        id: `${message.id}-group`,
        messages: [message],
      };
      timelineItems.push(currentMessageGroup);
      return;
    }

    currentMessageGroup?.messages.push(message);
  });

  return timelineItems;
};
