import React from "react";
import { Modal } from "@rbx/core-ui/legacy/react-style-guide";

export type FooterButtonConfig = {
  content: JSX.Element | string;
  /** Used primarily for accessibility labeling. */
  label: string;
  enabled: boolean;
  action: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export type FragmentModalFooterProps = {
  positiveButton?: FooterButtonConfig;
  negativeButton?: FooterButtonConfig;
  children?: React.ReactNode;
};

/**
 * A modal footer with a positive action button (and an optional negative
 * action button).
 */
export const FragmentModalFooter: React.FC<FragmentModalFooterProps> = ({
  positiveButton,
  negativeButton,
  children,
}: FragmentModalFooterProps) => {
  return (
    <Modal.Footer>
      <div className="modal-modern-footer-buttons">
        {negativeButton && (
          <button
            type="button"
            className="btn-secondary-md modal-modern-footer-button"
            aria-label={negativeButton.label}
            disabled={!negativeButton.enabled}
            onClick={negativeButton.action}
          >
            {negativeButton.content}
          </button>
        )}
        {positiveButton && (
          <button
            type="button"
            className="btn-cta-md modal-modern-footer-button"
            aria-label={positiveButton.label}
            disabled={!positiveButton.enabled}
            onClick={positiveButton.action}
          >
            {positiveButton.content}
          </button>
        )}
      </div>
      {children}
    </Modal.Footer>
  );
};
