import { window as browserWindow } from "@rbx/core-lib/browser";

const HISTORY_SESSION_FIELDS = {
  robloxSearchSessions: ["omniSearchSessionId", "top", "games"],
} as const;

type HistorySessionStateKey = keyof typeof HISTORY_SESSION_FIELDS;

type HistorySessionFields<StateKey extends HistorySessionStateKey> =
  (typeof HISTORY_SESSION_FIELDS)[StateKey];

type SessionIds<Fields extends readonly string[]> = Readonly<Record<Fields[number], string>>;

type RestoredSessionIds<Fields extends readonly string[]> = Readonly<Partial<SessionIds<Fields>>>;

type HistoryState<StateKey extends string, Fields extends readonly string[]> = Readonly<{
  [Key in StateKey]: RestoredSessionIds<Fields>;
}>;

type HistorySessionStore<StateKey extends string, Fields extends readonly string[]> = Readonly<{
  read: () => RestoredSessionIds<Fields> | undefined;
  save: (sessions: SessionIds<Fields>) => void;
  getHistoryState: () => HistoryState<StateKey, Fields> | null;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createHistorySessionStore<const StateKey extends HistorySessionStateKey>(
  stateKey: StateKey,
): HistorySessionStore<StateKey, HistorySessionFields<StateKey>>;
export function createHistorySessionStore(
  stateKey: HistorySessionStateKey,
): HistorySessionStore<string, readonly string[]> {
  const fields = HISTORY_SESSION_FIELDS[stateKey];

  const read = (): RestoredSessionIds<readonly string[]> | undefined => {
    try {
      const state: unknown = browserWindow?.history.state;
      if (!isRecord(state)) {
        return undefined;
      }

      const saved = state[stateKey];
      if (!isRecord(saved)) {
        return undefined;
      }

      const sessions: Record<string, string> = {};
      fields.forEach(field => {
        const value = saved[field];
        if (typeof value === "string" && value !== "") {
          sessions[field] = value;
        }
      });
      return sessions;
    } catch {
      return undefined;
    }
  };

  const save = (sessions: SessionIds<readonly string[]>): void => {
    try {
      if (browserWindow === undefined) {
        return;
      }

      const state = browserWindow.history.state as unknown;
      const nextState = isRecord(state)
        ? { ...state, [stateKey]: sessions }
        : { [stateKey]: sessions };
      browserWindow.history.replaceState(nextState, "");
    } catch {
      // Sessions remain usable when history persistence is unavailable.
    }
  };

  const getHistoryState = (): HistoryState<string, readonly string[]> | null => {
    const sessions = read();
    if (sessions === undefined) {
      return null;
    }

    return { [stateKey]: sessions };
  };

  return { read, save, getHistoryState };
}
