const PARAM_NAME = "t_source";

/*
 Incoming Link Tracking.
 We want to see where users are coming from, and we do by checking the t_source param in the URL.
 The t_source param is added by the places that links to these pages.
*/

let source = "unset";

const UNKNOWN_SOURCE = "unknown";

const saveInSessionStorage = (sourceStr: string) => {
  try {
    sessionStorage.setItem("t_source", sourceStr);
    sessionStorage.setItem("t_source_timestamp", Date.now().toString());
  } catch (err) {
    console.error(err);
  }
};

const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;

/**
 * Get the saved traffic source from session storage. Only use if it is less than
 * 30 minutes old (arbitrary value).
 */
const getSavedTrafficSource = (): string => {
  try {
    const timestamp = sessionStorage.getItem("t_source_timestamp");

    if (timestamp) {
      const timeDiff = Date.now() - parseInt(timestamp, 10);

      if (timeDiff < THIRTY_MINUTES_IN_MS) {
        const savedSource = sessionStorage.getItem("t_source");
        return savedSource && savedSource.length > 0 ? savedSource : UNKNOWN_SOURCE;
      }
    }
  } catch (err) {
    console.error(err);
  }
  return UNKNOWN_SOURCE;
};

/**
 * Capture and remove t_source tracking param from URL. Should be run before our app renders
 */
export const captureTrafficSourceAndFixUrl = (): string => {
  try {
    const currentUrl = new URL(window.location.href);
    const trafficSource = currentUrl.searchParams.get(PARAM_NAME);

    if (trafficSource) {
      currentUrl.searchParams.delete(PARAM_NAME);
      saveInSessionStorage(trafficSource);

      // Replace the current URL in the browser history without reloading the page
      window.history.replaceState({}, "", currentUrl.toString());
    }
    source = trafficSource && trafficSource.length > 0 ? trafficSource : getSavedTrafficSource();
  } catch (err) {
    console.error(err);
    source = "error";
  }
  return source;
};

/** Get the traffic source if any.
 * `unset` if `captureTrafficSourceAndFixUrl` was not called (should not happen).
 * `unknown` if not specified.
 * `error` if not parsable
 * */
export const getTrafficSource = (): string => source;

/**
 * FOR TESTING ONLY.
 * Reset the traffic source to `unset`.
 */
export const testingOnlyResetTrafficSource = (): void => {
  source = "unset";
};
