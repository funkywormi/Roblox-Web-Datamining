import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { post } from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { useSystemFeedback } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import type { ActionHookResult } from "../../types/actionHookTypes";

const useRemoveTrustedFriendRequest = (): ActionHookResult => {
  const { profileData, refreshProfilePlatform } = useProfilePlatformContext();
  const profileId = profileData?.profileId;
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();

  const mutation = useMutation({
    mutationFn: () => {
      return post(
        {
          url: `${environmentUrls.friendsApi}/v1/users/${profileId}/remove-trusted-friend`,
          withCredentials: true,
        },
        {},
      );
    },
    onSuccess: () => {
      refreshProfilePlatform().catch(() => undefined);
      systemFeedbackService.success(translate("TrustedFriend.Toast.TrustedFriendRemoved"));
    },
    onError: () => {
      systemFeedbackService.warning("error occurred");
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

export default useRemoveTrustedFriendRequest;
