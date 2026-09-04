import React from 'react';
import LoginSecurityQuestions from '../../components/LoginSecurityQuestions';
import { backToLogin, LoginStep } from '../loginState';
import { useLoginMutation } from '../common';

const SecurityQuestions = ({
  credential,
  userId,
  sessionId
}: Omit<LoginStep & { step: 'security-questions' }, 'step'>): JSX.Element | null => {
  const login = useLoginMutation();

  return (
    <LoginSecurityQuestions
      userId={userId}
      sessionId={sessionId}
      onSecurityQuestionsChallengeCompleted={({ redemptionToken }) => {
        if (!login.isPending) {
          login.mutate({
            credential,
            securityQuestionSessionId: sessionId,
            securityQuestionRedemptionToken: redemptionToken
          });
        }
      }}
      onSecurityQuestionsChallengeInvalidated={({ errorMessage }) => backToLogin(errorMessage)}
      onSecurityQuestionsChallengeAbandoned={() => backToLogin()}
      onUnknownError={backToLogin} // TODO: error message
    />
  );
};

export default SecurityQuestions;
