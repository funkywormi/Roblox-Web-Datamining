import * as z from "zod/mini";
import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";
import type { RealtimeClient } from "../realtime/lib/types";

export const PresenceTypes = {
  Offline: 0,
  Online: 1,
  InGame: 2,
  InStudio: 3,
} as const;

/** Fired on `document`; `detail` is a `Map` of user id to presence. */
export const presenceUpdateEventName = "Roblox.Presence.Update";

const presenceNotificationType = "PresenceBulkNotifications";
const presenceChangedType = "PresenceChanged";

const presenceChangedSchema = z.looseObject({
  Type: z.literal(presenceChangedType),
  UserId: z.number(),
  // An ISO date from the realtime service; anything else is treated as stale and refetched.
  SessionStarted: z.unknown(),
  PresenceReport: z.optional(z.unknown()),
});

type PresenceChanged = z.infer<typeof presenceChangedSchema>;

const userPresencesSchema = z.object({
  userPresences: z.array(z.looseObject({ userId: z.number() })),
});

export type PresenceClient = Pick<RealtimeClient, "Subscribe" | "Unsubscribe">;

const firePresenceEvent = (presences: Map<number, unknown>) => {
  document.dispatchEvent(new CustomEvent(presenceUpdateEventName, { detail: presences }));
};

const fetchPresences = async (userIds: number[]) => {
  const url = Url.parse(environmentUrls.presenceApi).getOrThrow().withPath("/v1/presence/users");
  const result = await http.post(url, { userIds }, userPresencesSchema, {
    credentials: "include",
  });
  return result.getOrThrow().userPresences;
};

/**
 * Re-fires realtime presence changes as `Roblox.Presence.Update`. Changes without a newer session
 * are refetched and fired again. Returns a function that stops listening.
 */
export const startPresenceUpdates = (client: PresenceClient): (() => void) => {
  const lastSessionStartedByUserId = new Map<number, PresenceChanged["SessionStarted"]>();

  const isNewer = ({ UserId, SessionStarted }: PresenceChanged) => {
    if (!lastSessionStartedByUserId.has(UserId)) {
      return true;
    }
    const last = lastSessionStartedByUserId.get(UserId);
    if (typeof SessionStarted === "string" && typeof last === "string") {
      return SessionStarted > last;
    }
    return typeof SessionStarted === "number" && typeof last === "number" && SessionStarted > last;
  };

  const onNotification = (detail: unknown) => {
    const changes = new Map<number, PresenceChanged>();
    for (const entry of Array.isArray(detail) ? detail : []) {
      const parsed = presenceChangedSchema.safeParse(entry);
      if (parsed.success) {
        changes.set(parsed.data.UserId, parsed.data);
      }
    }

    const presences = new Map<number, unknown>();
    const staleUserIds: number[] = [];
    for (const [userId, change] of changes) {
      if (change.PresenceReport != null && isNewer(change)) {
        presences.set(userId, change.PresenceReport);
        lastSessionStartedByUserId.set(userId, change.SessionStarted);
      } else {
        staleUserIds.push(userId);
      }
    }

    if (staleUserIds.length > 0) {
      fetchPresences(staleUserIds)
        .then(userPresences => {
          for (const userPresence of userPresences) {
            presences.set(userPresence.userId, userPresence);
          }
        })
        .catch((error: unknown) => {
          console.error(error);
        })
        .finally(() => {
          firePresenceEvent(presences);
        });
    }

    firePresenceEvent(presences);
  };

  client.Subscribe(presenceNotificationType, onNotification);
  return () => {
    client.Unsubscribe(presenceNotificationType, onNotification);
  };
};
