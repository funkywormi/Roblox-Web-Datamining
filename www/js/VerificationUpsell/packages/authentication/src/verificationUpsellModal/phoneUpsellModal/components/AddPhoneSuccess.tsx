import React from "react";
import type { Translator } from "@rbx/www-common/i18n";
import { Button, DialogBody, DialogTitle } from "@rbx/foundation-ui";
import { phoneUpsellStrings } from "../../common/constants/translationConstants";
import { sendVerificationUpsellEvent } from "../../common/utils/loggingUtils";
import events from "../constants/phoneVerificationEventStreamConstants";
import usePhoneUpsellState from "../hooks/usePhoneUpsellState";
import getSectionValueForPage from "../utils/loggingUtils";

type AddPhoneSuccessProps = {
  translate: Translator<"Feature.VerificationUpsell">;
  onHide: () => void;
  headingKey?: string;
  descriptionKey?: string;
};

function AddPhoneSuccess({
  translate,
  onHide,
  headingKey = phoneUpsellStrings.HeadingPhoneIsVerified,
  descriptionKey = phoneUpsellStrings.DescriptionPhoneForRecovery,
}: AddPhoneSuccessProps) {
  const { phoneUpsellState } = usePhoneUpsellState();
  const { origin, pageName } = phoneUpsellState;
  const { ActionDone } = phoneUpsellStrings;

  const section = getSectionValueForPage(pageName);

  const handleDoneClick = () => {
    sendVerificationUpsellEvent(events.phoneAddedDonePressed, {
      origin,
      section,
    });
    onHide();
  };

  return (
    <DialogBody className="phone-upsell-body padding-top-xlarge">
      <div className="phone-upsell-image" />
      <DialogTitle className="phone-upsell-title text-heading-small text-align-x-center">
        {translate.dynamic(headingKey)}
      </DialogTitle>
      <div className="phone-upsell-text text-body-large text-align-x-center">
        {translate.dynamic(descriptionKey)}
      </div>
      <Button
        className="phone-upsell-button width-full !text-label-large"
        variant="Emphasis"
        size="Small"
        onClick={handleDoneClick}
      >
        {translate(ActionDone)}
      </Button>
    </DialogBody>
  );
}

export default AddPhoneSuccess;
