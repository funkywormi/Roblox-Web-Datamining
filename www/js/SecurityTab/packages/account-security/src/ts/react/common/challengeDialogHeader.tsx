import React from "react";
import { DialogTitle, Divider, Icon } from "@rbx/foundation-ui";

export enum HeaderButtonType {
  BACK = "BACK",
  CLOSE = "CLOSE",
  HIDDEN = "HIDDEN",
}

type Props = {
  headerText: string;
  buttonType: HeaderButtonType;
  buttonAction: (event: React.MouseEvent<HTMLButtonElement>) => void;
  buttonEnabled: boolean;
  headerInfo: React.JSX.Element | null;
  buttonAriaLabel?: string;
};

/**
 * A `ChallengeDialog` header with title text and an action button.
 */
export const ChallengeDialogHeader: React.FC<Props> = ({
  headerText,
  buttonType,
  buttonAction,
  buttonEnabled,
  headerInfo,
  buttonAriaLabel,
}: Props) => (
  <React.Fragment>
    <div
      data-testid="challenge-dialog-header"
      className="grid [grid-template-columns:minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-large padding-x-xlarge padding-top-xsmall"
    >
      {buttonType === HeaderButtonType.HIDDEN ? (
        <div />
      ) : (
        <button
          type="button"
          className="justify-self-start bg-none stroke-none padding-none"
          onClick={buttonAction}
          disabled={!buttonEnabled}
          aria-label={buttonAriaLabel}
          data-testid="challenge-dialog-header-button"
        >
          <Icon
            name={
              buttonType === HeaderButtonType.BACK
                ? "icon-regular-chevron-large-left"
                : "icon-regular-x"
            }
            size="Medium"
          />
        </button>
      )}
      <DialogTitle className="challenge-dialog-title text-heading-small text-align-x-center text-truncate-end text-no-wrap min-width-0">
        {headerText}
      </DialogTitle>
      <div className="justify-self-end">{headerInfo}</div>
    </div>
    <Divider className="challenge-dialog-divider" />
  </React.Fragment>
);
