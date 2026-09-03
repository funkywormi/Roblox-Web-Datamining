import { useCallback } from "react";
import { EventTypes } from "../telemetry/analytics";
import { useNotApprovedUIConfig } from "../providers/NotApprovedUIProvider";
import { useNotApprovedPagePunishment } from "../context/NotApprovedPagePunishmentProvider";
import useSendNotApprovedPageEvent from "../telemetry/useSendNotApprovedPageEvent";

const SAFETY_DASHBOARD_PATH = "/safety-dashboard";
const PRODUCTION_WEBSITE_URL = "https://www.roblox.com";

interface UseAppealsRedirectOptions {
  preferViolationDetail?: boolean;
}

/**
 * Hook that returns a `handleAppealsClick` function to route the user to the appropriate
 * Safety Dashboard destination based on the host context.
 *
 * Priority:
 * 1. If `onAppealsRedirect` is provided (Safety Dashboard integration) — call it
 * 2. Otherwise — open the Safety Dashboard violations list in a new tab
 *
 * Send Appeal controls can opt into linking directly to the punishment's violation when its UID
 * is available.
 */
const useAppealsRedirect = ({ preferViolationDetail = false }: UseAppealsRedirectOptions = {}) => {
  const { websiteUrl, platform, onAppealsRedirect } = useNotApprovedUIConfig();
  const { punishmentData } = useNotApprovedPagePunishment();
  const sendEvent = useSendNotApprovedPageEvent();

  const violationUid = preferViolationDetail ? punishmentData?.violation?.uid : undefined;

  const handleAppealsClick = useCallback(() => {
    sendEvent(EventTypes.AppealsPortalClicked);

    if (onAppealsRedirect) {
      onAppealsRedirect(violationUid);
      return;
    }

    let appealsUrl: URL;
    try {
      appealsUrl = new URL(SAFETY_DASHBOARD_PATH, websiteUrl);
    } catch {
      appealsUrl = new URL(SAFETY_DASHBOARD_PATH, PRODUCTION_WEBSITE_URL);
    }

    appealsUrl.searchParams.set("t_source", platform);

    if (violationUid) {
      appealsUrl.searchParams.set("vid", violationUid);
    } else {
      appealsUrl.hash = "/violations";
    }

    window.open(appealsUrl.toString(), "_blank", "noopener,noreferrer");
  }, [sendEvent, onAppealsRedirect, violationUid, websiteUrl, platform]);

  return { handleAppealsClick };
};

export default useAppealsRedirect;
