import { useRef } from "react";
import { AccountIntegrityChallengeService } from "@rbx/legacy-webapp-types/Roblox";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useTranslation } from "@rbx/core-scripts/react";
import { generateChallenge, redeemVerificationChallenge } from "../services/verification";

const MAX_RETRY_ATTEMPTS = 3;

type TwoStepVerificationApi = {
  renderChallenge: (config: {
    containerId: string;
    userId: number;
    challengeId: string;
    actionType: unknown;
    renderInline: boolean;
    shouldShowRememberDeviceCheckbox: boolean;
    onChallengeCompleted: (tokenData: { verificationToken: string }) => void;
    onChallengeInvalidated: () => void;
    onModalChallengeAbandoned: () => void;
  }) => void;
  ActionType: { ItemTrade: unknown };
};

const { TwoStepVerification } = AccountIntegrityChallengeService as {
  TwoStepVerification: TwoStepVerificationApi;
};

type SystemFeedbackService = {
  success: (message?: string, timeoutShow?: number, timeoutHide?: number) => void;
  warning: (message?: string, timeoutShow?: number, timeoutHide?: number) => void;
};

type UseTwoStepVerificationOptions = {
  /**
   * Invoked after a challenge is successfully redeemed. Defaults to reloading
   * the page (matching the Angular list/accept flow). Callers that need to
   * preserve in-memory state (e.g. the trade builder draft) should pass a
   * callback that resumes the original action instead.
   */
  onVerificationSuccess?: () => void;
  /**
   * Invoked when the user abandons the challenge modal. Defaults to reloading
   * the page. Pass a no-op (or custom handler) to keep the current view intact.
   */
  onChallengeAbandoned?: () => void;
};

/**
 * Encapsulates the 2SV trade-friction challenge lifecycle previously handled in
 * tradesListController. Requires a `#2sv-popup-container` element in the DOM.
 */
export const useTwoStepVerification = (
  systemFeedbackService: SystemFeedbackService,
  options: UseTwoStepVerificationOptions = {},
): { start: () => void } => {
  const { translate } = useTranslation();
  const challengeTokenRef = useRef<string>("");
  const failedAttemptsRef = useRef<number>(0);

  // Keep the latest callbacks in a ref so the challenge handlers (registered
  // once when the modal opens) always read the current values.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const reloadRoute = () => {
    window.location.reload();
  };

  const showErrorBanner = () => {
    systemFeedbackService.warning(translate("Response.VerificationError"), 100, 6000);
  };

  const receiveTwoStepChallengeToken = (tokenData: { verificationToken: string }) => {
    redeemVerificationChallenge(challengeTokenRef.current, tokenData.verificationToken)
      .then(success => {
        if (success) {
          systemFeedbackService.success(translate("Response.SuccessfulVerificationV2"), 100, 6000);
          (optionsRef.current.onVerificationSuccess ?? reloadRoute)();
        } else {
          showErrorBanner();
        }
      })
      .catch(showErrorBanner);
  };

  const renderChallenge = () => {
    generateChallenge()
      .then(challengeToken => {
        challengeTokenRef.current = challengeToken;
        TwoStepVerification.renderChallenge({
          containerId: "2sv-popup-container",
          userId: authenticatedUser()?.id!,
          challengeId: challengeToken,
          actionType: TwoStepVerification.ActionType.ItemTrade,
          renderInline: false,
          shouldShowRememberDeviceCheckbox: false,
          onChallengeCompleted: receiveTwoStepChallengeToken,
          onChallengeInvalidated: () => {
            if (failedAttemptsRef.current < MAX_RETRY_ATTEMPTS) {
              renderChallenge();
            }
            failedAttemptsRef.current += 1;
          },
          onModalChallengeAbandoned: () => {
            (optionsRef.current.onChallengeAbandoned ?? reloadRoute)();
          },
        });
      })
      .catch(showErrorBanner);
  };

  const start = () => {
    failedAttemptsRef.current = 0;
    renderChallenge();
  };

  return { start };
};

export default useTwoStepVerification;
