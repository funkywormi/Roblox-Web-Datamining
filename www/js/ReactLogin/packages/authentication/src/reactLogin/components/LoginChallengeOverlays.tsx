import React from "react";
import { AccountIntegrityChallengeService } from "Roblox";
import { WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import CaptchaComponent from "@rbx/authentication-common/components/CaptchaComponent";
import AccountSelectorComponent from "@rbx/authentication-common/components/AccountSelectorComponent";
import { FeatureLoginPage } from "@rbx/authentication-common/constants/translationConstants";
import { TMultipleUsersPerCredentialErrorData } from "@rbx/authentication-common/types/accountSelectorTypes";
import {
  TOnCaptchaChallengeCompletedData,
  TOnCaptchaChallengeInvalidatedData,
} from "@rbx/authentication-common/types/captchaTypes";
import { CredentialType } from "@rbx/authentication-common/types/loginTypes";
import {
  TOnSecurityQuestionsChallengeCompletedData,
  TOnSecurityQuestionsChallengeInvalidatedData,
} from "@rbx/authentication-common/types/securityQuestionsTypes";
import {
  TOn2svChallengeCompletedData,
  TOn2svChallengeInvalidatedData,
} from "@rbx/authentication-common/types/twoStepVerificationTypes";
import { confirmationModalOrigins } from "../../accountSwitcher/constants/accountSwitcherConstants";
import AccountSwitcherRestrictionComponent from "../../shared/AccountSwitcherRestrictionComponent";
import { containerConstants } from "../constants/loginConstants";
import { buildAccountSelectorHelpText } from "../utils/loginUtils";
import Login2sv from "./Login2sv";
import LoginIdVerification from "./LoginIdVerification";
import LoginSecurityQuestions from "./LoginSecurityQuestions";

// TODO(AA-7602): Group these props by challenge flow (captcha, security questions, 2SV,
// identity verification, account selector, account limit) instead of a flat list.
export type LoginChallengeOverlaysProps = {
  unifiedCaptchaId: string;
  dataExchange: string;
  onCaptchaChallengeCompleted: (data: TOnCaptchaChallengeCompletedData) => void;
  onCaptchaChallengeInvalidated: (data: TOnCaptchaChallengeInvalidatedData) => void;
  onCaptchaChallengeAbandoned: () => void;
  onUnknownError: () => void;
  userId: string;
  securityQuestionsSessionId: string;
  onSecurityQuestionsChallengeCompleted: (data: TOnSecurityQuestionsChallengeCompletedData) => void;
  onSecurityQuestionsChallengeInvalidated: (
    data: TOnSecurityQuestionsChallengeInvalidatedData,
  ) => void;
  onSecurityQuestionsChallengeAbandoned: (data: unknown) => void;
  challengeId: string;
  on2svChallengeCompleted: (data: TOn2svChallengeCompletedData) => void;
  on2svChallengeInvalidated: (data: TOn2svChallengeInvalidatedData) => void;
  on2svChallengeAbandoned: (data: unknown) => void;
  identityVerificationLoginTicket: string;
  multipleUsersPerCredentialData: TMultipleUsersPerCredentialErrorData;
  onAccountSelection: (userId: number) => void;
  onAccountSelectorAbandoned: () => void;
  credentialType: CredentialType;
  hasMaxLoggedInAccountsLoginError: boolean;
  shouldShowAccountLimitModal: boolean;
  isParentUser: boolean;
  onAccountLimitConfirmation: () => void;
  translate: WithTranslationsProps["translate"];
};

const LoginChallengeOverlays = ({
  unifiedCaptchaId,
  dataExchange,
  onCaptchaChallengeCompleted,
  onCaptchaChallengeInvalidated,
  onCaptchaChallengeAbandoned,
  onUnknownError,
  userId,
  securityQuestionsSessionId,
  onSecurityQuestionsChallengeCompleted,
  onSecurityQuestionsChallengeInvalidated,
  onSecurityQuestionsChallengeAbandoned,
  challengeId,
  on2svChallengeCompleted,
  on2svChallengeInvalidated,
  on2svChallengeAbandoned,
  identityVerificationLoginTicket,
  multipleUsersPerCredentialData,
  onAccountSelection,
  onAccountSelectorAbandoned,
  credentialType,
  hasMaxLoggedInAccountsLoginError,
  shouldShowAccountLimitModal,
  isParentUser,
  onAccountLimitConfirmation,
  translate,
}: LoginChallengeOverlaysProps): React.JSX.Element => (
  <React.Fragment>
    {unifiedCaptchaId && dataExchange && (
      <CaptchaComponent
        containerId={containerConstants.reactCaptchaContainer}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        actionType={AccountIntegrityChallengeService.Captcha.ActionType.Login}
        unifiedCaptchaId={unifiedCaptchaId}
        dataExchange={dataExchange}
        onCaptchaChallengeCompleted={onCaptchaChallengeCompleted}
        onCaptchaChallengeInvalidated={onCaptchaChallengeInvalidated}
        onCaptchaChallengeAbandoned={onCaptchaChallengeAbandoned}
        onUnknownError={onUnknownError}
      />
    )}
    {userId && securityQuestionsSessionId && (
      <LoginSecurityQuestions
        userId={userId}
        sessionId={securityQuestionsSessionId}
        onSecurityQuestionsChallengeCompleted={onSecurityQuestionsChallengeCompleted}
        onSecurityQuestionsChallengeInvalidated={onSecurityQuestionsChallengeInvalidated}
        onSecurityQuestionsChallengeAbandoned={onSecurityQuestionsChallengeAbandoned}
        onUnknownError={onUnknownError}
      />
    )}
    {userId && challengeId && (
      <Login2sv
        userId={userId}
        challengeId={challengeId}
        on2svChallengeCompleted={on2svChallengeCompleted}
        on2svChallengeInvalidated={on2svChallengeInvalidated}
        on2svChallengeAbandoned={on2svChallengeAbandoned}
        onUnknownError={onUnknownError}
      />
    )}
    <LoginIdVerification
      identityVerificationLoginTicket={identityVerificationLoginTicket}
      translate={translate}
    />
    {multipleUsersPerCredentialData.users.length > 0 && (
      <AccountSelectorComponent
        containerId={containerConstants.reactAccountSelectorContainer}
        users={multipleUsersPerCredentialData.users}
        // U13 users cannot log in with OTP, so this flow does not return invalid users.
        invalidUsers={[]}
        onAccountSelection={onAccountSelection}
        onAccountSelectorAbandoned={onAccountSelectorAbandoned}
        titleText={translate(FeatureLoginPage.LabelAccountSelector)}
        helpText={buildAccountSelectorHelpText(credentialType, translate)}
        translate={translate}
      />
    )}
    <AccountSwitcherRestrictionComponent
      origin={confirmationModalOrigins.LoginAccountLimit}
      containerId={containerConstants.reactAccountLimitErrorContainer}
      handleRedirectHome={onAccountLimitConfirmation}
      hasMaxLoggedInAccountsSignupError={hasMaxLoggedInAccountsLoginError}
      isAccountLimitReached={shouldShowAccountLimitModal}
      isParentUser={isParentUser}
    />
  </React.Fragment>
);

export default LoginChallengeOverlays;
