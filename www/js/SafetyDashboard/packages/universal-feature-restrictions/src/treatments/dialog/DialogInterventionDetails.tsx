import { useEffect } from "react";
import { useUniversalFeatureRestrictionsConfig } from "../../contexts/UniversalFeatureRestrictionsConfigContext";
import { useSendAnalyticsEvent } from "../../telemetry/useSendAnalyticsEvent";
import { EventType } from "../../telemetry/eventConstants";
import DialogEvidenceCard from "./DialogEvidenceCard";
import { useDialogAppealsLink } from "./useDialogAppealsLink";
import type { DialogRestrictionView } from "./useDialogRestrictionModel";

interface Props {
  view: DialogRestrictionView;
  onAppealsRedirect?: (violationUid?: string) => void;
  mountTimeMs: number;
  onAppeal?: () => void;
  showAppealSnackbar: () => void;
  onDismiss: () => void;
}

/**
 * The scrollable middle of the ready dialog: body copy, the evidence card, and the appeals
 * disclaimer. It also owns the `ModalAppeared` analytics effect.
 */
const DialogInterventionDetails = ({
  view,
  onAppealsRedirect,
  mountTimeMs,
  onAppeal,
  showAppealSnackbar,
  onDismiss,
}: Props) => {
  const { translateHtml } = useUniversalFeatureRestrictionsConfig();
  const sendAnalyticsEvent = useSendAnalyticsEvent();

  const {
    body,
    evidence,
    violationReason,
    isAppealable,
    shouldOpenAppealsPortal,
    formattedEndDate,
    countdownText,
    violationUid,
    analytics,
    messageToUser,
  } = view;

  const { href, target, onClick } = useDialogAppealsLink({
    onAppealsRedirect,
    mountTimeMs,
    violationUid,
    analytics,
    shouldOpenAppealsPortal,
    onAppeal,
    showAppealSnackbar,
    onDismiss,
  });

  useEffect(() => {
    sendAnalyticsEvent(EventType.ModalAppeared, {
      evidence,
      interventionType: analytics.interventionType,
      eventId: analytics.interventionId,
      timeoutDurationSeconds: analytics.timeoutDurationSeconds,
      acknowledgeable: analytics.acknowledgeable,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-medium grow-1 scroll-y min-height-0">
      {body && <p className="text-body-medium margin-none content-default">{body}</p>}

      <DialogEvidenceCard
        evidence={evidence}
        violationReason={violationReason}
        formattedEndDate={formattedEndDate}
        countdownText={countdownText}
        messageToUser={messageToUser}
      />

      {isAppealable && (
        <p className="text-body-medium content-default margin-none">
          {translateHtml("Description.Disclaimer", [
            {
              opening: "startLink",
              closing: "endLink",
              render: children => (
                <a
                  href={href}
                  target={target}
                  rel="noreferrer noopener"
                  className="content-default underline"
                  style={{ textUnderlineOffset: "3px" }}
                  onClick={onClick}
                >
                  {children}
                </a>
              ),
            },
          ])}
        </p>
      )}
    </div>
  );
};

export default DialogInterventionDetails;
