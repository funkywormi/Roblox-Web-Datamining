import React from "react";
import { useTranslation, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { loginTranslationConfig } from "../translation.config";
import { FeatureLoginPage } from "@rbx/authentication-common/constants/translationConstants";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import { loginFormStrings, urlConstants } from "../constants/loginConstants";
import { sendLoginLinkClickEvent } from "../services/eventService";

export type forgotCredentialLinkProps = {
  credentialValue: string;
  translate: WithTranslationsProps["translate"];
  useSentenceCaseLabel?: boolean;
};

export const ForgotCredentialLink = ({
  credentialValue,
  translate,
  useSentenceCaseLabel = false,
}: forgotCredentialLinkProps): JSX.Element => {
  const { forgotCredentialsUrl } = urlConstants;
  const forgotCredentialsUrlWithParameters = credentialValue
    ? `${forgotCredentialsUrl}?identifier=${encodeURIComponent(credentialValue)}`
    : forgotCredentialsUrl;

  const linkTextKey = useSentenceCaseLabel
    ? loginFormStrings.ActionForgotPasswordOrUsernameQuestion
    : FeatureLoginPage.ActionForgotPasswordOrUsernameQuestionCapitalized;
  return (
    <div className="text-center forgot-credentials-link">
      <a
        id="forgot-credentials-link"
        className="text-link"
        href={forgotCredentialsUrlWithParameters}
        target="_self"
        onClick={() => sendLoginLinkClickEvent(EVENT_CONSTANTS.btn.forgotCredentials)}
      >
        {translate(linkTextKey)}
      </a>
    </div>
  );
};

export default ForgotCredentialLink;
