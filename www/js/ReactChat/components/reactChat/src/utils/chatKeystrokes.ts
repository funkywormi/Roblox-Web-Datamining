// Keystroke telemetry buffering for the `appChatKeyStrokes` eventstream event. Legacy source of
// truth: WebApps/Roblox.Chat.WebApp/.../chat/controllers/dialogController.js ($scope.keyStroke) and
// constants/apiParamsInitialization.js (dialogParams).

/** Wire values for the keystroke phase; keydown is 0 and keyup is 1. */
export const KEYSTROKE_EVENT_TYPE = {
  keydown: 0,
  keyup: 1,
} as const;

export type TChatKeystroke = {
  key: string;
  eventType: (typeof KEYSTROKE_EVENT_TYPE)[keyof typeof KEYSTROKE_EVENT_TYPE];
  timestamp: number;
};

/** Buffer size that forces a `maxLengthReached` flush (legacy dialogParams.maxKeystrokeDataLength). */
export const MAX_KEYSTROKE_DATA_LENGTH = 200;

/** Fraction of users whose keystrokes are collected (legacy dialogParams.keystrokeSampleRate). */
export const KEYSTROKE_SAMPLE_RATE = 1.0;

/**
 * Deterministic per-user sampling: a rate of 1/N collects every Nth user id, so the same user is
 * consistently in or out across sessions. A rate of 0 (or an unknown user) collects nobody.
 */
export const isUserInKeystrokeSample = (
  userId: number | null | undefined,
  sampleRate: number,
): boolean => {
  if (userId == null || sampleRate <= 0) {
    return false;
  }
  const everyNthUser = Math.round(1 / sampleRate);
  return userId % everyNthUser === 0;
};

/**
 * The eventstream schema carries the batch as three parallel arrays rather than an array of objects,
 * so the buffer is transposed on flush. Index i of each array describes the same keystroke.
 */
export const splitKeystrokeData = (
  keystrokes: readonly TChatKeystroke[],
): { keyPressedData: string[]; eventTypeData: number[]; timestampData: number[] } => ({
  keyPressedData: keystrokes.map(({ key }) => key),
  eventTypeData: keystrokes.map(({ eventType }) => eventType),
  timestampData: keystrokes.map(({ timestamp }) => timestamp),
});
