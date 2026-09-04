import React, { useState } from 'react';
import { AccountSwitcherService } from 'Roblox';
import { cryptoUtil } from 'core-roblox-utilities';
import { useTranslation } from 'react-utilities';
import { useMutation } from '@tanstack/react-query';
import { loginWithVerificationToken as loginWithVerificationTokenRequest } from '../../services/loginService';
import Login2svOld from '../../components/Login2sv';
import { TLoginWithVerificationTokenParams } from '../../../common/types/loginTypes';
import { incrementEphemeralCounter } from '../../utils/loginUtils';
import { eventCounters, retryAttempts } from '../../constants/loginConstants';
import { finishSuccessfulLogin, useLoginMutation } from '../common';
import { LoginStep, backToLogin } from '../loginState';
import { FeatureLoginPage } from '../../../common/constants/translationConstants';

const loginWithVerificationTokenParams = async (
  userId: string,
  params: TLoginWithVerificationTokenParams
) => {
  const secureAuthenticationIntent = await cryptoUtil.generateSecureAuthIntentV2();
  const authParams = { ...params, secureAuthenticationIntent };
  const result = await loginWithVerificationTokenRequest(userId, authParams);
  if (secureAuthenticationIntent) {
    incrementEphemeralCounter(eventCounters.successWithSAI);
  }

  finishSuccessfulLogin(userId, result.accountBlob);
};

// TODO: consider redesigning this as a form step instead of a modal
const Login2sv = ({
  credential,
  userId,
  challengeId
}: Omit<LoginStep & { step: '2sv' }, 'step'>): JSX.Element => {
  const { translate } = useTranslation();
  const error = () => backToLogin(translate(FeatureLoginPage.ResponseVerificationError));
  const login = useLoginMutation();
  const [failureCount, setFailureCount] = useState(0);
  const loginWithVerificationToken = useMutation({
    mutationFn: async ({
      verificationToken,
      rememberDevice
    }: {
      verificationToken: string;
      rememberDevice: boolean;
    }) => {
      const params: TLoginWithVerificationTokenParams = {
        challengeId,
        verificationToken,
        rememberDevice,
        accountBlob: AccountSwitcherService?.getStoredAccountSwitcherBlob(),
        secureAuthenticationIntent: null
      };
      await loginWithVerificationTokenParams(userId.toString(), params);
    },
    onError: error
  });

  return (
    <Login2svOld
      userId={userId.toString()}
      challengeId={challengeId}
      on2svChallengeCompleted={data => {
        if (!loginWithVerificationToken.isPending) {
          loginWithVerificationToken.mutate(data);
        }
      }}
      on2svChallengeInvalidated={() => {
        if (failureCount < retryAttempts.maxInvalidated2svChallengeAttempts) {
          setFailureCount(n => n + 1);
          login.mutate({ credential });
        } else {
          setFailureCount(0);
          error();
        }
      }}
      on2svChallengeAbandoned={() => backToLogin()}
      onUnknownError={error}
    />
  );
};

export default Login2sv;
