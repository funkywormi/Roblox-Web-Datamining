import {
  SENSOR_COOKIE_NAME,
  SENSOR_LOAD_DELAY,
  SENSOR_POLL_INTERVAL,
  SENSOR_SCRIPT_ID,
  SENSOR_SCRIPT_URL,
} from "../app.config";

// Invoked by the sensor once the user solves (or fails) the auto-rendered
// challenge. `isValid` indicates whether the solve was accepted.
type CaptchaSuccessCallback = (isValid: boolean) => void;

type SensorWindow = Window & {
  _pxOnCaptchaSuccess?: CaptchaSuccessCallback;
};

export const setCaptchaSuccessCallback = (callback: CaptchaSuccessCallback): void => {
  (window as SensorWindow)._pxOnCaptchaSuccess = callback;
};

export const clearCaptchaSuccessCallback = (): void => {
  delete (window as SensorWindow)._pxOnCaptchaSuccess;
};

// Whether the sensor snippet has already been injected on this page.
export const isSensorLoaded = (): boolean => document.getElementById(SENSOR_SCRIPT_ID) !== null;

// Injects the sensor snippet.
export const loadSensor = (onLoad?: () => void): void => {
  if (isSensorLoaded()) {
    onLoad?.();
    return;
  }
  const script = document.createElement("script");
  script.id = SENSOR_SCRIPT_ID;
  script.type = "text/javascript";
  script.src = SENSOR_SCRIPT_URL;
  script.async = true;
  if (onLoad) {
    script.onload = onLoad;
  }
  document.head.appendChild(script);
};

// Preloads the sensor ahead of the challenge flow so its decision cookie can
// populate early. Makes best effort to defer execution to reduce latency.
export const preloadSensor = (): void => {
  const inject = (): void => loadSensor();
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(inject);
  } else {
    window.setTimeout(inject, 0);
  }
};

const hasSensorCookie = (): boolean =>
  document.cookie.split("; ").some(entry => entry.startsWith(`${SENSOR_COOKIE_NAME}=`));

// Ensures the sensor is loaded, then resolves once it has completed verification
// or fallback delay elapses.
export const waitForSensorReady = (onReady: (sensorFinished: boolean) => void): (() => void) => {
  let pollId = 0;
  let timeoutId = 0;
  let fired = false;

  const cleanup = (): void => {
    window.clearInterval(pollId);
    window.clearTimeout(timeoutId);
  };

  const fire = (sensorFinished: boolean): void => {
    if (fired) {
      return;
    }
    fired = true;
    cleanup();
    onReady(sensorFinished);
  };

  const beginPolling = (): void => {
    // The fallback may have already fired; don't start polling in that case.
    if (fired) {
      return;
    }
    if (hasSensorCookie()) {
      fire(true);
      return;
    }
    pollId = window.setInterval(() => {
      if (hasSensorCookie()) {
        fire(true);
      }
    }, SENSOR_POLL_INTERVAL);
  };

  // Fallback: fire even if the script never loads or the cookie never appears.
  timeoutId = window.setTimeout(fire, SENSOR_LOAD_DELAY, false);

  loadSensor(beginPolling);

  return cleanup;
};
