import { CmcdInstanceType, VideoEventPageContext } from "@rbx/video-player";
import { reportError, type SduiErrorReporter, type SduiPageContext } from "@rbx/sdui-core";
import { SduiVideoError, type SduiVideoErrorName } from "../telemetry/sduiVideoErrorConstants";

export const SDUI_VIDEO_APP_PAGES = {
  PreAuthLandingPage: "preAuthLandingPage",
} as const;

export function reportSduiVideoError(
  errorReporter: SduiErrorReporter | undefined,
  errorName: SduiVideoErrorName,
  errorMessage: string,
  pageContext?: SduiPageContext,
): void {
  reportError(errorName, errorMessage, pageContext, undefined, errorReporter);
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
