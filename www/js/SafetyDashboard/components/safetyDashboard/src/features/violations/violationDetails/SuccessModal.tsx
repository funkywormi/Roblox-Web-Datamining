import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * When an appeal is successfully submitted (i.e. no errors occurred), this modal will be shown
 * to the user. A large amount of the content is required by UK OSA, but the copy has been generalized
 * so that it can be shown for any user.
 */
const SuccessModal = ({ isOpen, onClose }: Props) => {
  const { translate } = useTranslation();

  return (
    <Dialog
      open={isOpen}
      size="Medium"
      isModal
      hasMarginBottom
      hasMarginTop
      hasCloseAffordance={false}
      onOpenChange={onClose}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogBody className="gap-large flex flex-col">
          <DialogTitle className="text-heading-medium">
            {translate("Heading.AppealSubmitted")}
          </DialogTitle>
          <span className="text-body-large">
            {translate("Description.AppealSubmittedDecisionTime")}
          </span>
          <span className="text-body-large">
            {translate("Description.AppealSubmittedComplexity")}
          </span>
          <span className="text-body-large">{translate("Description.AppealSubmittedUpdate")}</span>
        </DialogBody>

        <DialogFooter className="flex flex-col">
          <Button
            data-testid="appeals-success-modal-ok-button"
            variant="Emphasis"
            size="Medium"
            onClick={onClose}
          >
            {translate("Action.OK")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
