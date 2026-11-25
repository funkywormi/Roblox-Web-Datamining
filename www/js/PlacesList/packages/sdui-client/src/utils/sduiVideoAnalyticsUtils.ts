import {
  CmcdInstanceType,
  VideoEventPageContext,
  type VideoAnalyticsConfig,
} from "@rbx/video-player";
import {
  findAnalyticsField,
  parseAnalyticsField,
  reportError,
  type AnalyticsContext,
  type SduiErrorChannelSampleRates,
  type SduiErrorReporter,
  type SduiPageContext,
} from "@rbx/sdui-core";
import { SduiVideoError, type SduiVideoErrorName } from "../telemetry/sduiVideoErrorConstants";

export const SDUI_VIDEO_APP_PAGES = {
  PreAuthLandingPage: "preAuthLandingPage",
  SpotlightPage: "spotlightPage",
} as const;

/**
 * Per-channel sampling for expected, high-volume video failures. Game-tile
 * playback hits these on most sessions (asset-delivery 429s, CDN fetch
 * failures, autoplay blocks, unsupported browsers). We keep only 1% in Sentry
 * so they don't drown out actionable issues, but keep every occurrence in the
 * counter and eventstream so volume analysis stays accurate.
 */
export const EXPECTED_VIDEO_ERROR_SAMPLE_RATES: SduiErrorChannelSampleRates = {
  sentry: 0.01,
  eventStream: 1,
  counter: 1,
};

function isExpectedError(errorName: SduiVideoErrorName, errorMessage: string): boolean {
  switch (errorName) {
    case SduiVideoError.PlayerLoadError:
      return (
        errorMessage.includes("HTTP 429") ||
        (errorMessage.includes("Failed to fetch (") &&
          (errorMessage.includes("rbxcdn.com") ||
            errorMessage.includes("assetdelivery.roblox.com")))
      );
    case SduiVideoError.PlayerPlayError:
      return errorMessage.includes("Name: NotAllowedError;");
    case SduiVideoError.BrowserUnsupported:
      return true;
    case SduiVideoError.NoMatchingEventPageContextFound:
    case SduiVideoError.NoMatchingCmcdInstanceTypeFound:
    case SduiVideoError.PlayerMediaError:
    case SduiVideoError.PlayerErrorBoundaryError:
    case SduiVideoError.PlayerMissingOnPlayError:
      return false;
    default: {
      const unmatched: never = errorName;
      return unmatched;
    }
  }
}

const VIDEO_SOURCE_ASSET = "asset";

/**
 * Reads `source` and `sourceId` from the video player's analytics context.
 * Missing fields fall back to the video asset.
 */
export function getVideoAnalyticsContext(
  analyticsContext: AnalyticsContext | undefined,
  videoAssetId: string,
): { source: VideoAnalyticsConfig["source"]; sourceId: string } {
  const analyticsData = analyticsContext?.getAnalyticsDataSnapshot();
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    source: parseAnalyticsField(
      findAnalyticsField("source", analyticsData),
      VIDEO_SOURCE_ASSET,
    ) as VideoAnalyticsConfig["source"],
    sourceId: parseAnalyticsField(findAnalyticsField("sourceId", analyticsData), videoAssetId),
  };
}

export function reportSduiVideoError(
  errorReporter: SduiErrorReporter | undefined,
  errorName: SduiVideoErrorName,
  errorMessage: string,
  pageContext?: SduiPageContext,
): void {
  // Expected, high-volume errors are sampled per channel by the reporter rather
  // than dropped outright, so the counter and eventstream still see every hit.
  const additionalOptions = isExpectedError(errorName, errorMessage)
    ? { sampleRates: EXPECTED_VIDEO_ERROR_SAMPLE_RATES }
    : undefined;
  reportError(errorName, errorMessage, pageContext, undefined, errorReporter, additionalOptions);
}

/**
 * Converts SDUI page context to a VideoEventPageContext for video telemetry.
 *
 * VideoEventPageContext values are designed to match the page context values used by
 * video engagement event reporting on mobile/desktop App.
 */
export const getVideoEventPageContextFromSdui = (
  pageContext?: SduiPageContext,
  errorReporter?: SduiErrorReporter,
): VideoEventPageContext | undefined => {
  switch (pageContext?.appPage) {
    case SDUI_VIDEO_APP_PAGES.PreAuthLandingPage:
      return VideoEventPageContext.PreAuthLanding;
    case SDUI_VIDEO_APP_PAGES.SpotlightPage:
      return VideoEventPageContext.Spotlight;
    case undefined:
    default:
      reportSduiVideoError(
        errorReporter,
        SduiVideoError.NoMatchingEventPageContextFound,
        `No VideoEventPageContext mapping for SDUI appPage="${pageContext?.appPage ?? "undefined"}"`,
        pageContext,
      );
      return undefined;
  }
};

/**
 * Converts SDUI page context to the corresponding CmcdInstanceType for video cost-to-serve telemetry.
 *
 * Returns a concrete value rather than undefined because `RobloxVideoPlayer` requires
 * `cmcdInstanceType` (it is included on CMCD session headers for CDN attribution). When
 * SDUI appPage is unmapped we fall back to `Home`, matching discovery-common's default,
 * and emit a counter via the SDUI error reporter so the gap can be monitored.
 */
export const getVideoCmcdInstanceTypeFromSdui = (
  pageContext?: SduiPageContext,
  errorReporter?: SduiErrorReporter,
): CmcdInstanceType => {
  switch (pageContext?.appPage) {
    case SDUI_VIDEO_APP_PAGES.PreAuthLandingPage:
      return CmcdInstanceType.PreAuthLanding;
    case SDUI_VIDEO_APP_PAGES.SpotlightPage:
      return CmcdInstanceType.Spotlight;
    case undefined:
    default:
      reportSduiVideoError(
        errorReporter,
        SduiVideoError.NoMatchingCmcdInstanceTypeFound,
        `No CmcdInstanceType mapping for SDUI appPage="${pageContext?.appPage ?? "undefined"}"; defaulting to Home`,
        pageContext,
      );
      return CmcdInstanceType.Home;
  }
};
