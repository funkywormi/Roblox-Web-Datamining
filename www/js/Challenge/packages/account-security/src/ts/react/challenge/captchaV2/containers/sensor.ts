import { CaptchaV2BlockResponse } from "../../../../common/request/types/captchaV2";
import {
  BLOCK_SCRIPT_ID,
  PX_CAPTCHA_CONTAINER_ID,
  SENSOR_COOKIE_NAME,
  SENSOR_LOAD_DELAY,
  SENSOR_POLL_INTERVAL,
  SENSOR_SCRIPT_ID,
  SENSOR_SCRIPT_URL,
} from "../app.config";

// Invoked by the vendor block script once the user solves (or fails) the
// interactive challenge. `isValid` indicates whether the solve was accepted.
type CaptchaSuccessCallback = (isValid: boolean) => void;

// The globals the client and block script read/write. `_pxOnCaptchaSuccess`
// is the shared success hook; the remaining fields are the Advanced Blocking
// Response parameters we publish for a custom render.
type PxWindow = Window & {
  _pxOnCaptchaSuccess?: CaptchaSuccessCallback;
  _pxAppId?: string;
  _pxJsClientSrc?: string;
  _pxFirstPartyEnabled?: boolean;
  _pxVid?: string;
  _pxUuid?: string;
  _pxHostUrl?: string;
  _pxBlockedUrl?: string;
};

const CHALLENGE_CSS_URL = "https://cdn.foundation.roblox.com/current/human-captcha/challenge.css";

// Renders button to best align with design of foundation button.
const CHALLENGE_VIEW = {
  width: "100%", // Fill the dialog content width
  height: 40, // Foundation medium button height
  backgroundColor: "#233679",
  fillColor: "#335FFF", // Primary/emphasis blue (design-foundations blue-700)
  borderColor: "#233679",
  borderWidth: 0, // No border, so the fill reaches the button edges
  innerMargin: 0, // No gap between border and fill; the fill covers the whole button
  textColor: "#FFFFFF",
  borderRadius: 8, // Foundation radius-medium
  css: [CHALLENGE_CSS_URL], // Load fonts + iframe style overrides into the challenge iframe
  textFont: "Builder Sans, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif", // Matches core UI stylesheet.
  texSize: 14, // Foundation label-medium (default button font size); note: vendor's field is `texSize`
  fontWeight: 600, // Foundation label weight
  textTransform: "none", // No capitalization.
  animation: false,
} as const;

export const setCaptchaSuccessCallback = (callback: CaptchaSuccessCallback): void => {
  (window as PxWindow)._pxOnCaptchaSuccess = callback;
};

export const clearCaptchaSuccessCallback = (): void => {
  delete (window as PxWindow)._pxOnCaptchaSuccess;
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

// Provides styling and callbacks to handle custom rendering of visible challenge.
type PxEventsApi = {
  Events: { on: (event: string, handler: (status: string) => void) => void };
};

type StartCustomChallengeOptions = {
  // Localized label for the press-and-hold button (rendered inside the iframe).
  buttonLabel: string;
  // Fires when button renders and on failure/success (prior to rerender).
  onCaptchaEvent?: (status: string) => void;
};

export const startCustomChallenge = (
  block: CaptchaV2BlockResponse,
  { buttonLabel, onCaptchaEvent }: StartCustomChallengeOptions,
): (() => void) => {
  const pxWindow = window as PxWindow;
  pxWindow._pxAppId = block.appId;
  pxWindow._pxJsClientSrc = block.jsClientSrc;
  pxWindow._pxFirstPartyEnabled = block.firstPartyEnabled;
  pxWindow._pxVid = block.vid;
  pxWindow._pxUuid = block.uuid;
  pxWindow._pxHostUrl = block.hostUrl;
  if (block.blockedUrl !== undefined) {
    pxWindow._pxBlockedUrl = block.blockedUrl;
  }

  // Brand the press-and-hold button. The block script reads this config object,
  // keyed `_<appId>`, from the parent window as it renders the iframe.
  const configKey = `_${block.appId}`;
  (window as unknown as Record<string, unknown>)[configKey] = {
    challenge: {
      view: { ...CHALLENGE_VIEW },
      translation: { default: { btn: buttonLabel } },
      // Hide non-disableable retry text to favor custom implementation.
      context: { failed: { color: "transparent", fontSize: "0px" } },
    },
  };

  // The vendor client invokes `window["<appId>_asyncInit"]` when it initializes.
  // Its event API reports when an attempt finishes (solved or failed), i.e. when
  // the widget hands off, so the caller can show a spinner during verification.
  const asyncInitKey = `${block.appId}_asyncInit`;
  (window as unknown as Record<string, unknown>)[asyncInitKey] = (px: PxEventsApi): void => {
    if (onCaptchaEvent) {
      px.Events.on("captcha", onCaptchaEvent);
    }
  };

  // Remove any prior block script first; re-injecting would render a second,
  // conflicting challenge.
  document.getElementById(BLOCK_SCRIPT_ID)?.remove();
  const script = document.createElement("script");
  script.id = BLOCK_SCRIPT_ID;
  script.type = "text/javascript";
  script.src = block.blockScript;
  script.async = true;
  document.head.appendChild(script);

  return () => {
    script.remove();
    document.getElementById(PX_CAPTCHA_CONTAINER_ID)?.replaceChildren();
    delete pxWindow._pxAppId;
    delete pxWindow._pxJsClientSrc;
    delete pxWindow._pxFirstPartyEnabled;
    delete pxWindow._pxVid;
    delete pxWindow._pxUuid;
    delete pxWindow._pxHostUrl;
    delete pxWindow._pxBlockedUrl;
    Reflect.deleteProperty(window, configKey);
    Reflect.deleteProperty(window, asyncInitKey);
  };
};
