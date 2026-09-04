/**
 * Interface based on `wwwroot/js/Events/ET.js` in `website`.
 */
export interface RobloxEventTracker {
  start: (...statSequenceNames: string[]) => void;
  endSuccess: (...statSequenceNames: string[]) => void;
  endCancel: (...statSequenceNames: string[]) => void;
  endFailure: (...statSequenceNames: string[]) => void;
  fireEvent: (...metricNames: string[]) => void;
}

type WindowWithEventTracker = Window & {
  EventTracker?: RobloxEventTracker;
};

const getInjectedEventTracker = (): RobloxEventTracker | undefined =>
  (window as WindowWithEventTracker).EventTracker;

const reportEvent = (metricName: string): void => {
  try {
    const request = new XMLHttpRequest();
    request.open('POST', `/game/report-event?name=${encodeURIComponent(metricName)}`, true);
    request.timeout = 50000;
    request.withCredentials = true;
    request.send();
  } catch {
    // Telemetry failures must not interrupt the authentication flow.
  }
};

// Most website layouts inject EventTracker. Landing pages do not, so proxy
// fireEvent to the same endpoint used by EventTracker when the global is absent.
const robloxEventTrackerProxy: RobloxEventTracker = {
  start: (...statSequenceNames: string[]): void => {
    getInjectedEventTracker()?.start(...statSequenceNames);
  },
  endSuccess: (...statSequenceNames: string[]): void => {
    getInjectedEventTracker()?.endSuccess(...statSequenceNames);
  },
  endCancel: (...statSequenceNames: string[]): void => {
    getInjectedEventTracker()?.endCancel(...statSequenceNames);
  },
  endFailure: (...statSequenceNames: string[]): void => {
    getInjectedEventTracker()?.endFailure(...statSequenceNames);
  },
  fireEvent: (...metricNames: string[]): void => {
    const injectedEventTracker = getInjectedEventTracker();
    if (injectedEventTracker?.fireEvent) {
      injectedEventTracker.fireEvent(...metricNames);
      return;
    }

    metricNames.forEach(reportEvent);
  }
};

export default robloxEventTrackerProxy;
