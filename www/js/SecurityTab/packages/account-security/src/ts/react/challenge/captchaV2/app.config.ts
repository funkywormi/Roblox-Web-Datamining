import environmentUrls from "@rbx/environment-urls";

export const FEATURE_NAME = "CaptchaV2" as const;

/**
 * Constants for event stream events.
 */
export const EVENT_CONSTANTS = {
  eventName: "accountSecurityChallengeCaptchaV2Event",
  context: {
    challengeInitialized: "challengeInitialized",
    sensorFinished: "sensorFinished",
    challengeDisplayed: "challengeDisplayed",
    challengeCompleted: "challengeCompleted",
    challengeInvalidated: "challengeInvalidated",
    challengeAbandoned: "challengeAbandoned",
  },
} as const;

/**
 * Constants for event tracker metrics.
 */
export const METRICS_CONSTANTS = {
  event: {
    challengeInitialized: "ChallengeInitialized",
    sensorFinished: "SensorFinished",
    challengeDisplayed: "ChallengeDisplayed",
    challengeCompleted: "ChallengeCompleted",
    challengeInvalidated: "ChallengeInvalidated",
    challengeAbandoned: "ChallengeAbandoned",
  },
  sequence: {
    challengeSolveTime: "ChallengeSolveTime",
    sensorFinishTime: "SensorFinishTime",
  },
} as const;

// Dynamically selected prod/dev sensor snippets.
export const SENSOR_SCRIPT_URL_DEV = "//client.px-cloud.net/PXDU9eCzTY/main.min.js" as const;
export const SENSOR_SCRIPT_URL_PROD = "//client.px-cloud.net/PXbf8PROpW/main.min.js" as const;
export const SENSOR_SCRIPT_URL = environmentUrls.domain.includes("sitetest")
  ? SENSOR_SCRIPT_URL_DEV
  : SENSOR_SCRIPT_URL_PROD;

// DOM id for sensor script (which is used to de-duplicate).
export const SENSOR_SCRIPT_ID = "captcha-v2-sensor" as const;

// Sensor decision cookie.
export const SENSOR_COOKIE_NAME = "_px3" as const;

// Polling interval for sensor cookie.
export const SENSOR_POLL_INTERVAL = 50;

// Maximum delay (ms) to wait for the sensor to become ready before issuing the
// verification call anyway. Acts as a fallback so the flow never hangs.
export const SENSOR_LOAD_DELAY = 2000;

// Local storage key for init guard.
export const CHALLENGE_ID_STORAGE_KEY = "CaptchaV2ChallengeId";
