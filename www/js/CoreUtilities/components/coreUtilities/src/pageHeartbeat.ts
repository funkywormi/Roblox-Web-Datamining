import environmentUrls from "@rbx/environment-urls";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import {
  activeEvents,
  defaultRolloutPermille,
  defaultActivityTimeoutMs,
  defaultHeartbeatPulseIntervalMs,
  defaultWorkerVersion,
} from "@rbx/page-heartbeat-worker";

const { CurrentUser } = window.Roblox;

class PageHeartbeatScheduler {
  lastActiveTime;

  heartbeatCount;

  heartbeatPulseIntervalMs;

  activityTimeoutMs;

  workerVersion;

  worker;

  isRunning = false;

  constructor(heartbeatPulseIntervalMs: number, activityTimeoutMs: number, workerVersion: number) {
    this.lastActiveTime = new Date();
    this.heartbeatCount = 1;
    this.heartbeatPulseIntervalMs = heartbeatPulseIntervalMs;
    this.activityTimeoutMs = activityTimeoutMs;
    this.workerVersion = workerVersion;
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (window.Worker) {
      this.worker = this.createWorker();
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (this.worker) {
        this.worker.onmessage = () => {
          this.onInterval();
        };
      }
    } else {
      this.worker = null;
    }
  }

  createWorker() {
    const WORKER_COMPONENT = "PageHeartbeatWorker";
    const URL_NOT_FOUND = "URL_NOT_FOUND";
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const websiteUrl = environmentUrls.websiteUrl ?? URL_NOT_FOUND;
    const workerUrl = `${websiteUrl}/worker-resources/script/?component=${WORKER_COMPONENT}&v=${this.workerVersion}`;

    const worker = new Worker(workerUrl);
    return worker;
  }

  onActiveEvent() {
    this.lastActiveTime = new Date();
  }

  start() {
    if (this.isRunning) {
      return;
    }

    if (this.worker) {
      this.worker.postMessage(this.heartbeatPulseIntervalMs);
    } else {
      setInterval(() => {
        this.onInterval();
      }, this.heartbeatPulseIntervalMs);
    }

    this.isRunning = true;
  }

  onInterval() {
    const currentTime = new Date();
    const thresholdTime = new Date(currentTime.getTime() - this.activityTimeoutMs);
    if (this.lastActiveTime >= thresholdTime) {
      sendEventWithTarget(
        "pageHeartbeat_v2",
        `heartbeat${this.heartbeatCount}`,
        {},
        targetTypes.WWW,
      );
      this.incrementCount();
    }
  }

  incrementCount() {
    this.heartbeatCount += 1;
  }
}

type GuacConfig = {
  isEnabled: boolean;
  rolloutPermille: number;
  activityTimeoutMs: number;
  heartbeatPulseIntervalMs: number;
  workerVersion: number;
};

export default (): void => {
  if (!CurrentUser?.userId) {
    return;
  }

  const config: GuacConfig = {
    isEnabled: true,
    rolloutPermille: defaultRolloutPermille,
    activityTimeoutMs: defaultActivityTimeoutMs,
    heartbeatPulseIntervalMs: defaultHeartbeatPulseIntervalMs,
    workerVersion: defaultWorkerVersion,
  };

  if (!(config.isEnabled && parseInt(CurrentUser.userId, 10) % 1000 < config.rolloutPermille)) {
    return;
  }

  const scheduler = new PageHeartbeatScheduler(
    config.heartbeatPulseIntervalMs,
    config.activityTimeoutMs,
    config.workerVersion,
  );

  activeEvents.forEach(eventType => {
    window.addEventListener(eventType, () => {
      scheduler.onActiveEvent();
    });
  });

  scheduler.start();
};
