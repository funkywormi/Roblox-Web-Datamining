const globalWindow = globalThis.window;
const globalDocument = globalThis.document;
const globalNavigator = globalThis.navigator;

export const window = typeof globalWindow === "undefined" ? undefined : globalWindow;

export const document = typeof globalDocument === "undefined" ? undefined : globalDocument;

// NodeJS exposes global `navigator`, but it does not have the full navigator API.
// Instead, let's just hide it, since it doesn't seem to have any useful fields.
// https://nodejs.org/api/globals.html#navigator
export const navigator =
  window == null || typeof globalNavigator === "undefined" ? undefined : globalNavigator;
