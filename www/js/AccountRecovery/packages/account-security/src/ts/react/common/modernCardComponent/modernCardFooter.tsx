import React from "react";

export type CardFooterButtonConfig = {
  content: JSX.Element | string;
  /** Used primarily for accessibility labeling. */
  label: string;
  enabled: boolean;
  action: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

type Props = {
  positiveButton: CardFooterButtonConfig;
  negativeButton: CardFooterButtonConfig | null;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * A modal footer with a positive action button (and an optional negative
 * action button).
 */
export const ModernCardFooter: React.FC<Props> = ({
  positiveButton,
  negativeButton,
  children,
}: Props) => {
  return (
    <div className="card-footer">
      <div className="modern-card-footer-buttons">
        {negativeButton !== null && (
          <button
            type="button"
            className="btn-secondary-md modern-card-footer-button"
            aria-label={negativeButton.label}
            disabled={!negativeButton.enabled}
            onClick={negativeButton.action}
          >
            {negativeButton.content}
          </button>
        )}
        <button
          type="button"
          className="btn-growth-md modern-card-footer-button"
          aria-label={positiveButton.label}
          disabled={!positiveButton.enabled}
          onClick={positiveButton.action}
        >
          {positiveButton.content}
        </button>
      </div>
      {children}
    </div>
  );
};
