import React, { useState } from "react";
import type { WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import useIntlAuthCompliance from "@rbx/authentication-common/hooks/useIntlAuthCompliance";
import PrivacyPolicyCheckbox from "../../components/PrivacyPolicyCheckbox";
import SignupAgreementCheckbox from "../../components/SignupAgreementCheckbox";
import TosCheckbox from "../../components/TosCheckbox";
import { useSignupCheckboxExperiment } from "../../hooks/useSignupCheckboxExperiment";
import {
  sendPrivacyPolicyboxClickEvent,
  sendSchematizedSignupCheckboxToggledEvent,
  sendTosCheckboxClickEvent,
} from "../../services/eventService";

type UseSignUpV2ComplianceInput = {
  locale: string;
  translate: WithTranslationsProps["translate"];
  defaultLegalContent: React.ReactNode;
};

export type SignUpV2Compliance = {
  areAgreementsAccepted: boolean;
  legalContent: React.ReactNode;
};

/**
 * The production signup's legal-checkbox variants (strict-compliance ToS and Privacy Policy
 * checkboxes and the signup checkbox experiment), for the V2 form.
 */
const useSignUpV2Compliance = ({
  locale,
  translate,
  defaultLegalContent,
}: UseSignUpV2ComplianceInput): SignUpV2Compliance => {
  const { shouldEnableStrictCompliance, shouldDisableSignupCheckbox } = useIntlAuthCompliance();
  const { isSignupCheckboxEnabled, signupAgreementsTranslationKey } = useSignupCheckboxExperiment();

  const [isTosChecked, setIsTosChecked] = useState(false);
  const [isPrivacyPolicyChecked, setIsPrivacyPolicyChecked] = useState(false);

  const isCheckboxExperimentShown =
    isSignupCheckboxEnabled &&
    Boolean(signupAgreementsTranslationKey) &&
    !shouldDisableSignupCheckbox;

  let areAgreementsAccepted = true;
  if (isCheckboxExperimentShown) {
    areAgreementsAccepted = isTosChecked;
  } else if (shouldEnableStrictCompliance) {
    areAgreementsAccepted = isTosChecked && isPrivacyPolicyChecked;
  }

  const handleTosChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setIsTosChecked(event.target.checked);
    sendTosCheckboxClickEvent(event.target.checked);
    sendSchematizedSignupCheckboxToggledEvent(event.target.checked);
  };

  const handlePrivacyPolicyChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setIsPrivacyPolicyChecked(event.target.checked);
    sendPrivacyPolicyboxClickEvent(event.target.checked);
  };

  let legalContent: React.ReactNode = defaultLegalContent;
  if (isCheckboxExperimentShown && signupAgreementsTranslationKey) {
    legalContent = (
      <SignupAgreementCheckbox
        locale={locale}
        translate={translate}
        translationKey={signupAgreementsTranslationKey}
        isChecked={isTosChecked}
        onCheckBoxChanged={handleTosChange}
      />
    );
  } else if (shouldEnableStrictCompliance) {
    legalContent = (
      <React.Fragment>
        <TosCheckbox
          locale={locale}
          translate={translate}
          isChecked={isTosChecked}
          onCheckBoxChanged={handleTosChange}
        />
        <PrivacyPolicyCheckbox
          locale={locale}
          translate={translate}
          isChecked={isPrivacyPolicyChecked}
          onCheckBoxChanged={handlePrivacyPolicyChange}
        />
      </React.Fragment>
    );
  }

  return { areAgreementsAccepted, legalContent };
};

export default useSignUpV2Compliance;
