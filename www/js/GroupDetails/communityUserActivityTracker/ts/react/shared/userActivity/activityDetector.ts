const ACTIVITY_EVENTS = ['keydown', 'scroll', 'mousedown', 'touchstart'];

export class ActivityDetector {
  private sessionStartTime: number;

  private lastActiveTime: number;

  constructor() {
    this.sessionStartTime = 0;
    this.lastActiveTime = 0;
  }

  public initialize(element: Document | Element = document): void {
    if (this.lastActiveTime !== 0) {
      // already initialized
      return;
    }

    this.reset();
    ACTIVITY_EVENTS.forEach(event =>
      element.addEventListener(event, this.updateActivity, { passive: true })
    );
  }

  public reset(): void {
    this.sessionStartTime = Date.now();
    this.lastActiveTime = Date.now();
  }

  public getLastActiveTime(): number {
    return this.lastActiveTime;
  }

  public getSessionStartTime(): number {
    return this.sessionStartTime;
  }

  private updateActivity = (): void => {
    this.lastActiveTime = Date.now();
  };
}

// Singleton instance to be used across the app
const activityDetector = new ActivityDetector();
export default activityDetector;
