import React, { useEffect } from 'react';
import { EmailVerifyCodeModalService } from 'Roblox';
import { useTranslation } from 'react-utilities';
import { CredentialType } from '../../../common/types/loginTypes';
import { containerConstants, otpOrigin } from '../../constants/loginConstants';
import { useLoginMutation } from '../common';
import { backToLogin } from '../loginState';
import { FeatureLoginPage } from '../../../common/constants/translationConstants';

// TODO: consider redesigning this as a form step instead of a modal
const Otp = ({ codeLength }: { codeLength: number }): JSX.Element => {
  const { translate } = useTranslation();
  const login = useLoginMutation();

  useEffect(() => {
    if (EmailVerifyCodeModalService == null) {
      backToLogin(); // TODO: error message
      return;
    }
    EmailVerifyCodeModalService.renderEmailVerifyCodeModal({
      containerId: containerConstants.otpLoginContainer,
      codeLength,
      onEmailCodeEntered: (sessionToken, code) => {
        if (!login.isPending) {
          const credential = {
            type: CredentialType.EmailOtpSessionToken,
            value: sessionToken,
            password: code
          };
          login.mutate({ credential });
        }
      },
      onModalAbandoned: backToLogin,
      enterEmailTitle: translate(FeatureLoginPage.LabelGetOneTimeCode),
      enterEmailDescription: translate(FeatureLoginPage.DescriptionGetOneTimeCodeHelp),
      enterCodeTitle: translate(FeatureLoginPage.LabelEnterOneTimeCode),
      enterCodeDescription: translate(FeatureLoginPage.DescriptionEnterOneTimeCodeHelp),
      origin: otpOrigin,
      translate,
      isChangeEmailEnabled: true
    });
  }, [codeLength, login, translate]);

  return <div id={containerConstants.otpLoginContainer} />;
};

export default Otp;
