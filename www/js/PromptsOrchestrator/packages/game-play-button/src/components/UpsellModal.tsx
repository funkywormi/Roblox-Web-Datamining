import { Fragment } from "react";
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogTitle,
  DialogFooter,
  Button,
} from "@rbx/foundation-ui";
import useSanitizedHtmlLinkText from "../hooks/useSanitizedHtmlLinkText";

type TUpsellModalProps = {
  titleText: string;
  bodyText: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  closeLabelText: string;
  onPrimaryButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
  isModalOpen: boolean;
  onCloseModal: () => void;
  hasCloseAffordance?: boolean;
  orientButtonsVertically?: boolean;
};

/**
 * Renders a generic upsell modal with a title, body, and up to two buttons.
 * The primary and secondary buttons are only displayed if the
 * corresponding text and click handlers are provided.
 *
 * All text strings are translated before being passed to the component.
 */
const UpsellModal = ({
  titleText,
  bodyText,
  primaryButtonText,
  secondaryButtonText,
  closeLabelText,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
  isModalOpen,
  onCloseModal,
  hasCloseAffordance = true,
  orientButtonsVertically = false,
}: TUpsellModalProps): React.JSX.Element => {
  const sanitizedBodyLinkText = useSanitizedHtmlLinkText(bodyText, {
    shouldOpenLinksInNewTab: true,
  });
  const primaryButton =
    primaryButtonText && onPrimaryButtonClick ? (
      <Button
        variant="Emphasis"
        size="Medium"
        onClick={onPrimaryButtonClick}
        className="grow basis-0"
      >
        {primaryButtonText}
      </Button>
    ) : null;
  const secondaryButton =
    secondaryButtonText && onSecondaryButtonClick ? (
      <Button
        variant="Standard"
        size="Medium"
        onClick={onSecondaryButtonClick}
        className="grow basis-0"
      >
        {secondaryButtonText}
      </Button>
    ) : null;

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={open => {
        if (!open) {
          onCloseModal();
        }
      }}
      size="Medium"
      isModal
      hasCloseAffordance={hasCloseAffordance}
      closeLabel={closeLabelText}
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-large">
          <DialogTitle>{titleText}</DialogTitle>
          <span
            // Style rendered links so they visually read as links in modal body copy
            className="[&_a]:[font-weight:700] [&_a]:underline"
            // Sanitized via dompurify — safe to set innerHTML
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: sanitizedBodyLinkText }}
          />
        </DialogBody>
        <DialogFooter
          className={orientButtonsVertically ? "flex flex-col gap-small" : "flex gap-x-medium"}
        >
          {orientButtonsVertically ? (
            <Fragment>
              {primaryButton}
              {secondaryButton}
            </Fragment>
          ) : (
            <Fragment>
              {secondaryButton}
              {primaryButton}
            </Fragment>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpsellModal;
