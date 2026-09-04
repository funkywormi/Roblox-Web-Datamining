import React, { useEffect } from 'react';
import { AccountIntegrityChallengeService } from 'Roblox';
import { containerConstants } from '../constants/loginConstants';
import {
  TOnSecurityQuestionsChallengeCompletedData,
  TOnSecurityQuestionsChallengeInvalidatedData
} from '../../common/types/securityQuestionsTypes';

const { SecurityQuestions } = AccountIntegrityChallengeService;

export type loginSecurityQuestionsProps = {
  userId: string;
  sessionId: string;
  onSecurityQuestionsChallengeCompleted: (data: TOnSecurityQuestionsChallengeCompletedData) => void;
  onSecurityQuestionsChallengeInvalidated: (
    data: TOnSecurityQuestionsChallengeInvalidatedData
  ) => void;
  onSecurityQuestionsChallengeAbandoned: (data: unknown) => void;
  onUnknownError: () => void;
};

export const LoginSecurityQuestions = ({
  userId,
  sessionId,
  onSecurityQuestionsChallengeCompleted,
  onSecurityQuestionsChallengeInvalidated,
  onSecurityQuestionsChallengeAbandoned,
  onUnknownError
}: loginSecurityQuestionsProps): JSX.Element => {
  const { reactSecurityQuestionsContainer } = containerConstants;
  const handleSecurityQuestionsChallenge = () => {
    try {
      const success = SecurityQuestions.renderChallenge({
        containerId: reactSecurityQuestionsContainer,
        userId,
        sessionId,
        renderInline: false,
        onChallengeCompleted: onSecurityQuestionsChallengeCompleted,
        onChallengeInvalidated: onSecurityQuestionsChallengeInvalidated,
        onModalChallengeAbandoned: onSecurityQuestionsChallengeAbandoned
      });
      if (!success) {
        onUnknownError();
      }
    } catch (error) {
      onUnknownError();
    }
  };

  useEffect(() => {
    if (userId && sessionId) {
      handleSecurityQuestionsChallenge();
    }
  }, [userId, sessionId]);

  return <div id={reactSecurityQuestionsContainer} />;
};

export default LoginSecurityQuestions;
