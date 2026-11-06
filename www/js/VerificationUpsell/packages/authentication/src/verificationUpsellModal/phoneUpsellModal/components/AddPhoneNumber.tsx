import React, { useState } from "react";
import { useTranslations, type Translator } from "@rbx/www-common/i18n";
import { Button, DialogBody } from "@rbx/foundation-ui";
import { phoneUpsellStrings } from "../../common/constants/translationConstants";
import {
  getErrorEventWithErrorCodeParam,
  sendVerificationUpsellEvent,
} from "../../common/utils/loggingUtils";
import getErrorCodeFromRequestError from "../../common/utils/requestUtils";
import { SET_ERROR_MESSAGE, SET_PAGE } from "../actions/actionTypes";
import { VERIFY_PHONE_NUMBER_PAGE, DELETE_PHONE_CONFIRM_PAGE } from "../constants/pageConstants";
import events from "../constants/phoneVerificationEventStreamConstants";
import usePhoneUpsellState from "../hooks/usePhoneUpsellState";
import { setPhoneNumber } from "../services/phoneService";
import { getErrorMessageFromSubmissionErrorCode } from "../utils/errorUtils";
import getSectionValueForPage from "../utils/loggingUtils";
import InputFieldError from "./InputFieldError";
import PhoneNumberInput from "./PhoneNumberInput";
import VerificationDialogHeader from "../../../shared/components/VerificationDialogHeader";

const {
  ActionAddPhoneNumber,
  DescriptionPhoneNumberNeverPublic,
  LabelCurrentNumber,
  DescriptionEditPhoneWarning,
  ActionEditPhonePrimary,
  ActionEditPhoneSecondary,
  DescriptionAddPhoneNumber,
  DescriptionAddPhoneBody,
  ActionVerify,
  DescriptionUpdatePhoneNumber,
} = phoneUpsellStrings;

// Some legal strings still carry the link placeholders #13049 stopped filling. use-intl fails to
// format a string with unfilled placeholders, so blank them out.
const legalTextValues = {
  linkTagBreak: " ",
  linkTagWithSmsTos: "",
  linkTagWithPrivacyPolicy: "",
  linkTagEnd: "",
};

type AddPhoneNumberProps = {
  translate: Translator<"Feature.VerificationUpsell">;
  onHide: () => void;
  existingPhoneNumber?: string | null;
  requireLegalTextCheckbox?: boolean;
  headingKey?: string;
  descriptionKey?: string;
  legalTextKey?: string;
  buttonKey?: string;
};

function AddPhoneNumber({
  translate,
  onHide,
  existingPhoneNumber = null,
  requireLegalTextCheckbox = false,
  headingKey = ActionAddPhoneNumber,
  descriptionKey = DescriptionAddPhoneNumber,
  legalTextKey = DescriptionAddPhoneBody,
  buttonKey = ActionVerify,
}: AddPhoneNumberProps) {
  const translateAccountSettings = useTranslations("Feature.AccountSettings");
  const { phoneUpsellState, dispatch } = usePhoneUpsellState();
  const { phone, phonePrefixPickerIndex, phonePrefixOptionsList, pageName, origin } =
    phoneUpsellState;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLegalChecked, setIsLegalChecked] = useState(false);
  const section = getSectionValueForPage(pageName);

  const handleContinueClick = async () => {
    setIsSubmitting(true);
    const { prefix, code } = phonePrefixOptionsList[phonePrefixPickerIndex] ?? {};
    sendVerificationUpsellEvent(events.addPhoneContinuePressed, {
      origin,
      section,
    });
    await setPhoneNumber({ phone, prefix, countryCode: code })
      .then(() => {
        // TODO: add loading UI
        dispatch({ type: SET_PAGE, pageName: VERIFY_PHONE_NUMBER_PAGE });
      })
      .catch(err => {
        const errorCode = getErrorCodeFromRequestError(err);
        const errorEvent = getErrorEventWithErrorCodeParam(
          events.phoneNumberModalErrorShown,
          errorCode,
        );
        sendVerificationUpsellEvent(errorEvent, {
          origin,
          section,
        });
        dispatch({
          type: SET_ERROR_MESSAGE,
          errorMessage: getErrorMessageFromSubmissionErrorCode(errorCode),
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <React.Fragment>
      <VerificationDialogHeader
        className="phone-upsell-header"
        closeClassName="phone-upsell-close"
        titleClassName="text-heading-small"
        titleText={
          existingPhoneNumber ? translate(ActionEditPhonePrimary) : translate.dynamic(headingKey)
        }
        onClose={onHide}
      />
      <DialogBody className="phone-upsell-body padding-top-xlarge">
        <div className="phone-upsell-text text-body-large text-align-x-center">
          {existingPhoneNumber
            ? translateAccountSettings(DescriptionUpdatePhoneNumber)
            : translate.dynamic(descriptionKey)}
        </div>
        {/* Edit Phone Number Info */}
        {existingPhoneNumber && (
          <React.Fragment>
            <div className="phone-upsell-text text-body-large text-align-x-center">
              {translate(LabelCurrentNumber)}
              &nbsp;
              {existingPhoneNumber}
            </div>
            <div className="border-warning two-step-warning">
              <span className="icon-warning-orange" />
              <span className="small text-warning form-warning-text">
                {translate(DescriptionEditPhoneWarning)}
              </span>
            </div>
          </React.Fragment>
        )}
        <PhoneNumberInput translate={translate} />
        <div className="phone-upsell-caption text-body-small content-default text-align-x-center">
          {translate(DescriptionPhoneNumberNeverPublic)}
        </div>
        <InputFieldError translate={translate} />
        {requireLegalTextCheckbox ? (
          <div className="phone-verification-legal-container checkbox">
            <input
              id="phone-verification-legal-checkbox"
              className="checkbox"
              type="checkbox"
              checked={isLegalChecked}
              onChange={() => setIsLegalChecked(!isLegalChecked)}
            />
            <label
              className="text-description font-caption-body phone-verification-legal-text"
              htmlFor="phone-verification-legal-checkbox"
            >
              {translate.dynamic(legalTextKey, legalTextValues)}
            </label>
          </div>
        ) : (
          <div className="phone-upsell-legal text-body-small content-default text-align-x-center">
            {translate.dynamic(legalTextKey, legalTextValues)}
          </div>
        )}
        <Button
          id="add-phone-number-continue-button"
          className="phone-upsell-button width-full !text-label-large"
          variant="Emphasis"
          size="Small"
          isDisabled={
            isSubmitting || phone.length === 0 || (requireLegalTextCheckbox && !isLegalChecked)
          }
          onClick={() => handleContinueClick()}
        >
          {translate.dynamic(buttonKey)}
        </Button>
        {/* Delete Phone Number Button */}
        {existingPhoneNumber && (
          <div className="text-align-x-center">
            <span
              className="text-report remove-phone-label"
              onClick={() => dispatch({ type: SET_PAGE, pageName: DELETE_PHONE_CONFIRM_PAGE })}
              onKeyDown={() => dispatch({ type: SET_PAGE, pageName: DELETE_PHONE_CONFIRM_PAGE })}
              role="button"
              tabIndex={0}
            >
              {translate(ActionEditPhoneSecondary)}
            </span>
          </div>
        )}
      </DialogBody>
    </React.Fragment>
  );
}

export default AddPhoneNumber;
