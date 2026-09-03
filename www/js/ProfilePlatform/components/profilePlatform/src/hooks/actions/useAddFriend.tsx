import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { post } from "@rbx/core-scripts/http";
import { getQueryParam } from "@rbx/core-scripts/util/url";
import environmentUrls from "@rbx/environment-urls";
import { useSystemFeedback } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import type { ActionHookResult } from "../../types/actionHookTypes";
import { redirectToSignupWithProfileReturn } from "../../utils/profileUtils";

const useAddFriend = (): ActionHookResult => {
  const { profileData, refreshProfilePlatform } = useProfilePlatformContext();
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();
  const profileId = profileData?.profileId;

  const mutation = useMutation({
    mutationFn: () => {
      const friendshipOriginSourceTypeParam =
        getQueryParam("friendshipSourceType")?.toString() ?? "";

      return post(
        {
          url: `${environmentUrls.friendsApi}/v1/users/${profileId}/request-friendship`,
          retryable: true,
          withCredentials: true,
        },
        {
          friendshipOriginSourceType: friendshipOriginSourceTypeParam || "UserProfile",
        },
      );
    },
    onSuccess: () => {
      refreshProfilePlatform().catch(() => undefined);
    },
    onError: () => {
      systemFeedbackService.warning(translate("Message.SendConnectionRequestError"));
    },
  });

  const handler = useCallback(() => {
    if (!authenticatedUser()?.id) {
      if (profileId) {
        redirectToSignupWithProfileReturn(profileId);
      }
      return;
    }
    if (!profileId) {
      systemFeedbackService.warning(translate("Message.UserDoesNotExist"));
      return;
    }
    mutation.mutate();
  }, [profileId, systemFeedbackService, translate, mutation]);

  return { handler, isLoading: mutation.isPending };
};

export default useAddFriend;
