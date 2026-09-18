/**
 * Interface based on `Web/RobloxWebSite/js/EventTracker.js` in `web-platform`.
 */
export interface RobloxEventTracker {
  start: (...statSequenceNames: string[]) => void;
  endSuccess: (...statSequenceNames: string[]) => void;
  endCancel: (...statSequenceNames: string[]) => void;
  endFailure: (...statSequenceNames: string[]) => void;
  fireEvent: (...metricNames: string[]) => void;
}

// Injected by `web-platform` into the global namespace. Typed as potentially
// undefined because ad blockers have been known to remove the tracking code,
// and because `window` is absent during Next.js server render (the typeof guard
// keeps this import from throwing there; .NET always has window, so unchanged).
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
export default (typeof window !== "undefined" ? (window as any).EventTracker : undefined) as
  | RobloxEventTracker
  | undefined;
