import React, { useCallback, useRef, useState } from "react";
import { EmailVerifyCodeModalService } from "Roblox";
import type { WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import { FeatureSignupComplianceModal } from "@rbx/authentication-common/constants/translationConstants";
import useIntlAuthCompliance from "@rbx/authentication-common/hooks/useIntlAuthCompliance";
import useOtpMetadata from "@rbx/authentication-common/hooks/useOtpMetadata";
import { KoreaSignupCompliancePolicyCheckboxType } from "@rbx/authentication-common/types/signupTypes";
import type { IOtpSession } from "@rbx/authentication-common/types/otpTypes";
import { isUnderThresholdAgeForCountry } from "@rbx/authentication-common/utils/complianceUtils";
import KoreaSignupComplianceComponent from "../../components/KoreaSignupComplianceComponent";
import PrivacyPolicyCheckbox from "../../components/PrivacyPolicyCheckbox";
import SignupAgreementCheckbox from "../../components/SignupAgreementCheckbox";
import TosCheckbox from "../../components/TosCheckbox";
import {
  complianceConstants,
  otpModalConstants,
  USER_AGREEMENTS,
} from "../../constants/signupConstants";
import { useSignupCheckboxExperiment } from "../../hooks/useSignupCheckboxExperiment";
import {
  sendAuthPageLoadEvent,
  sendPrivacyPolicyboxClickEvent,
  sendSchematizedSignupCheckboxToggledEvent,
  sendTosCheckboxClickEvent,
} from "../../services/eventService";
import type { SignupAgreement } from "../../utils/signupAgreementUtils";
import type { EmailVerifyCodeModalParams } from "../../../emailVerifyCodeModal/interface";

type UseSignUpV2ComplianceInput = {
  day: string;
  month: string;
  year: string;
  locale: string;
  translate: WithTranslationsProps["translate"];
  defaultLegalContent: React.ReactNode;
};

export type SignUpV2Compliance = {
  areAgreementsAccepted: boolean;
  legalContent: React.ReactNode;
  // Rendered in place of the form while Korea's 14+ consent page is open.
  interstitial: React.ReactNode;
  otpSession: IOtpSession;
  parentalConsentAgreements: SignupAgreement[];
  shouldExcludeOptionalPersonalInformationPolicy: boolean;
  // Null when no parent OTP or consent step is due, so the caller can continue synchronously and
  // keep the click's user activation for the passkey prompt. Otherwise resolves true once the
  // steps finish, or false when abandoned.
  beginInterruption: () => Promise<boolean> | null;
  // A parent OTP session is single-use, so a rejected signup has to collect a new one.
  clearParentOtp: () => void;
  reset: () => void;
};

const emptyOtpSession: IOtpSession = { otpSessionToken: "", otpContactType: "" };

/**
 * The production signup's regional compliance (Brazil and Korea parent OTP, the KISA skip-VPC
 * path, Korea's 14+ consent page) and legal-checkbox variants, for the V2 form.
 */
const useSignUpV2Compliance = ({
  day,
  month,
  year,
  locale,
  translate,
  defaultLegalContent,
}: UseSignUpV2ComplianceInput): SignUpV2Compliance => {
  const {
    verifiedSignupCountry,
    parentalConsentId,
    shouldEnableStrictCompliance,
    shouldEnableKoreaEnhancedCompliance,
    shouldDisableSignupCheckbox,
  } = useIntlAuthCompliance();
  const { otpCodeLength, isOtpEnabled } = useOtpMetadata(otpModalConstants.origin);
  const { isSignupCheckboxEnabled, signupAgreementsTranslationKey } = useSignupCheckboxExperiment();

  const [isTosChecked, setIsTosChecked] = useState(false);
  const [isPrivacyPolicyChecked, setIsPrivacyPolicyChecked] = useState(false);
  const [otpSession, setOtpSession] = useState(emptyOtpSession);
  const [parentalConsentAgreements, setParentalConsentAgreements] = useState<SignupAgreement[]>([]);
  const [isKoreaConsentPageShown, setIsKoreaConsentPageShown] = useState(false);
  const [koreaPoliciesType, setKoreaPoliciesType] = useState<
    KoreaSignupCompliancePolicyCheckboxType | undefined
  >(undefined);
  const settleInterruptionRef = useRef<((isComplete: boolean) => void) | null>(null);
  // Add Auth Method checks again for the same submit, but production logs one skip per submit.
  const hasLoggedVpcSkipRef = useRef(false);

  const clearParentOtp = useCallback((): void => {
    setOtpSession(emptyOtpSession);
    setParentalConsentAgreements([]);
    hasLoggedVpcSkipRef.current = false;
  }, []);

  const isKoreaEnhancedConsentRequired =
    shouldEnableStrictCompliance && shouldEnableKoreaEnhancedCompliance;
  const isUnderCountryThreshold = isUnderThresholdAgeForCountry(
    year,
    month,
    day,
    verifiedSignupCountry,
  );
  const isUnderThresholdForKorea =
    verifiedSignupCountry === complianceConstants.Korea.name && isUnderCountryThreshold;

  const isCheckboxExperimentShown =
    isSignupCheckboxEnabled &&
    Boolean(signupAgreementsTranslationKey) &&
    !shouldDisableSignupCheckbox;

  let areAgreementsAccepted = true;
  if (!shouldEnableKoreaEnhancedCompliance) {
    if (isCheckboxExperimentShown) {
      areAgreementsAccepted = isTosChecked;
    } else if (shouldEnableStrictCompliance) {
      areAgreementsAccepted = isTosChecked && isPrivacyPolicyChecked;
    }
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
  if (isKoreaEnhancedConsentRequired) {
    // Korea's consent page collects the agreements instead.
    legalContent = null;
  } else if (isCheckboxExperimentShown && signupAgreementsTranslationKey) {
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

  const settleInterruption = (isComplete: boolean): void => {
    const settle = settleInterruptionRef.current;
    settleInterruptionRef.current = null;
    settle?.(isComplete);
  };

  const needsParentOtp = (): boolean => {
    if (isUnderThresholdForKorea) {
      if (!hasLoggedVpcSkipRef.current) {
        hasLoggedVpcSkipRef.current = true;
        sendAuthPageLoadEvent(EVENT_CONSTANTS.context.kisaU14Signup, EVENT_CONSTANTS.state.skipVPC);
      }
      return false;
    }
    return (
      isOtpEnabled &&
      !otpSession.otpSessionToken &&
      shouldEnableStrictCompliance &&
      isUnderCountryThreshold
    );
  };

  const needsKoreaConsentPage = (): boolean =>
    isKoreaEnhancedConsentRequired && koreaPoliciesType === undefined;

  const handleOtpComplete = (session: IOtpSession): void => {
    setOtpSession(session);
    setParentalConsentAgreements(
      parentalConsentId
        ? [{ id: parentalConsentId, agreementType: USER_AGREEMENTS.ParentalConsent }]
        : [],
    );
    if (
      isKoreaEnhancedConsentRequired &&
      verifiedSignupCountry === complianceConstants.Korea.name
    ) {
      setIsKoreaConsentPageShown(true);
      return;
    }
    settleInterruption(true);
  };

  const handleOtpAbandoned = (): void => {
    clearParentOtp();
    settleInterruption(false);
  };

  const openParentOtpModal = (): boolean => {
    sendAuthPageLoadEvent(
      EVENT_CONSTANTS.context.kisaU14Signup,
      EVENT_CONSTANTS.state.launchParentSignUpOtp,
    );
    if (!EmailVerifyCodeModalService) {
      return false;
    }
    const params: EmailVerifyCodeModalParams = {
      containerId: otpModalConstants.otpSignupContainer,
      codeLength: otpCodeLength,
      onComplete: handleOtpComplete,
      onModalAbandoned: handleOtpAbandoned,
      legalCheckboxLabel: translate(
        FeatureSignupComplianceModal.DescriptionSignupOtpModalLegalCheckboxLabel,
      ),
      enterEmailTitle: translate(
        FeatureSignupComplianceModal.HeadingVerifiedParentalConsentModalAddHeader,
      ),
      enterEmailDescription: translate(FeatureSignupComplianceModal.DescriptionEnterParentEmail),
      enterCodeTitle: translate(FeatureSignupComplianceModal.LabelVerificationCode),
      enterCodeDescription: translate(
        FeatureSignupComplianceModal.DescriptionVerifiedParentalConsentModalEnterCodeNoEmailReveal,
      ),
      origin: otpModalConstants.origin,
      translate,
    };
    EmailVerifyCodeModalService.renderEmailVerifyCodeModal(params);
    return true;
  };

  const beginInterruption = (): Promise<boolean> | null => {
    if (needsParentOtp()) {
      return new Promise<boolean>(resolve => {
        settleInterruptionRef.current = resolve;
        if (!openParentOtpModal()) {
          settleInterruption(false);
        }
      });
    }
    if (needsKoreaConsentPage()) {
      return new Promise<boolean>(resolve => {
        settleInterruptionRef.current = resolve;
        setIsKoreaConsentPageShown(true);
      });
    }
    return null;
  };

  const handleKoreaConsentComplete = (
    agreementType: KoreaSignupCompliancePolicyCheckboxType,
  ): void => {
    setKoreaPoliciesType(agreementType);
    setIsKoreaConsentPageShown(false);
    settleInterruption(true);
  };

  // The parent OTP and consent are tied to the birthday they were collected for.
  const reset = useCallback((): void => {
    clearParentOtp();
    setKoreaPoliciesType(undefined);
  }, [clearParentOtp]);

  return {
    areAgreementsAccepted,
    legalContent,
    interstitial: isKoreaConsentPageShown ? (
      <KoreaSignupComplianceComponent
        translate={translate}
        onComplete={handleKoreaConsentComplete}
        isUnderThresholdAgeForCountry={isUnderThresholdForKorea}
      />
    ) : null,
    otpSession,
    parentalConsentAgreements,
    shouldExcludeOptionalPersonalInformationPolicy:
      shouldEnableKoreaEnhancedCompliance &&
      koreaPoliciesType !== KoreaSignupCompliancePolicyCheckboxType.All,
    beginInterruption,
    clearParentOtp,
    reset,
  };
};

export default useSignUpV2Compliance;
