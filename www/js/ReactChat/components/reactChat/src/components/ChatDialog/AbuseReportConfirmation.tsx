import { Button, IconButton } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import type { TChatConversation, TDialogScreen } from "../../types/chat";
import { useAbuseReportRevampEnabled } from "../../hooks/useAbuseReportRevampEnabled";
import { navigateAbuseReport } from "../../utils/abuseReport";

type TAbuseReportConfirmationProps = {
  conversation: TChatConversation;
  onClose: (layoutId: string) => void;
  onSetScreen: (layoutId: string, screen: TDialogScreen) => void;
};

/**
 * In-app "Continue to report?" confirmation screen (parity with the legacy Angular
 * chatAbuseReport.html). Reached from the participant 3-dot menu's Report action. On confirm it
 * routes to the abuse-report destination via navigateAbuseReport, which branches on the
 * `abuse-reporting-revamp` GUAC gate (revamp /report-abuse/ vs. legacy /abusereport/chat +
 * AbuseReportDispatcher). Back/Cancel returns to the Details screen it was launched from.
 */
const AbuseReportConfirmation = ({
  conversation,
  onClose,
  onSetScreen,
}: TAbuseReportConfirmationProps) => {
  const { translate } = useTranslation();
  const revampEnabled = useAbuseReportRevampEnabled();

  const targetParticipant = conversation.participants.find(
    participant => participant.id === conversation.abuseReportTargetId,
  );

  const goBack = () => {
    onSetScreen(conversation.layoutId, "Details");
  };

  const confirmReport = () => {
    if (!targetParticipant) {
      goBack();
      return;
    }
    navigateAbuseReport({ revampEnabled, conversation, participant: targetParticipant });
  };

  return (
    <div className="flex min-height-0 grow-1 flex-col">
      <div className="react-chat-top-radius flex width-full shrink-0 items-center gap-small bg-surface-100 padding-x-small padding-y-small">
        <IconButton
          ariaLabel={translate("Action.Back")}
          icon="icon-regular-chevron-large-left"
          size="Small"
          variant="Utility"
          isCircular
          onClick={goBack}
        />
        <span className="min-width-none grow-1 text-title-medium content-emphasis text-truncate-end">
          {translate("Action.Report")}
        </span>
        <IconButton
          ariaLabel={translate("Action.Close")}
          icon="icon-regular-x"
          size="Small"
          variant="Utility"
          isCircular
          onClick={() => {
            onClose(conversation.layoutId);
          }}
        />
      </div>
      <div className="flex min-height-0 grow-1 flex-col items-center justify-center gap-medium padding-large text-center">
        <span className="text-body-medium content-emphasis">
          {translate("Heading.ContinueToReport")}
        </span>
        <div className="flex width-full gap-small">
          <Button variant="Standard" size="Medium" className="grow-1" onClick={goBack}>
            {translate("Action.Cancel")}
          </Button>
          <Button variant="Alert" size="Medium" className="grow-1" onClick={confirmReport}>
            {translate("Action.Report")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AbuseReportConfirmation;
