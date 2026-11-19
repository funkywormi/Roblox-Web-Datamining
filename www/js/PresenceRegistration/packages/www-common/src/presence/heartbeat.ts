import * as z from "zod/mini";
import environmentUrls from "@rbx/environment-urls";
import { document, window } from "@rbx/core-lib/browser";
import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";

// Marks the user as online on the website for friends. Used by the .NET presenceRegistration SCC and
// by Next.js pages.

export const defaultIntervalMs = 30000;

export const activeEvents = [
  "click",
  "dblclick",
  "focus",
  "hover",
  "keypress",
  "mousedown",
  "mouseenter",
  "mouseover",
  "scroll",
  "touchmove",
  "touchstart",
] as const;

export const inactiveEvents = ["blur"] as const;

const configSchema = z.object({
  isEnabled: z.optional(z.boolean()),
  rolloutPercentage: z.optional(z.number()),
  intervalTimeMs: z.optional(z.number()),
});

const apiGateway = () => Url.parse(environmentUrls.apiGatewayUrl).getOrThrow();

/**
 * Returns the pulse interval in ms. Returns `"gatedOff"` if `user-heartbeats` is off for this user,
 * or `"configFailed"` if guac can't be read.
 */
export const getPulseIntervalMs = async (
  userId: number,
): Promise<number | "gatedOff" | "configFailed"> => {
  const result = await http.get(
    apiGateway().withPath("/guac-v2/v1/bundles/user-heartbeats"),
    configSchema,
    { credentials: "include" },
  );
  if (result.isErr()) {
    return "configFailed";
  }
  const config = result.value;
  if (config.isEnabled !== true || userId % 100 >= (config.rolloutPercentage ?? 0)) {
    return "gatedOff";
  }
  return config.intervalTimeMs ?? defaultIntervalMs;
};

// The id is inside the `RBXSessionTracker` cookie value (`sessionid=<uuid>`). Matches the raw cookie
// string because decoding every cookie throws on one malformed value from any site.
const getSessionId = (): string =>
  // eslint-disable-next-line no-restricted-properties -- reads the raw string; see above
  /sessionid=([a-f0-9-]{36})/.exec(document?.cookie ?? "")?.[1] ?? "unknown";

/** Resolves `true` when the pulse was accepted. */
export const sendPulse = async (): Promise<boolean> => {
  // A missed pulse is fine; the next one registers presence again.
  const result = await http.postUntyped(
    apiGateway().withPath("/user-heartbeats-api/pulse"),
    {
      clientSideTimestampEpochMs: Date.now(),
      sessionInfo: { sessionId: getSessionId() },
      locationInfo: { websiteLocationInfo: { url: window?.location.href ?? "" } },
    },
    { credentials: "include" },
  );
  return result.isOk();
};

/**
 * Sent once at start: `started`, `gatedOff` or `configFailed`.
 * Then sent for each pulse: `sent` or `failed`.
 */
export type PresenceHeartbeatEvent = "started" | "gatedOff" | "configFailed" | "sent" | "failed";

/**
 * Pulses now, then again after each interval only if the user was active in it. Activity after an
 * idle interval pulses right away. Returns a function that stops pulsing.
 */
export const startPresenceHeartbeat = (
  userId: number,
  onEvent?: (event: PresenceHeartbeatEvent) => void,
): (() => void) => {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let waiting = false;
  let active = false;
  let intervalMs = defaultIntervalMs;

  const pulse = () => {
    waiting = true;
    active = false;
    // eslint-disable-next-line @rbx/promises/prefer-query-mutation, no-void -- fire-and-forget heartbeat
    void sendPulse().then(ok => {
      onEvent?.(ok ? "sent" : "failed");
    });
    timer = setTimeout(() => {
      if (active) {
        pulse();
      } else {
        waiting = false;
      }
    }, intervalMs);
  };
  const onActive = () => {
    if (waiting) {
      active = true;
    } else {
      pulse();
    }
  };
  const onInactive = () => {
    active = false;
  };

  const removeListeners = () => {
    activeEvents.forEach(type => {
      window?.removeEventListener(type, onActive);
    });
    inactiveEvents.forEach(type => {
      window?.removeEventListener(type, onInactive);
    });
  };

  // eslint-disable-next-line @rbx/promises/prefer-query-mutation, no-void -- starts a timer loop, not a fetch
  void getPulseIntervalMs(userId).then(interval => {
    if (stopped) {
      return;
    }
    if (typeof interval === "string") {
      onEvent?.(interval);
      return;
    }
    intervalMs = interval;
    onEvent?.("started");
    activeEvents.forEach(type => {
      window?.addEventListener(type, onActive, { passive: true });
    });
    inactiveEvents.forEach(type => {
      window?.addEventListener(type, onInactive);
    });
    pulse();
  });

  return () => {
    stopped = true;
    clearTimeout(timer);
    removeListeners();
  };
};
