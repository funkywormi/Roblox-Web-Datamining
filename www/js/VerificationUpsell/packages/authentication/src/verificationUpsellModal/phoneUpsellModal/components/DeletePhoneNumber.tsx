import React, { useState } from "react";
import type { Translator } from "@rbx/www-common/i18n";
import { DialogBody } from "@rbx/foundation-ui";
import { phoneUpsellStrings } from "../../common/constants/translationConstants";
import { SET_ERROR_MESSAGE } from "../actions/actionTypes";
import usePhoneUpsellState from "../hooks/usePhoneUpsellState";
import { deletePhoneNumber } from "../services/phoneService";
import InputFieldError from "./InputFieldError";
import getErrorCodeFromRequestError from "../../common/utils/requestUtils";
import { getErrorMessageFromSubmissionErrorCode } from "../utils/errorUtils";
import VerificationDialogHeader from "../../../shared/components/VerificationDialogHeader";

type DeletePhoneNumberProps = {
  translate: Translator<"Feature.VerificationUpsell">;
  onHide: () => void;
  existingPhoneNumber?: string | null;
};

function DeletePhoneNumber({
  translate,
  onHide,
  existingPhoneNumber = null,
}: DeletePhoneNumberProps) {
  const { dispatch } = usePhoneUpsellState();
  const {
    HeadingDeletePhone,
    DescriptionDeletePhone,
    ActionDeletePhonePrimary,
    ActionDeletePhoneSecondary,
  } = phoneUpsellStrings;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteClick = async () => {
    setIsSubmitting(true);
    await deletePhoneNumber()
      .then(() => {
        onHide();
      })
      .catch(err => {
        const errorCode = getErrorCodeFromRequestError(err);
        dispatch({
          type: SET_ERROR_MESSAGE,
          errorMessage: getErrorMessageFromSubmissionErrorCode(errorCode),
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const last4Digits = existingPhoneNumber?.match(/\d+$/);

  return (
    <React.Fragment>
      <VerificationDialogHeader
        className="phone-upsell-header"
        closeClassName="phone-upsell-close"
        titleClassName="text-heading-small"
        titleText={translate(HeadingDeletePhone)}
        onClose={onHide}
      />
      <DialogBody className="phone-upsell-body padding-top-xlarge">
        <div className="phone-upsell-text text-body-large text-align-x-center">
          {translate(DescriptionDeletePhone, { phoneLast4: last4Digits?.[0] ?? "" })}
        </div>
        <InputFieldError translate={translate} />
        <div className="text-align-x-center">
          <button
            type="button"
            className="delete-phone-btn btn-primary-md btn-min-width"
            disabled={isSubmitting}
            onClick={handleDeleteClick}
          >
            {translate(ActionDeletePhonePrimary)}
          </button>
          <button
            type="button"
            className="btn-secondary-md btn-min-width"
            disabled={isSubmitting}
            onClick={onHide}
          >
            {translate(ActionDeletePhoneSecondary)}
          </button>
        </div>
      </DialogBody>
    </React.Fragment>
  );
}

export default DeletePhoneNumber;
