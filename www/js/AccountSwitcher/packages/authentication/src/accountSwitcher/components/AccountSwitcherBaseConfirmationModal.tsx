import React, { Fragment, useEffect } from "react";
import { Button, DialogBody, DialogFooter, DialogTitle } from "@rbx/foundation-ui";

import {
  sendAccountSwitcherConfirmationModalButtonClickEvent,
  sendShowAccountSwitcherConfirmationModalShownEvent,
} from "../services/eventService";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";

export type AccountSwitcherBaseConfirmationModalProps = {
  origin: string;
  localizedTitleText: string;
  localizedBodyText: string;
  primaryButtonCallback?: () => void;
  localizedPrimaryButtonText?: string;
  secondaryButtonCallback?: () => void;
  localizedSecondaryButtonText?: string;
  isTextLeftAligned?: boolean;
};

/** Content of the confirmation dialog. Render it inside a Foundation `Dialog`. */
export const AccountSwitcherBaseConfirmationModal = ({
  origin, // todo refactor away from the name origin, which has a different meaning in logging historically
  localizedTitleText,
  localizedBodyText,
  primaryButtonCallback,
  localizedPrimaryButtonText,
  secondaryButtonCallback,
  localizedSecondaryButtonText,
  isTextLeftAligned = false,
}: AccountSwitcherBaseConfirmationModalProps): React.ReactElement => {
  useEffect(() => {
    sendShowAccountSwitcherConfirmationModalShownEvent(origin);
  }, [origin]);

  const handlePrimaryButtonClick = () => {
    sendAccountSwitcherConfirmationModalButtonClickEvent(origin, EVENT_CONSTANTS.btn.primaryButton);
    if (primaryButtonCallback) {
      primaryButtonCallback();
    }
  };

  const handleSecondaryButtonClick = () => {
    sendAccountSwitcherConfirmationModalButtonClickEvent(
      origin,
      EVENT_CONSTANTS.btn.secondaryButton,
    );
    if (secondaryButtonCallback) {
      secondaryButtonCallback();
    }
  };

  const showPrimaryButton = Boolean(localizedPrimaryButtonText && primaryButtonCallback);
  const showSecondaryButton = Boolean(localizedSecondaryButtonText && secondaryButtonCallback);

  return (
    <Fragment>
      <DialogBody
        className={
          isTextLeftAligned
            ? "flex flex-col gap-xsmall"
            : "flex flex-col gap-xsmall text-align-x-center"
        }
      >
        <DialogTitle className="text-heading-small content-emphasis">
          {localizedTitleText}
        </DialogTitle>
        <p className="text-body-medium content-default">{localizedBodyText}</p>
      </DialogBody>
      {(showPrimaryButton || showSecondaryButton) && (
        <DialogFooter className="flex flex-col gap-small padding-top-medium">
          {showPrimaryButton && (
            <Button
              id="account-switch-primary-button"
              variant="Emphasis"
              size="Medium"
              onClick={handlePrimaryButtonClick}
            >
              {localizedPrimaryButtonText}
            </Button>
          )}
          {showSecondaryButton && (
            <Button
              id="account-switch-secondary-button"
              variant="Standard"
              size="Medium"
              onClick={handleSecondaryButtonClick}
            >
              {localizedSecondaryButtonText}
            </Button>
          )}
        </DialogFooter>
      )}
    </Fragment>
  );
};
