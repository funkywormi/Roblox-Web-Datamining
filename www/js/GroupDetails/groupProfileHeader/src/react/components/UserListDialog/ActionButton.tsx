import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@rbx/foundation-ui';
import { Action, TypedAction, Component, ProfileType } from '../../../types';
import {
  sendFriendRequest as sendFriendRequestApi,
  acceptFriendRequest as acceptFriendRequestApi,
  unfriend as unfriendApi,
  fetchProfilePlatform
} from '../../../networking';

const { useTranslation } = (window as any).ReactUtilities;
const { useSystemFeedback } = (window as any).ReactStyleGuide;

const getChatService = () => (window as any).CoreRobloxUtilities?.chatService;
const getGameLauncher = () => (window as any).Roblox?.GameLauncher;
const getProtocolHandler = () => (window as any).Roblox?.ProtocolHandlerClientInterface;
const getDeviceMeta = () => (window as any).HeaderScripts?.deviceMeta?.getDeviceMeta?.();
const getEnvironmentUrls = () => (window as any).Roblox?.EnvironmentUrls;
const getHttpService = () => (window as any).CoreUtilities?.httpService;
const getAuthenticatedUserId = () => (window as any).HeaderScripts?.authenticatedUser?.id;

interface ActionButtonProps {
  userId: number;
  primaryAction?: TypedAction;
  onCloseModal?: () => void;
  onActionComplete?: (newAction?: Action) => void;
  onCtaAction?: (action: Action, userId: number) => void;
}

type ButtonVariant = 'Emphasis' | 'Standard';

interface ActionConfig {
  text: string;
  handler: () => void | Promise<void>;
  variant: ButtonVariant;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  userId,
  primaryAction,
  onCloseModal,
  onActionComplete,
  onCtaAction
}) => {
  const { translate } = useTranslation();
  const { systemFeedbackService } = useSystemFeedback();
  const isPhone = getDeviceMeta()?.isPhone ?? false;
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<Action | undefined>(primaryAction?.type);

  // Refetch the user's action from the API and update state
  const refetchUserAction = useCallback(async () => {
    try {
      const response = await fetchProfilePlatform({
        profileType: ProfileType.User,
        profileId: userId.toString(),
        components: [
          {
            component: Component.Actions,
            excludeContextualActions: true
          }
        ]
      });
      const newAction = response.components.Actions?.buttons?.[0]?.type;
      if (newAction) {
        setCurrentAction(newAction);
        onActionComplete?.(newAction);
      }
    } catch {
      // If refetch fails, keep the current state
    }
  }, [userId, onActionComplete]);

  // Handler: Send friend request
  const handleAddFriend = useCallback(async () => {
    // If not authenticated, redirect to signup
    if (!getAuthenticatedUserId()) {
      const profileUrl = `${window.location.origin}/users/${userId}/profile`;
      const encodedReturnUrl = encodeURIComponent(profileUrl);
      window.location.href = `/account/signupredir?returnUrl=${encodedReturnUrl}`;
      return;
    }

    try {
      setIsLoading(true);
      const response = await sendFriendRequestApi(userId);
      if (response.success === true) {
        await refetchUserAction();
      } else {
        systemFeedbackService?.warning(translate('Message.SendConnectionRequestError'));
      }
    } catch {
      systemFeedbackService?.warning(translate('Message.SendConnectionRequestError'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, refetchUserAction, systemFeedbackService, translate]);

  // Handler: Accept friend request
  const handleAcceptFriendRequest = useCallback(async () => {
    try {
      setIsLoading(true);
      await acceptFriendRequestApi(userId);
      await refetchUserAction();
    } catch {
      systemFeedbackService?.warning(translate('Message.AcceptFriendRequestError'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, refetchUserAction, systemFeedbackService, translate]);

  // Handler: Remove friend
  const handleUnfriend = useCallback(async () => {
    try {
      setIsLoading(true);
      await unfriendApi(userId);
      await refetchUserAction();
    } catch {
      systemFeedbackService?.warning(translate('Message.RemoveFriendError'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, refetchUserAction, systemFeedbackService, translate]);

  // Handler: Start chat
  const handleChat = useCallback(() => {
    const chatService = getChatService();
    if (chatService) {
      // Call chat service immediately
      chatService.startDesktopAndMobileWebChat({ userId });
      // Sometimes chat doesn't work on first try, so we try again after a delay
      setTimeout(() => {
        chatService.startDesktopAndMobileWebChat({ userId });
      }, 1000);
      // Close modal after chat is initiated
      onCloseModal?.();
    } else {
      systemFeedbackService?.warning(translate('Error.FailedToStartChat'));
    }
  }, [userId, onCloseModal, systemFeedbackService, translate]);

  // Handler: Join experience
  const handleJoinExperience = useCallback(async () => {
    // Close the UserListDialog FIRST to release its focus trap before the Roblox modal opens
    onCloseModal?.();

    const deviceMeta = getDeviceMeta();
    const gameLauncher = getGameLauncher();
    const protocolHandler = getProtocolHandler();
    const joinAttemptId = '';

    if (deviceMeta?.isInApp) {
      if (deviceMeta.isDesktop && gameLauncher) {
        gameLauncher.followPlayerIntoGame(userId, joinAttemptId, 'JoinUser');
      } else {
        window.location.href = `/games/start?userID=${userId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser`;
      }
    } else if (deviceMeta?.isAndroidDevice || deviceMeta?.isChromeOs) {
      window.location.href = `intent://userId=${userId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser#Intent;scheme=robloxmobile;package=com.roblox.client;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.roblox.client;end`;
    } else if (deviceMeta?.isIosDevice) {
      window.location.href = `robloxmobile://userId=${userId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser`;
    } else if (protocolHandler?.followPlayerIntoGame) {
      try {
        await protocolHandler.followPlayerIntoGame({
          userId,
          joinAttemptId,
          joinAttemptOrigin: 'JoinUser'
        });
      } catch {
        systemFeedbackService?.warning(translate('Error.FailedToJoinExperience'));
      }
    } else {
      // Fallback to games start page
      window.location.href = `/games/start?userID=${userId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser`;
    }
  }, [userId, onCloseModal, systemFeedbackService, translate]);

  // Handler: Pending friend request (noop - button is always disabled)
  const handlePendingFriendRequest = useCallback(() => {
    // Intentionally a noop - the pending button should always be disabled
  }, []);

  // Handler: Unblock user
  const handleUnblock = useCallback(async () => {
    const environmentUrls = getEnvironmentUrls();
    const httpService = getHttpService();
    if (!environmentUrls || !httpService) {
      systemFeedbackService?.warning(translate('Message.BlockRequestError'));
      return;
    }

    try {
      setIsLoading(true);
      await httpService.post({
        url: `${environmentUrls.apiGatewayUrl}/user-blocking-api/v1/users/${userId}/unblock-user`,
        withCredentials: true
      });
      await refetchUserAction();
    } catch {
      systemFeedbackService?.warning(translate('Message.BlockRequestError'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, refetchUserAction, systemFeedbackService, translate]);

  // Action configuration mapping
  const actionConfig: Partial<Record<Action, ActionConfig>> = useMemo(
    () => ({
      [Action.AddFriend]: {
        text: translate('Action.AddConnection'),
        handler: handleAddFriend,
        variant: 'Emphasis'
      },
      [Action.AcceptFriendRequest]: {
        text: translate('Action.AcceptRequest'),
        handler: handleAcceptFriendRequest,
        variant: 'Emphasis'
      },
      [Action.PendingFriendRequest]: {
        text: translate('Action.Pending'),
        handler: handlePendingFriendRequest,
        variant: 'Standard'
      },
      [Action.Chat]: {
        text: translate('Action.Chat'),
        handler: handleChat,
        variant: 'Standard'
      },
      [Action.Unfriend]: {
        text: translate('Action.RemoveConnection'),
        handler: handleUnfriend,
        variant: 'Standard'
      },
      [Action.JoinExperience]: {
        text: translate('Action.JoinExperience'),
        handler: handleJoinExperience,
        variant: 'Emphasis'
      },
      [Action.CannotAddFriend]: {
        text: translate('Action.AddConnection'),
        handler: handlePendingFriendRequest, // noop
        variant: 'Standard'
      },
      [Action.Unblock]: {
        text: translate('Action.Unblock'),
        handler: handleUnblock,
        variant: 'Standard'
      }
    }),
    [
      translate,
      handleAddFriend,
      handleAcceptFriendRequest,
      handlePendingFriendRequest,
      handleChat,
      handleUnfriend,
      handleJoinExperience,
      handleUnblock
    ]
  );

  if (!primaryAction) {
    return null;
  }

  const actionType = currentAction ?? primaryAction.type;
  const config = actionConfig[actionType];

  if (!config) {
    return null;
  }

  const isDisabled =
    primaryAction.disabledReason !== undefined ||
    actionType === Action.CannotAddFriend ||
    actionType === Action.PendingFriendRequest ||
    isLoading;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCtaAction?.(actionType, userId);
    await config.handler();
  };

  return (
    <Button
      id={`action-button-${actionType}`}
      className="shrink-0 margin-right-medium"
      size={isPhone ? 'Small' : 'Medium'}
      variant={config.variant}
      isDisabled={isDisabled}
      onClick={handleClick}
    >
      {config.text}
    </Button>
  );
};

export default ActionButton;
