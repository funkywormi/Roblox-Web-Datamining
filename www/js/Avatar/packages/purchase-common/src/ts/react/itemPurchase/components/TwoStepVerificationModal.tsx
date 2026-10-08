import React, { useEffect, useState, useCallback } from 'react';
import { getAbsoluteUrl } from '@rbx/core-scripts/endpoints';
import { userId } from '@rbx/core-scripts/meta/user';
import { TwoStepVerificationChallenge } from '@rbx/account-security/challenge/twoStepVerification';
import { TwoStepVerification } from '@rbx/account-security/challenge';
import {
  checkTwoStepVerificationEnabled,
  generateTwoStepVerificationToken,
  redeemTwoStepVerificationChallenge
} from '../services/twoStepVerificationService';
import FoundationPurchaseModal from './FoundationPurchaseModal';
import { type PurchaseTranslate } from '../useTranslate';

interface TSystemFeedbackService {
  loading: (message?: string, overrideTimeoutShow?: number, overrideTimeoutHide?: number) => void;
  success: (message?: string, overrideTimeoutShow?: number, overrideTimeoutHide?: number) => void;
  warning: (message?: string, overrideTimeoutShow?: number, overrideTimeoutHide?: number) => void;
  clear: () => void;
}

function TwoStepVerificationModal({
  translate,
  isTwoStepVerificationActive,
  stopTwoStepVerification,
  systemFeedbackService
}: {
  translate: PurchaseTranslate;
  isTwoStepVerificationActive: boolean;
  stopTwoStepVerification: () => void;
  systemFeedbackService: TSystemFeedbackService;
}) {
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [showEnablePrompt, setShowEnablePrompt] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);

  useEffect(() => {
    if (!isTwoStepVerificationActive) return;

    (async () => {
      const is2svEnabled = await checkTwoStepVerificationEnabled();
      if (is2svEnabled) {
        const token = await generateTwoStepVerificationToken();
        if (token) {
          setChallengeToken(token);
        } else {
          systemFeedbackService.warning(translate('Response.VerificationError'));
        }
      } else {
        setShowEnablePrompt(true);
      }
    })();
  }, [isTwoStepVerificationActive]);

  const handleChallengeCompleted = useCallback(
    async (challengeRes: { verificationToken: string }) => {
      if (!challengeToken) return;
      const redeemRes = await redeemTwoStepVerificationChallenge(
        challengeToken,
        challengeRes.verificationToken
      );
      stopTwoStepVerification();
      if (redeemRes) {
        systemFeedbackService.success(translate('Response.SuccessfulVerificationV2'));
      } else {
        systemFeedbackService.warning(translate('Response.VerificationError'));
      }
    },
    [challengeToken, stopTwoStepVerification, systemFeedbackService, translate]
  );

  const handleChallengeInvalidated = useCallback(async () => {
    if (totalAttempts < 3) {
      setTotalAttempts(prev => prev + 1);
      const token = await generateTwoStepVerificationToken();
      if (token) {
        setChallengeToken(token);
      } else {
        systemFeedbackService.warning(translate('Response.VerificationError'));
        stopTwoStepVerification();
      }
    } else {
      systemFeedbackService.warning(translate('Response.VerificationError'));
      stopTwoStepVerification();
    }
  }, [totalAttempts, stopTwoStepVerification, systemFeedbackService, translate]);

  return (
    <React.Fragment>
      <FoundationPurchaseModal
        open={showEnablePrompt}
        title={translate('Heading.TwoStepVerificationRequiredV3')}
        body={<p>{translate('Message.TwoStepVerificationRequiredV4')}</p>}
        actionButtonText={translate('Action.GoToSecurity')}
        neutralButtonText={translate('Action.Cancel')}
        onAction={() => {
          window.location.href = getAbsoluteUrl('/my/account#!/security');
        }}
        onNeutral={() => {
          setShowEnablePrompt(false);
          stopTwoStepVerification();
        }}
        actionButtonShow
      />
      {challengeToken && (
        <TwoStepVerificationChallenge
          userId={String(userId() ?? '')}
          challengeId={challengeToken}
          actionType={TwoStepVerification.ActionType.RobuxSpend}
          renderInline={false}
          shouldShowRememberDeviceCheckbox={false}
          onChallengeCompleted={handleChallengeCompleted}
          onChallengeInvalidated={handleChallengeInvalidated}
          onModalChallengeAbandoned={() => {
            /* */
          }}
        />
      )}
    </React.Fragment>
  );
}

export default TwoStepVerificationModal;
