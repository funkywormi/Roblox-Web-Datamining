import React, { useEffect, useState } from "react";
import type { Translator } from "@rbx/www-common/i18n";
import { Dialog, DialogContent } from "@rbx/foundation-ui";
import { originValues } from "../../common/constants/loggingConstants";
import { sendVerificationUpsellEvent } from "../../common/utils/loggingUtils";
import {
  CLOSE_PHONE_NUMBER_MODAL,
  SET_LOGGING_VALUES,
  SET_DISCOVERABILITY_CONSENT_PREFILL,
  SET_PAGE,
} from "../actions/actionTypes";
// components
import AddPhoneNumber from "../components/AddPhoneNumber";
import AddPhoneSuccess from "../components/AddPhoneSuccess";
import PhoneDiscoverabilityConsentV2 from "../components/PhoneDiscoverabilityConsentV2";
import VerifyPhoneNumber from "../components/VerifyPhoneNumber";
import DeletePhoneNumber from "../components/DeletePhoneNumber";
// pages
import {
  ADD_PHONE_NUMBER_PAGE,
  ADD_PHONE_SUCCESS_PAGE,
  PHONE_DISCOVERABILITY_CONSENT_V2_PAGE,
  VERIFY_PHONE_NUMBER_PAGE,
  DELETE_PHONE_CONFIRM_PAGE,
} from "../constants/pageConstants";
import events from "../constants/phoneVerificationEventStreamConstants";
import usePhoneUpsellState from "../hooks/usePhoneUpsellState";
import getSectionValueForPage from "../utils/loggingUtils";
import { getPhoneVerificationSuccessPageAndAffirmativeConsentPrefill } from "../utils/phoneDiscoverabilityUtils";
import "../css/phoneUpsellDialog.css";

type PhoneUpsellModalContainerProps = {
  translate: Translator<"Feature.VerificationUpsell">;
  onClose: (isPhoneVerified?: boolean) => void;
  origin?: string;
  existingPhoneNumber?: string | null;
  addPhoneRequireLegalTextCheckbox?: boolean;
  addPhoneHeadingKey?: string;
  addPhoneDescriptionKey?: string;
  addPhoneLegalTextKey?: string;
  addPhoneButtonKey?: string;
  beforeSuccess?: (() => Promise<[string, string]> | [string, string]) | null;
  renderInWebview?: boolean;
};

function PhoneUpsellModalContainer({
  translate,
  onClose,
  origin = originValues.homepage,
  existingPhoneNumber = null,
  addPhoneRequireLegalTextCheckbox,
  addPhoneHeadingKey,
  addPhoneDescriptionKey,
  addPhoneLegalTextKey,
  addPhoneButtonKey,
  beforeSuccess = null,
  renderInWebview = false,
}: PhoneUpsellModalContainerProps) {
  const { phoneUpsellState, dispatch } = usePhoneUpsellState();
  const [phoneVerificationSuccessPage, setPhoneVerificationSuccessPage] =
    useState(ADD_PHONE_SUCCESS_PAGE);
  const [overrideSuccessHeadingKey, setOverrideSuccessHeadingKey] = useState<string | undefined>(
    undefined,
  );
  const [overrideSuccessDescriptionKey, setOverrideSuccessDescriptionKey] = useState<
    string | undefined
  >(undefined);
  const section = getSectionValueForPage(phoneUpsellState.pageName);
  const onHide = () => {
    sendVerificationUpsellEvent(events.phoneNumberModalDismissed, {
      origin: phoneUpsellState.origin,
      section,
    });
    onClose(phoneUpsellState.isPhoneVerified);
    dispatch({ type: CLOSE_PHONE_NUMBER_MODAL });
  };
  const onVerify = async () => {
    if (beforeSuccess) {
      try {
        const [successHeadingKey, successDescriptionKey] = await beforeSuccess();
        setOverrideSuccessHeadingKey(successHeadingKey);
        setOverrideSuccessDescriptionKey(successDescriptionKey);
      } catch (error) {
        console.error(
          `Error from before success hook in phone verification: ${String(error)}`,
          error,
        );
      }
    }
    dispatch({ type: SET_PAGE, pageName: phoneVerificationSuccessPage });
  };
  const modalContent = () => {
    switch (phoneUpsellState.pageName) {
      case ADD_PHONE_NUMBER_PAGE:
        return (
          <AddPhoneNumber
            translate={translate}
            onHide={onHide}
            existingPhoneNumber={existingPhoneNumber}
            requireLegalTextCheckbox={addPhoneRequireLegalTextCheckbox}
            headingKey={addPhoneHeadingKey}
            descriptionKey={addPhoneDescriptionKey}
            legalTextKey={addPhoneLegalTextKey}
            buttonKey={addPhoneButtonKey}
          />
        );
      case VERIFY_PHONE_NUMBER_PAGE:
        return <VerifyPhoneNumber translate={translate} onHide={onHide} onVerify={onVerify} />;
      case ADD_PHONE_SUCCESS_PAGE:
        return (
          <AddPhoneSuccess
            translate={translate}
            onHide={onHide}
            headingKey={overrideSuccessHeadingKey}
            descriptionKey={overrideSuccessDescriptionKey}
          />
        );
      case DELETE_PHONE_CONFIRM_PAGE:
        return (
          <DeletePhoneNumber
            translate={translate}
            existingPhoneNumber={existingPhoneNumber}
            onHide={onHide}
          />
        );
      case PHONE_DISCOVERABILITY_CONSENT_V2_PAGE:
        return null;
      default:
        return <AddPhoneNumber translate={translate} onHide={onHide} />;
    }
  };

  useEffect(() => {
    // don't log impression until the origin value is set in state.
    if (phoneUpsellState.origin !== originValues.unset) {
      sendVerificationUpsellEvent(events.phoneNumberModalShown, {
        origin: phoneUpsellState.origin,
        section,
      });
    }
  }, [phoneUpsellState.pageName, phoneUpsellState.origin]);

  useEffect(() => {
    // set initial state
    dispatch({ type: SET_LOGGING_VALUES, origin });
  }, []);

  useEffect(() => {
    async function fetchPhoneSuccessPage() {
      // fetch details about what success page to go to next after verification
      const { successPage, shouldPrefillAffirmativeDiscoverabilityConsent } =
        await getPhoneVerificationSuccessPageAndAffirmativeConsentPrefill();
      dispatch({
        type: SET_DISCOVERABILITY_CONSENT_PREFILL,
        shouldPrefillAffirmativeDiscoverabilityConsent,
      });
      setPhoneVerificationSuccessPage(successPage);
    }

    if (origin !== originValues.challenge) {
      fetchPhoneSuccessPage();
    }
  }, []);

  const isConsentPage = phoneUpsellState.pageName === PHONE_DISCOVERABILITY_CONSENT_V2_PAGE;

  return (
    <React.Fragment>
      {/* AMP opens its own modal in another root; an open phone dialog would treat clicks there as outside clicks. */}
      {phoneUpsellState.isOpen && isConsentPage && (
        <PhoneDiscoverabilityConsentV2 onHide={onHide} origin={origin} />
      )}
      <Dialog
        open={phoneUpsellState.isOpen && !isConsentPage}
        onOpenChange={open => {
          if (!open) {
            onHide();
          }
        }}
        size="Large"
        isModal
        hasMarginTop={false}
        hasCloseAffordance={false}
        experimentalDisablePointerEventsStylingOnBody
      >
        <DialogContent
          className={`phone-upsell-dialog${renderInWebview ? " phone-upsell-webview" : ""}`}
          overlayClassName={`phone-upsell-overlay${renderInWebview ? " phone-upsell-webview-overlay" : ""}`}
        >
          {modalContent()}
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

export default PhoneUpsellModalContainer;
