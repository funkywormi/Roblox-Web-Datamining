import React from "react";
import { Button } from "@rbx/foundation-ui";

export type InlineFooterButtonConfig = {
  content: React.ReactElement | string;
  /** Used primarily for accessibility labeling. */
  label: string;
  enabled: boolean;
  action: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

type Props = {
  positiveButton: InlineFooterButtonConfig;
  negativeButton: InlineFooterButtonConfig | null;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * A modal footer with a positive action button (and an optional negative
 * action button).
 */
export const InlineChallengeFooter: React.FC<Props> = ({
  positiveButton,
  negativeButton,
  children,
}: Props) => {
  return (
    <div className="inline-challenge-footer">
      <div className="inline-challenge-footer-buttons">
        {negativeButton !== null && (
          <Button
            variant="Standard"
            size="Small"
            className="inline-challenge-footer-button !text-label-large"
            aria-label={negativeButton.label}
            isDisabled={!negativeButton.enabled}
            onClick={negativeButton.action}
          >
            {negativeButton.content}
          </Button>
        )}
        <Button
          variant="Emphasis"
          size="Small"
          className="inline-challenge-footer-button !text-label-large !bg-[var(--color-content-emphasis)] !content-[var(--color-surface-0)]"
          aria-label={positiveButton.label}
          isDisabled={!positiveButton.enabled}
          onClick={positiveButton.action}
        >
          {positiveButton.content}
        </Button>
      </div>
      {children}
    </div>
  );
};
