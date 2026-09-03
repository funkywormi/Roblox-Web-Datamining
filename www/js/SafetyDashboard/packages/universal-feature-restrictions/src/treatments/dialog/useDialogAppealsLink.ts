import { type MouseEvent } from "react";
import { useUniversalFeatureRestrictionsConfig } from "../../contexts/UniversalFeatureRestrictionsConfigContext";
import { useSendAnalyticsEvent } from "../../telemetry/useSendAnalyticsEvent";
import { EventType } from "../../telemetry/eventConstants";
import { getTimeToInteract } from "../../shared/utils/getTimeToInteract";
import { getSafetyDashboardAppealsUrl } from "../../shared/url";
import { useAcknowledgeIntervention } from "./useAcknowledgeIntervention";
import type { DialogInterventionAnalytics } from "./useDialogRestrictionModel";

interface UseDialogAppealsLinkOptions {
  onAppealsRedirect?: (violationUid?: string) => void;
  analytics: DialogInterventionAnalytics;
  shouldOpenAppealsPortal: boolean;
  mountTimeMs: number;
  violationUid?: string;
  onAppeal?: () => void;
  showAppealSnackbar: () => void;
  onDismiss: () => void;
}

interface DialogAppealsLink {
  href: string;
  target?: string;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Resolves the package-owned Safety Dashboard link for the dialog disclaimer. Hosts can intercept
 * ordinary destination activations for client-side routing without replacing the link's native
 * href. Non-mandatory callback appeals cancel navigation, acknowledge when applicable, show
 * package feedback, and dismiss.
 */
export const useDialogAppealsLink = ({
  onAppealsRedirect,
  analytics,
  shouldOpenAppealsPortal,
  mountTimeMs,
  violationUid,
  onAppeal,
  showAppealSnackbar,
  onDismiss,
}: UseDialogAppealsLinkOptions): DialogAppealsLink => {
  const { websiteUrl } = useUniversalFeatureRestrictionsConfig();
  const sendAnalyticsEvent = useSendAnalyticsEvent();
  const { acknowledgeIntervention } = useAcknowledgeIntervention(analytics);

  const target = onAppealsRedirect || !shouldOpenAppealsPortal ? undefined : "_blank";
  const href = getSafetyDashboardAppealsUrl(websiteUrl, violationUid);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const isUnmodifiedPrimaryActivation =
      event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;

    /**
     * Prevent navigation when we shouldn't show the appeals portal (i.e. the consumer provides an onAppeal callback
     * and the violation doesn't need to show the appeals portal) or when the user clicks on the link without a
     * modifer key on the Safety Dashboard.
     */
    if (
      !shouldOpenAppealsPortal ||
      (onAppealsRedirect !== undefined && isUnmodifiedPrimaryActivation)
    ) {
      event.preventDefault();
    }

    sendAnalyticsEvent(EventType.AppealClicked, {
      timeToInteractSeconds: getTimeToInteract(mountTimeMs),
      interventionType: analytics.interventionType,
      eventId: analytics.interventionId,
      acknowledgeable: analytics.acknowledgeable,
    });

    onAppeal?.();

    if (!shouldOpenAppealsPortal) {
      acknowledgeIntervention();
      showAppealSnackbar();
      onDismiss();
      return;
    }

    if (onAppealsRedirect && isUnmodifiedPrimaryActivation) {
      onAppealsRedirect(violationUid);
    }
  };

  return { href, target, onClick };
};
