import React, { useEffect } from 'react';
import { AccountIntegrityChallengeService } from 'Roblox';
import {
  TOn2svChallengeCompletedData,
  TOn2svChallengeInvalidatedData
} from '../../common/types/twoStepVerificationTypes';
import { containerConstants } from '../constants/loginConstants';

const { TwoStepVerification } = AccountIntegrityChallengeService;

export type login2svProps = {
  userId: string;
  challengeId: string;
  on2svChallengeCompleted: (data: TOn2svChallengeCompletedData) => void;
  on2svChallengeInvalidated: (data: TOn2svChallengeInvalidatedData) => void;
  on2svChallengeAbandoned: (data: unknown) => void;
  onUnknownError: () => void;
};

export const Login2sv = ({
  userId,
  challengeId,
  on2svChallengeCompleted,
  on2svChallengeInvalidated,
  on2svChallengeAbandoned,
  onUnknownError
}: login2svProps): JSX.Element => {
  const { react2svContainer } = containerConstants;
  const handle2svChallenge = () => {
    try {
      const success = TwoStepVerification.renderChallenge({
        containerId: react2svContainer,
        userId,
        challengeId,
        actionType: TwoStepVerification.ActionType.Login,
        renderInline: false,
        shouldShowRememberDeviceCheckbox: true,
        recoveryParameters: {
          clientSupports2svRecovery: true
        },
        onChallengeCompleted: on2svChallengeCompleted,
        onChallengeInvalidated: on2svChallengeInvalidated,
        onModalChallengeAbandoned: on2svChallengeAbandoned
      });
      if (!success) {
        onUnknownError();
      }
    } catch (error) {
      onUnknownError();
    }
  };

  useEffect(() => {
    if (userId && challengeId) {
      handle2svChallenge();
    }
  }, [userId, challengeId]);

  return <div id={react2svContainer} />;
};

export default Login2sv;
