import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import verifyIdLight from "@rbx/foundation-images/pictograms/verifyid_light.svg";
import verifyIdDark from "@rbx/foundation-images/pictograms/verifyid_dark.svg";

interface Props {
  /** Advances to the IDV upsell wizard. */
  onContinue: () => void;
  /** Dismisses the intro without starting IDV (close affordance / backdrop). */
  onClose: () => void;
}

/**
 * Intro screen shown after the user clicks "Send Appeal" on a violation whose
 * eligibility is `false` (IDV required), and before the Access Management (IDV)
 * upsell wizard is launched. The AMP wizard's prologue uses generic verification
 * copy, so we surface the appeal-specific framing here.
 *
 * Rendered as a centered Foundation `Dialog` (at all breakpoints). The
 * illustration is centered; the heading and body copy are left-aligned.
 */
const VerifyIdentityModal = ({ onContinue, onClose }: Props) => {
  const { translate } = useTranslation();

  return (
    <Dialog
      open
      size="Small"
      type="Default"
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent>
        <DialogBody>
          <div data-testid="verify-identity-modal" className="flex flex-col gap-large min-width-0">
            <div className="flex items-center justify-center width-full overflow-hidden aspect-2-1">
              <img
                className="width-full height-full object-contain dark:hidden"
                src={verifyIdLight}
                alt=""
                aria-hidden="true"
              />
              <img
                className="width-full height-full object-contain hidden dark:block"
                src={verifyIdDark}
                alt=""
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-col gap-xsmall">
              <DialogTitle className="text-heading-small content-emphasis margin-none padding-none">
                {translate("Heading.VerifyIdentityToAppeal")}
              </DialogTitle>
              <p className="text-body-medium content-muted margin-none">
                {translate("Description.VerifyIdentityToAppeal")}
              </p>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            data-testid="verify-identity-continue-button"
            className="width-full"
            variant="Emphasis"
            size="Medium"
            onClick={onContinue}
          >
            {translate("Action.Continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyIdentityModal;
