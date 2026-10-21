/**
 * Error/counter names for SDUI video player failures.
 *
 * These are emitted through `SduiErrorReporter.reportSduiError` (EventTracker
 * counter + eventstream + Sentry). They are not video engagement event-stream
 * event names.
 */
export const SduiVideoError = {
  NoMatchingEventPageContextFound: "SduiVideoNoMatchingEventPageContextFound",
  NoMatchingCmcdInstanceTypeFound: "SduiVideoNoMatchingCmcdInstanceTypeFound",
  BrowserUnsupported: "SduiVideoPlayerBrowserUnsupported",
  PlayerMediaError: "SduiVideoPlayerMediaError",
  PlayerLoadError: "SduiVideoPlayerLoadError",
  PlayerErrorBoundaryError: "SduiVideoPlayerErrorBoundaryError",
  PlayerPlayError: "SduiVideoPlayerPlayError",
  PlayerMissingOnPlayError: "SduiVideoPlayerMissingOnPlayError",
} as const;

export type SduiVideoErrorName = (typeof SduiVideoError)[keyof typeof SduiVideoError];
