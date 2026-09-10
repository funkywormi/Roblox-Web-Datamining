import { useCallback, useRef } from "react";
import type { KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { callBehaviour } from "@rbx/core-scripts/guac";
import { KEYSTROKE_FLUSH_REASON, sendChatKeystrokes } from "../utils/chatAnalytics";
import {
  KEYSTROKE_EVENT_TYPE,
  KEYSTROKE_SAMPLE_RATE,
  MAX_KEYSTROKE_DATA_LENGTH,
  isUserInKeystrokeSample,
} from "../utils/chatKeystrokes";
import { getCurrentUserId } from "../utils/currentUser";
import type { TChatKeystroke } from "../utils/chatKeystrokes";

// Keystroke collection is opt-in per environment via the "app-policy" GUAC behaviour, separate from
// the "chat-ui" behaviour that carries the chat feature flags.
const APP_POLICY_GUAC_BEHAVIOUR = "app-policy";

type TAppPolicy = {
  EnableKeystrokeCollection?: boolean;
};

const isAppPolicy = (value: unknown): value is TAppPolicy =>
  typeof value === "object" && value !== null;

export type TChatKeystrokeHandler = (event: KeyboardEvent<HTMLElement>) => void;

/**
 * Collects keydown/keyup batches from the message input and flushes them to the `appChatKeyStrokes`
 * eventstream event — on Enter (the message-send boundary) or once the buffer hits its cap.
 *
 * The buffer is per-hook-instance, so each open dialog batches its own keystrokes, matching the
 * per-dialog scope of the legacy AngularJS controller.
 */
export const useChatKeystrokeTelemetry = (): TChatKeystrokeHandler => {
  const { data } = useQuery({
    queryKey: [`guac/${APP_POLICY_GUAC_BEHAVIOUR}`],
    queryFn: () => callBehaviour<unknown>(APP_POLICY_GUAC_BEHAVIOUR),
    staleTime: Infinity,
  });

  const isCollectionEnabled =
    isAppPolicy(data) &&
    data.EnableKeystrokeCollection === true &&
    isUserInKeystrokeSample(getCurrentUserId(), KEYSTROKE_SAMPLE_RATE);

  const bufferRef = useRef<TChatKeystroke[]>([]);

  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!isCollectionEnabled) {
        return;
      }
      if (event.type !== "keyup" && event.type !== "keydown") {
        return;
      }
      const eventType =
        event.type === "keyup" ? KEYSTROKE_EVENT_TYPE.keyup : KEYSTROKE_EVENT_TYPE.keydown;
      bufferRef.current.push({ key: event.key, eventType, timestamp: Date.now() });

      // Enter *up* rather than down: the batch should include the full keystroke that submitted the
      // message, and Enter-down is where the send is triggered.
      if (event.key === "Enter" && eventType === KEYSTROKE_EVENT_TYPE.keyup) {
        sendChatKeystrokes(KEYSTROKE_FLUSH_REASON.enterPressed, bufferRef.current);
        bufferRef.current = [];
      } else if (bufferRef.current.length >= MAX_KEYSTROKE_DATA_LENGTH) {
        sendChatKeystrokes(KEYSTROKE_FLUSH_REASON.maxLengthReached, bufferRef.current);
        bufferRef.current = [];
      }
    },
    [isCollectionEnabled],
  );
};

export default useChatKeystrokeTelemetry;
