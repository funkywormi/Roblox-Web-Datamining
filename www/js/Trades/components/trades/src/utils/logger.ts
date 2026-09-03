/* eslint-disable no-console */
// Lightweight, prefixed logging for the React trades app. Enabled by default
// during the Angular -> React migration so issues are easy to diagnose from the
// browser console. Disable at runtime with `localStorage.tradesReactDebug='false'`.

const PREFIX = "[trades-react]";

const isEnabled = (): boolean => {
  try {
    return window.localStorage.getItem("tradesReactDebug") !== "false";
  } catch {
    return true;
  }
};

export const log = (...args: unknown[]): void => {
  if (isEnabled()) {
    console.log(PREFIX, ...args);
  }
};

export const warn = (...args: unknown[]): void => {
  if (isEnabled()) {
    console.warn(PREFIX, ...args);
  }
};

export const error = (...args: unknown[]): void => {
  // Errors always log, regardless of the debug flag.
  console.error(PREFIX, ...args);
};

export default { log, warn, error };
