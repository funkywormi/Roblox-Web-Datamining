import type { Dispatch, SetStateAction } from "react";
import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AccessManagementUpsellV2Service } from "Roblox";
import { UserProfileField, useUserProfiles } from "@rbx/user-profile-api-client";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  TrustedFriendPrimaryHandler,
  triggerTrustedFriendVPCRecourseAmpFeatureName,
  connectionGraphCoreAmpNamespace,
  trustedFriendActionButtonConfig,
  trustedFriendsTranslationKeys,
  isMappedTrustedFriendAction,
  type TrustedFriendActionButtons,
  type TrustedFriendActionEnum,
  type TrustedFriendPrimaryHandlerEnum,
} from "../constants/trustedFriendsModal";
import {
  trustedFriendActionQueryKey,
  trustedFriendStatusQueryKey,
} from "../constants/trustedFriendQueryKeys";
import {
  acceptTrustedFriendRequest,
  addTrustedFriendFromLink,
  createTrustedFriendLink,
  sendTrustedFriendRequest,
  validateTrustedFriendLink,
} from "../services/trustedFriends";
import { copyTextFromPromise } from "../utils/copyTextFromPromise";

function getTrustedFriendActionButtons(
  action: TrustedFriendActionEnum | undefined,
): (TrustedFriendActionButtons & { handler: TrustedFriendPrimaryHandlerEnum }) | undefined {
  if (!action || !isMappedTrustedFriendAction(action)) {
    return undefined;
  }
  const config = trustedFriendActionButtonConfig[action];
  return {
    primary: config.primary,
    secondary: config.secondary,
    handler: config.handler,
  };
}

async function startTrustedFriendVpcUpsell(targetUserId: number): Promise<void> {
  try {
    await AccessManagementUpsellV2Service.startAccessManagementUpsell({
      featureName: triggerTrustedFriendVPCRecourseAmpFeatureName,
      ampFeatureCheckData: [{ name: "targetUser", type: "UserId", value: String(targetUserId) }],
      isAsyncCall: false,
      usePrologue: true,
      namespace: connectionGraphCoreAmpNamespace,
      ampRecourseData: {
        targetUserId: targetUserId,
      },
    });
  } catch {
    throw new Error("Failed to start trusted friend VPC upsell");
  }
}

export type UseGetTrustedFriendsModalButtonsParams = {
  userId: number;
  linkTokens?: number[];
  trustedFriendAction?: TrustedFriendActionEnum;
  onClose: (isSuccess: boolean) => void;
  onComplete?: () => Promise<void>;
  setToastMessage: Dispatch<SetStateAction<string | null>>;
};

export function useGetTrustedFriendsModalButtons({
  userId,
  linkTokens,
  trustedFriendAction,
  onClose,
  setToastMessage,
  onComplete,
}: UseGetTrustedFriendsModalButtonsParams): {
  buttonConfig:
    | (TrustedFriendActionButtons & { handler: TrustedFriendPrimaryHandlerEnum })
    | undefined;
  performPrimaryAction: () => Promise<void>;
} {
  const { translate } = useTranslation();
  const queryClient = useQueryClient();

  const profileFields = useMemo(
    () => [UserProfileField.Names.CombinedName, UserProfileField.Names.Username],
    [],
  );
  const { data: userProfiles } = useUserProfiles([userId], profileFields);
  const targetProfile = userProfiles?.[userId];

  const buttonConfig = useMemo(
    () => getTrustedFriendActionButtons(trustedFriendAction),
    [trustedFriendAction],
  );

  const performPrimaryAction = useCallback(async () => {
    if (!buttonConfig) {
      return;
    }

    const { handler } = buttonConfig;
    const userName = targetProfile?.names.username ?? "";

    const invalidateTrustedQueries = async (): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: trustedFriendStatusQueryKey(userId) });
      await queryClient.invalidateQueries({
        queryKey: trustedFriendActionQueryKey(userId, linkTokens),
      });
    };

    const addTrustedFriendViaLink = async (): Promise<void> => {
      if (!linkTokens?.length) {
        throw new Error(
          "useGetTrustedFriendsModalButtons: linkTokens required for link accept flow",
        );
      }
      await validateTrustedFriendLink(userId, linkTokens);
      await addTrustedFriendFromLink(userId, linkTokens);
    };

    const shareTrustedFriendLink = async (): Promise<void> => {
      await copyTextFromPromise(createTrustedFriendLink(userId).then(({ link }) => link));
      setToastMessage(translate(trustedFriendsTranslationKeys.trustedFriendLinkCopied));
      await invalidateTrustedQueries();
      await onComplete?.();
      onClose(true);
    };

    const onSendSuccess = async (): Promise<void> => {
      setToastMessage(translate(trustedFriendsTranslationKeys.trustedFriendRequestSent));
      await invalidateTrustedQueries();
      await onComplete?.();
      onClose(true);
    };

    const onAcceptSuccess = async (): Promise<void> => {
      setToastMessage(
        translate(trustedFriendsTranslationKeys.acceptedTrustedFriend, { username: userName }),
      );
      await invalidateTrustedQueries();
      await onComplete?.();
      onClose(true);
    };

    const runHandler = async (handlerType: TrustedFriendPrimaryHandlerEnum): Promise<void> => {
      switch (handlerType) {
        case TrustedFriendPrimaryHandler.trustedFriendsOk:
          await onComplete?.();
          onClose(true);
          break;
        case TrustedFriendPrimaryHandler.sendTrustedFriendRequest:
          await sendTrustedFriendRequest(userId);
          await onSendSuccess();
          break;
        case TrustedFriendPrimaryHandler.acceptTrustedFriend:
          await acceptTrustedFriendRequest(userId);
          await onAcceptSuccess();
          break;
        case TrustedFriendPrimaryHandler.acceptTrustedFriendViaLink:
          await addTrustedFriendViaLink();
          await onAcceptSuccess();
          break;
        case TrustedFriendPrimaryHandler.vpcUpsell:
          onClose(false);
          await startTrustedFriendVpcUpsell(userId);
          await onComplete?.();
          break;
        case TrustedFriendPrimaryHandler.vpcLinkRecipientUpsell:
          onClose(false);
          await addTrustedFriendViaLink();
          await startTrustedFriendVpcUpsell(userId);
          await onComplete?.();
          break;
        case TrustedFriendPrimaryHandler.addViaLinkEmpty:
          await shareTrustedFriendLink();
          break;
        case TrustedFriendPrimaryHandler.noop:
          break;
      }
    };

    try {
      setToastMessage(null);
      await runHandler(handler);
    } catch {
      setToastMessage(translate(trustedFriendsTranslationKeys.genericError));
    }
  }, [
    userId,
    linkTokens,
    translate,
    onClose,
    targetProfile,
    setToastMessage,
    queryClient,
    onComplete,
    buttonConfig,
  ]);

  return { buttonConfig, performPrimaryAction };
}
