import { Button, IconButton } from "@rbx/foundation-ui";
import useChatTranslate from "../../hooks/useChatTranslate";

type TConfirmNegativeActionProps = {
  /** Header text, shown next to the back and close buttons. */
  title: string;
  /** The question the user answers. */
  question: string;
  /** Optional line under the question, for example the name of the member being removed. */
  detail?: string;
  confirmLabel: string;
  cancelLabel: string;
  onBack: () => void;
  onClose: () => void;
  onConfirm: () => void;
};

/**
 * In-window confirmation for actions the user cannot undo easily, such as leaving a group or
 * removing a member (parity with the legacy AngularJS confirm dialog and app Chat). Same layout as
 * `AbuseReportConfirmation`. Cancel, Back and the header back button all call `onBack`.
 */
const ConfirmNegativeAction = ({
  title,
  question,
  detail,
  confirmLabel,
  cancelLabel,
  onBack,
  onClose,
  onConfirm,
}: TConfirmNegativeActionProps) => {
  const translate = useChatTranslate();

  return (
    <div className="flex min-height-0 grow-1 flex-col">
      <div className="react-chat-top-radius flex width-full shrink-0 items-center gap-small bg-surface-100 padding-x-small padding-y-small">
        <IconButton
          ariaLabel={translate("Action.Back")}
          icon="icon-regular-chevron-large-left"
          size="Small"
          variant="Utility"
          isCircular
          onClick={onBack}
        />
        <span className="min-width-0 grow-1 text-title-medium content-emphasis text-truncate-end">
          {title}
        </span>
        <IconButton
          ariaLabel={translate("Action.Close")}
          icon="icon-regular-x"
          size="Small"
          variant="Utility"
          isCircular
          onClick={onClose}
        />
      </div>
      <div className="flex min-height-0 grow-1 flex-col items-center justify-center gap-medium padding-large text-center">
        <div className="flex flex-col gap-xsmall">
          <span className="text-body-medium content-emphasis">{question}</span>
          {detail !== undefined && (
            <span className="text-body-medium content-muted text-truncate-end">{detail}</span>
          )}
        </div>
        <div className="flex width-full gap-small">
          <Button variant="Standard" size="Medium" className="grow-1" onClick={onBack}>
            {cancelLabel}
          </Button>
          <Button variant="Alert" size="Medium" className="grow-1" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmNegativeAction;
