import React from "react";
import { Button, DialogFooter } from "@rbx/foundation-ui";

export type FooterButtonConfig = {
  content: React.JSX.Element | string;
  /** Used primarily for accessibility labeling. */
  label: string;
  enabled: boolean;
  action: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

type Props = {
  positiveButton: FooterButtonConfig;
  negativeButton: FooterButtonConfig | null;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * A `ChallengeDialog` footer with a positive action button (and an optional negative
 * action button).
 */
export const ChallengeDialogFooter: React.FC<Props> = ({
  positiveButton,
  negativeButton,
  children,
}: Props) => (
  <DialogFooter
    className="challenge-dialog-footer flex flex-col gap-large"
    data-testid="challenge-dialog-footer"
  >
    <div className="flex gap-small width-full">
      {negativeButton !== null && (
        <Button
          variant="Standard"
          size="Small"
          className="grow-1 basis-0 min-width-0 !text-label-large"
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
        className="grow-1 basis-0 min-width-0 !text-label-large !bg-[var(--color-content-emphasis)] !content-[var(--color-surface-0)]"
        aria-label={positiveButton.label}
        isDisabled={!positiveButton.enabled}
        onClick={positiveButton.action}
      >
        {positiveButton.content}
      </Button>
    </div>
    {children}
  </DialogFooter>
);
