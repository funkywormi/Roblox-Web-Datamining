import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { useSystemFeedback } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import type { ActionHookResult } from "../../types/actionHookTypes";
import { redirectToSignupWithProfileReturn } from "../../utils/profileUtils";

const useFollow = (): ActionHookResult => {
  const { profileData, refreshProfilePlatform } = useProfilePlatformContext();
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();
  const profileId = profileData?.profileId;

  const mutation = useMutation({
    mutationFn: () =>
      http.post({
        url: `${environmentUrls.friendsApi}/v1/users/${profileId}/follow`,
        withCredentials: true,
      }),
    onSuccess: () => {
      refreshProfilePlatform().catch(() => undefined);
    },
    onError: (error: unknown) => {
      systemFeedbackService.warning(translate("Message.FollowError"));
      console.error(
        "Failed to follow user:",
        error instanceof Error ? error.message : String(error),
      );
    },
  });

  const handler = useCallback(() => {
    if (!profileId) {
      systemFeedbackService.warning(translate("Message.UserDoesNotExist"));
      return;
    }
    if (!authenticatedUser()?.id) {
      redirectToSignupWithProfileReturn(profileId);
      return;
    }
    mutation.mutate();
  }, [profileId, systemFeedbackService, translate, mutation]);

  return { handler, isLoading: mutation.isPending };
};

export default useFollow;
