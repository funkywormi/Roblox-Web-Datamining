import React from "react";
import { Modal } from "react-style-guide";
import { Button } from "@rbx/foundation-ui";
import useTwoStepVerificationContext from "../hooks/useTwoStepVerificationContext";

export type VerificationFooterButton = {
  /** Rendered as the button text and used for accessibility labeling. */
  label: string;
  enabled: boolean;
  loading: boolean;
  action: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

type Props = {
  positiveButton: VerificationFooterButton;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * The footer for the 2SV challenge screens: a full-width primary action stacked above whatever
 * else the screen passes in, which is the media type switcher and the support copy.
 *
 * This is deliberately separate from the shared `FragmentModalFooter` -- that component is used by
 * roughly twenty other account-security modals that are still on the legacy button styling.
 */
const VerificationFooter: React.FC<Props> = ({ positiveButton, children }: Props) => {
  const {
    state: { renderInline },
  } = useTwoStepVerificationContext();

  const marginBottomClassName = renderInline
    ? "inline-challenge-margin-bottom"
    : "modal-margin-bottom";

  const button = (
    <Button
      variant="Emphasis"
      size="Medium"
      className={`challenge-action-button ${marginBottomClassName}`}
      aria-label={positiveButton.label}
      isDisabled={!positiveButton.enabled}
      isLoading={positiveButton.loading}
      onClick={positiveButton.action}
      data-testid="verification-footer-button"
    >
      {positiveButton.label}
    </Button>
  );

  // `Modal.Footer` only forwards `className`, so the modal path needs its own wrapper for the
  // test id. Descendant selectors in the challenge CSS still match through this element.
  const footer = (
    <div data-testid="verification-footer">
      {button}
      {children}
    </div>
  );

  if (renderInline) {
    return <div className="inline-challenge-footer">{footer}</div>;
  }

  return <Modal.Footer>{footer}</Modal.Footer>;
};

export default VerificationFooter;
