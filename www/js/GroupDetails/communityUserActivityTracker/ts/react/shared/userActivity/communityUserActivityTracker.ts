import Roblox from 'Roblox';
import activityDetector from './activityDetector';
import trackTimeSpent, {
  resetSequenceNumber,
  trackSessionEnd,
  trackSessionStart
} from './activityEventStream';
import { updateImpressionId } from '../utils/eventStream';

const ACTIVITY_INTERVAL_MS = 5000;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sendOpenEvent(): void {
  trackSessionStart(window.location.hash, window.location.pathname, document.referrer);
}

function sendCloseEvent(): void {
  trackSessionEnd(
    window.location.hash,
    window.location.pathname,
    activityDetector.getSessionStartTime()
  );
}

class CommunityUserActivityTracker {
  private isTracking: boolean;

  constructor() {
    this.isTracking = false;
  }

  public initialize(): void {
    if (this.isTracking) {
      return;
    }

    activityDetector.initialize();

    // Listen for page unload events
    window.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.startTracking();
  }

  static isVisible(): boolean {
    return document.visibilityState === 'visible';
  }

  private startTracking(): void {
    if (!this.isTracking) {
      sendOpenEvent();
      this.isTracking = true;

      this.checkTimeSpent().catch(() => {
        // metric errors are not critical
      });
    }
  }

  private async checkTimeSpent(): Promise<void> {
    while (this.isTracking) {
      trackTimeSpent(
        window.location.hash,
        window.location.pathname,
        activityDetector.getLastActiveTime()
      );

      // eslint-disable-next-line no-await-in-loop
      await delay(ACTIVITY_INTERVAL_MS);
    }
  }

  private handleVisibilityChange = (): void => {
    if (!CommunityUserActivityTracker.isVisible() && this.isTracking) {
      this.isTracking = false;
      sendCloseEvent();
      updateImpressionId();
      resetSequenceNumber();
    } else if (CommunityUserActivityTracker.isVisible() && !this.isTracking) {
      activityDetector.reset();
      this.startTracking();
    }
  };
}

// Singleton instance to be used across the app
const communityUserActivityTracker = new CommunityUserActivityTracker();

Object.assign(Roblox, {
  CommunityUserActivityTracker: communityUserActivityTracker
});

export default communityUserActivityTracker;
