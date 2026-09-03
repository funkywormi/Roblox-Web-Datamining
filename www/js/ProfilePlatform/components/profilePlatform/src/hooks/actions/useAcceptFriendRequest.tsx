import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { post } from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { useSystemFeedback } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import type { ActionHookResult } from "../../types/actionHookTypes";

const useAcceptFriendRequest = (): ActionHookResult => {
  const { profileData, refreshProfilePlatform } = useProfilePlatformContext();
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();
  const profileId = profileData?.profileId;

  const mutation = useMutation({
    mutationFn: () =>
      post(
        {
          url: `${environmentUrls.friendsApi}/v1/users/${profileId}/accept-friend-request`,
          retryable: true,
          withCredentials: true,
        },
        {},
      ),
    onSuccess: () => {
      refreshProfilePlatform().catch(() => undefined);
    },
    onError: () => {
      systemFeedbackService.warning(translate("Message.AcceptFriendRequestError"));
    },
  });

  const handler = useCallback(() => {
    if (!profileId) {
      systemFeedbackService.warning(translate("Message.UserDoesNotExist"));
      return;
    }
    mutation.mutate();
  }, [profileId, systemFeedbackService, translate, mutation]);

  return { handler, isLoading: mutation.isPending };
};

export default useAcceptFriendRequest;
