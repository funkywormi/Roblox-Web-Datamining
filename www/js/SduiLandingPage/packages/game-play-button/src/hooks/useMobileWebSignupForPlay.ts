import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { EventContext } from "@rbx/unified-logging";
import ExperimentationService from "@rbx/experimentation";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { currentBrowser, Browser } from "@rbx/core-scripts/util/current-browser";
import { fireEvent } from "@rbx/www-common/event-tracker";
import playButtonConstants from "../constants/playButtonConstants";
import { PlayabilityStatus } from "../constants/playabilityStatus";
import type { TPlayabilityStatus, TPlayButtonPageContext } from "../types/playButtonTypes";

const { mobileWebSignupLayer, mobileWebSignupParameter, counterEvents } = playButtonConstants;

export const MOBILE_WEB_SIGNUP_QUERY_KEY = "mobileWebSignupForPlay";

// The website's IsAndroidChromeBrowser ports this browser check: /CreateAccount serves everyone else the download page.
const isAndroidChromePhone = (): boolean => {
  const deviceMeta = getDeviceMeta();
  return (
    deviceMeta?.isAndroidDevice === true &&
    deviceMeta.isPhone &&
    !deviceMeta.isInApp &&
    currentBrowser() === Browser.Chrome
  );
};

// Matches website#2241's bool.TryParse, so both entry points agree on a string value.
const parseIsDownloadPageHidden = (value: unknown): boolean =>
  value === true || (typeof value === "string" && value.trim().toLowerCase() === "true");

export const getIsDownloadPageHidden = async (): Promise<boolean> => {
  try {
    const values = await ExperimentationService.getAllValuesForLayer(mobileWebSignupLayer);
    return parseIsDownloadPageHidden(values[mobileWebSignupParameter]);
  } catch {
    fireEvent(counterEvents.MobileWebSignupLayerReadFailed);
    return false;
  }
};

const useMobileWebSignupForPlay = (
  status: TPlayabilityStatus,
  pageContext: TPlayButtonPageContext,
  isVNGRedirectEnabled: boolean | null | undefined,
): { isMobileWebSignupEnabled: boolean; logMobileWebSignupExposure: () => void } => {
  // The layer enrolls on read, so VNG has to be ruled out first, as website#2241 does.
  // A failed VNG lookup (null) skips the read, like the server's.
  const isCandidate =
    status === PlayabilityStatus.GuestProhibited &&
    pageContext === EventContext.GameDetail &&
    isVNGRedirectEnabled === false &&
    isAndroidChromePhone();

  const { data: isDownloadPageHidden } = useQuery({
    queryKey: [MOBILE_WEB_SIGNUP_QUERY_KEY],
    queryFn: getIsDownloadPageHidden,
    enabled: isCandidate,
    staleTime: Infinity,
    retry: false,
  });

  const hasLayerValues = isCandidate && isDownloadPageHidden !== undefined;

  const logMobileWebSignupExposure = useCallback(() => {
    if (hasLayerValues) {
      // Runs in the Play click handler, so a logging failure must not stop the navigation.
      try {
        ExperimentationService.logLayerExposure(mobileWebSignupLayer);
      } catch {
        fireEvent(counterEvents.MobileWebSignupExposureLogFailed);
      }
    }
  }, [hasLayerValues]);

  return {
    isMobileWebSignupEnabled: isCandidate && (isDownloadPageHidden ?? false),
    logMobileWebSignupExposure,
  };
};

export default useMobileWebSignupForPlay;
