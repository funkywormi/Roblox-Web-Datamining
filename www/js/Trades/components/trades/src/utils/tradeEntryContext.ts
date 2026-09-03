// TypeScript port of utils/tradesEventUtils.getEntryContext.
// Classifies how the user arrived at the trade center (based on document.referrer)
// so page-view events can be sliced by entry point (profile, home, left nav, etc.).

export type EntryContext = {
  referrer: string;
  entrySource: string;
};

export const getEntryContext = (): EntryContext => {
  let referrer = "";
  let entrySource = "direct";

  try {
    const ref = (typeof document !== "undefined" && document.referrer) || "";
    if (ref) {
      const url = new URL(ref);
      referrer = url.host + url.pathname;
      const sameHost = typeof window !== "undefined" && url.host === window.location.host;

      if (!sameHost) {
        entrySource = "external";
      } else if (/\/users\/\d+/i.test(url.pathname)) {
        entrySource = "profile";
      } else if (url.pathname === "/" || /\/home/i.test(url.pathname)) {
        entrySource = "home";
      } else if (/\/trades/i.test(url.pathname)) {
        entrySource = "tradesInternal";
      } else {
        entrySource = "internalOther";
      }
    }
  } catch {
    // Malformed/opaque referrer; leave defaults.
  }

  return { referrer, entrySource };
};

export default getEntryContext;
