import environmentUrls from "@rbx/environment-urls";
import { get, post } from "../../http";
import { sendDurableReplayEvent } from "../utils/events";

const REPLAY_CONFIG_URL = `${environmentUrls.apiGatewayUrl}/realtime-replay-api/v1/config`;
const REPLAY_URL = `${environmentUrls.apiGatewayUrl}/realtime-replay-api/v1/replay`;

interface DurableReplayerOptions {
  getLastSeenSequenceNumbers: () => Record<string, number>;
  processNotification: (namespace: string, detail: unknown, seqNum: number) => void;
  updateSequenceNumber: (namespace: string, seqNum: number) => void;
  onGapDetected: (namespaces: string[]) => void;
  log: (message: string) => void;
  isPollingEnabled?: boolean;
  pollingBaseIntervalMs?: number;
  pollingMaxIntervalMs?: number;
  pollingBackoffMultiplier?: number;
  pollingRetryMaxAttempts?: number;
  isGapDetectionEnabled?: boolean;
}

interface PendingTarget {
  seqNum: number;
  attempts: number;
  lastSeenAtDetection: number;
}

interface ConfigNamespaceSettings {
  maxNotifsReplayed: number;
}

interface ReplayConfigResponse {
  namespaces?: Record<string, ConfigNamespaceSettings>;
}

interface ReplayNotificationEntry {
  namespace: string;
  detail: string;
  sequenceNumber: number;
}

interface ReplayResponse {
  notifications: ReplayNotificationEntry[];
  namespacesWithGap: string[];
  updatedSequenceNumbers: Record<string, number>;
}

export interface DurableReplayer {
  fetchConfig: () => Promise<void>;
  maybeRequestReplay: () => Promise<void>;
  isDurableNamespace: (namespace: string) => boolean;
  startPolling: () => void;
  stopPolling: () => void;
  onLiveNotificationReceived: (namespace: string, seqNum: number) => void;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const DEFAULT_POLLING_BASE_INTERVAL_MS = 30000;
const DEFAULT_POLLING_MAX_INTERVAL_MS = 300000;
const DEFAULT_POLLING_BACKOFF_MULTIPLIER = 2;
const DEFAULT_POLLING_RETRY_MAX_ATTEMPTS = 3;
// Aligned with game-engine SimpleTimer minimum period (2026-08-25):
// https://github.rbx.com/Roblox/game-engine/blob/master/Client/Base/include/Base/SimpleTimer.h
const MIN_POLL_DELAY_MS = 17;

const createDurableReplayer = ({
  getLastSeenSequenceNumbers,
  processNotification,
  updateSequenceNumber,
  onGapDetected,
  log,
  isPollingEnabled = false,
  pollingBaseIntervalMs = DEFAULT_POLLING_BASE_INTERVAL_MS,
  pollingMaxIntervalMs = DEFAULT_POLLING_MAX_INTERVAL_MS,
  pollingBackoffMultiplier = DEFAULT_POLLING_BACKOFF_MULTIPLIER,
  pollingRetryMaxAttempts = DEFAULT_POLLING_RETRY_MAX_ATTEMPTS,
  isGapDetectionEnabled = false,
}: DurableReplayerOptions): DurableReplayer => {
  let durableNamespaceConfig: Record<string, ConfigNamespaceSettings> | null = null;
  let isReplayInFlight = false;

  // Tail-loss polling state
  let pollingTimerId: ReturnType<typeof setTimeout> | null = null;
  let currentPollingIntervalMs = pollingBaseIntervalMs;
  let isPollingActive = false;

  // Gap detection state
  let pendingTargetSeqNums: Record<string, PendingTarget> = {};

  const isDurableNamespace = (namespace: string): boolean => {
    return durableNamespaceConfig != null && namespace in durableNamespaceConfig;
  };

  const applyUpdatedSequenceNumbers = (
    updatedSequenceNumbers: Record<string, number> | undefined,
    namespacesWithGap: string[] | undefined,
  ): void => {
    if (!updatedSequenceNumbers) {
      return;
    }

    const gapSet = new Set(namespacesWithGap ?? []);

    for (const [namespace, serverSeqNum] of Object.entries(updatedSequenceNumbers)) {
      const hasGap = gapSet.has(namespace);
      const serverIsAhead = serverSeqNum > (getLastSeenSequenceNumbers()[namespace] ?? 0);

      if (hasGap || serverIsAhead) {
        updateSequenceNumber(namespace, serverSeqNum);
      }
    }
  };

  const processReplayResponse = (
    responseData: ReplayResponse,
  ): { replayed: number; gapNamespaces: string[] } => {
    const { notifications, namespacesWithGap, updatedSequenceNumbers } = responseData;

    let replayed = 0;
    if (notifications.length > 0) {
      for (const entry of notifications) {
        if (!entry.namespace || !entry.detail) {
          continue;
        }

        let detail: Record<string, unknown>;
        try {
          const parsed: unknown = JSON.parse(entry.detail);
          if (!isRecord(parsed)) {
            continue;
          }
          detail = parsed;
        } catch {
          continue;
        }

        processNotification(entry.namespace, detail, entry.sequenceNumber);
        replayed += 1;
      }

      for (let i = 0; i < replayed; i += 1) {
        sendDurableReplayEvent("NotificationReplayed");
      }
      const deduped = notifications.length - replayed;
      for (let i = 0; i < deduped; i += 1) {
        sendDurableReplayEvent("NotificationDeduped");
      }
    }

    if (namespacesWithGap.length > 0) {
      sendDurableReplayEvent("GapDetected");
      for (const ns of namespacesWithGap) {
        sendDurableReplayEvent(`GapDetected_${ns}`);
      }
      onGapDetected(namespacesWithGap);
    }

    applyUpdatedSequenceNumbers(updatedSequenceNumbers, namespacesWithGap);

    return { replayed, gapNamespaces: namespacesWithGap };
  };

  const reEnqueueOrExhaust = (ns: string, target: PendingTarget): void => {
    const nextAttempt = target.attempts + 1;
    if (nextAttempt > pollingRetryMaxAttempts) {
      const existing = pendingTargetSeqNums[ns];
      if (existing && existing.seqNum <= target.seqNum) {
        const { [ns]: _, ...rest } = pendingTargetSeqNums;
        pendingTargetSeqNums = rest;
      }
      sendDurableReplayEvent("TailLossRetryExhausted");
      log(
        `[DurableReplayer] retry exhausted: ns=${ns} seqNum=${target.seqNum} attempts=${nextAttempt}`,
      );
    } else {
      const existing = pendingTargetSeqNums[ns];
      if (!existing || existing.seqNum <= target.seqNum) {
        pendingTargetSeqNums[ns] = {
          seqNum: target.seqNum,
          attempts: nextAttempt,
          lastSeenAtDetection: target.lastSeenAtDetection,
        };
      }
      sendDurableReplayEvent("TailLossRetryReenqueued");
      log(
        `[DurableReplayer] retry re-enqueued: ns=${ns} seqNum=${target.seqNum} attempts=${nextAttempt}`,
      );
    }
  };

  const maybeRequestReplay = async (): Promise<void> => {
    if (!durableNamespaceConfig || Object.keys(durableNamespaceConfig).length === 0) {
      return;
    }

    if (isReplayInFlight) {
      return;
    }

    isReplayInFlight = true;
    const hadTargets = Object.keys(pendingTargetSeqNums).length > 0;
    const targetSnapshot = { ...pendingTargetSeqNums };

    try {
      const lastSeen = getLastSeenSequenceNumbers();
      const namespaceLastSeenSequenceNumbers: Record<string, number> = {};

      for (const namespace of Object.keys(durableNamespaceConfig)) {
        const pending = targetSnapshot[namespace];
        if (pending) {
          namespaceLastSeenSequenceNumbers[namespace] = pending.lastSeenAtDetection;
        } else {
          namespaceLastSeenSequenceNumbers[namespace] = lastSeen[namespace] ?? 0;
        }
      }

      const namespaceTargetSequenceNumbers: Record<string, number> = {};
      for (const [ns, target] of Object.entries(targetSnapshot)) {
        namespaceTargetSequenceNumbers[ns] = target.seqNum;
      }

      sendDurableReplayEvent("RequestSent");

      const body: Record<string, unknown> = { namespaceLastSeenSequenceNumbers };
      if (Object.keys(namespaceTargetSequenceNumbers).length > 0) {
        body.namespaceTargetSequenceNumbers = namespaceTargetSequenceNumbers;
      }

      const response = await post<ReplayResponse>({ url: REPLAY_URL, withCredentials: true }, body);

      const { replayed, gapNamespaces } = processReplayResponse(response.data);
      sendDurableReplayEvent("RequestSuccess");

      if (isPollingActive) {
        const origin = hadTargets ? "gap" : "poll";

        if (replayed > 0) {
          currentPollingIntervalMs = pollingBaseIntervalMs;
          sendDurableReplayEvent(`TailLossPollingReset_${origin}`);
        } else {
          currentPollingIntervalMs = Math.min(
            currentPollingIntervalMs * pollingBackoffMultiplier,
            pollingMaxIntervalMs,
          );
          sendDurableReplayEvent(`TailLossPollingBackoff_${origin}`);
        }

        const updatedLastSeen = getLastSeenSequenceNumbers();
        const gapSet = new Set(gapNamespaces);
        const retained: Record<string, PendingTarget> = {};

        for (const [ns, entry] of Object.entries(pendingTargetSeqNums)) {
          const snapshotted = targetSnapshot[ns];
          if (!snapshotted || entry.seqNum > snapshotted.seqNum) {
            retained[ns] = entry;
          }
        }
        pendingTargetSeqNums = retained;

        for (const [ns, target] of Object.entries(targetSnapshot)) {
          if (gapSet.has(ns)) {
            sendDurableReplayEvent("TailLossRetryGapExpired");
            log(
              `[DurableReplayer] retry gap expired: ns=${ns} seqNum=${target.seqNum} attempts=${target.attempts}`,
            );
          } else if ((updatedLastSeen[ns] ?? 0) >= target.seqNum) {
            sendDurableReplayEvent("TailLossTargetSatisfied");
            log(
              `[DurableReplayer] target satisfied: ns=${ns} seqNum=${target.seqNum} attempts=${target.attempts}`,
            );
          } else {
            reEnqueueOrExhaust(ns, target);
          }
        }

        if (Object.keys(pendingTargetSeqNums).length > 0) {
          currentPollingIntervalMs = 0;
          sendDurableReplayEvent("TailLossGapAccumulatedTargets");
        } else if (currentPollingIntervalMs === 0) {
          currentPollingIntervalMs = pollingBaseIntervalMs;
        }
      }
    } catch (e: unknown) {
      sendDurableReplayEvent("RequestFailure");
      log(`[DurableReplayer] replay request failed: ${String(e)}`);

      if (isPollingActive) {
        for (const [ns, target] of Object.entries(targetSnapshot)) {
          reEnqueueOrExhaust(ns, target);
        }

        if (Object.keys(pendingTargetSeqNums).length > 0) {
          currentPollingIntervalMs = 0;
        } else if (currentPollingIntervalMs === 0) {
          currentPollingIntervalMs = pollingBaseIntervalMs;
        }
      }
    } finally {
      isReplayInFlight = false;
    }
  };

  const scheduleNextPoll = (): void => {
    if (!isPollingActive) {
      return;
    }
    if (pollingTimerId !== null) {
      clearTimeout(pollingTimerId);
      pollingTimerId = null;
    }
    const delay = Math.max(currentPollingIntervalMs, MIN_POLL_DELAY_MS);
    pollingTimerId = setTimeout(() => {
      pollingTimerId = null;
      if (!isPollingActive) {
        return;
      }
      sendDurableReplayEvent("TailLossPollingFired");
      log(`[DurableReplayer] tail-loss poll fired (interval=${delay}ms)`);
      maybeRequestReplay()
        .catch(() => undefined)
        .finally(() => {
          scheduleNextPoll();
        });
    }, delay);
  };

  const startPolling = (): void => {
    if (!isPollingEnabled || isPollingActive) {
      return;
    }
    isPollingActive = true;
    currentPollingIntervalMs = pollingBaseIntervalMs;
    sendDurableReplayEvent("TailLossPollingStarted");
    log(`[DurableReplayer] tail-loss polling started (base=${pollingBaseIntervalMs}ms)`);
    scheduleNextPoll();
  };

  const stopPolling = (): void => {
    if (!isPollingActive) {
      return;
    }
    isPollingActive = false;
    if (pollingTimerId !== null) {
      clearTimeout(pollingTimerId);
      pollingTimerId = null;
    }
    pendingTargetSeqNums = {};
    sendDurableReplayEvent("TailLossPollingStopped");
    log("[DurableReplayer] tail-loss polling stopped");
  };

  const fetchConfig = async (): Promise<void> => {
    try {
      const response = await get<ReplayConfigResponse>({
        url: REPLAY_CONFIG_URL,
        withCredentials: true,
      });
      const { namespaces } = response.data;
      if (namespaces) {
        durableNamespaceConfig = namespaces;
        sendDurableReplayEvent("ConfigFetchSuccess");
        maybeRequestReplay().catch(() => undefined);
      }
    } catch (e: unknown) {
      sendDurableReplayEvent("ConfigFetchFailure");
      log(`[DurableReplayer] fetchConfig failed: ${String(e)}`);
    }
  };

  const onLiveNotificationReceived = (namespace: string, seqNum: number): void => {
    if (!isGapDetectionEnabled || !isPollingActive) {
      return;
    }
    if (!isDurableNamespace(namespace)) {
      return;
    }

    const lastSeen = getLastSeenSequenceNumbers()[namespace] ?? 0;
    if (lastSeen === 0) {
      return;
    }

    if (seqNum > lastSeen + 1) {
      if ((pendingTargetSeqNums[namespace]?.seqNum ?? 0) >= seqNum) {
        return;
      }
      pendingTargetSeqNums[namespace] = { seqNum, attempts: 0, lastSeenAtDetection: lastSeen };
      sendDurableReplayEvent("TailLossGapDetected");
      log(
        `[DurableReplayer] gap detected: namespace=${namespace} lastSeen=${lastSeen} received=${seqNum}`,
      );

      if (!isReplayInFlight) {
        if (pollingTimerId !== null) {
          clearTimeout(pollingTimerId);
          pollingTimerId = null;
        }
        maybeRequestReplay()
          .catch(() => undefined)
          .finally(() => {
            scheduleNextPoll();
          });
      }
    } else if (seqNum === lastSeen + 1) {
      currentPollingIntervalMs = pollingBaseIntervalMs;
    }
  };

  return {
    fetchConfig,
    maybeRequestReplay,
    isDurableNamespace,
    startPolling,
    stopPolling,
    onLiveNotificationReceived,
  };
};

export default createDurableReplayer;
