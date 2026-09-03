import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { useSystemFeedback } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import type { ActionHookResult } from "../../types/actionHookTypes";

const useUnfriend = (): ActionHookResult => {
  const { profileData, refreshProfilePlatform } = useProfilePlatformContext();
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();
  const profileId = profileData?.profileId;

  const mutation = useMutation({
    mutationFn: () =>
      http.post({
        url: `${environmentUrls.friendsApi}/v1/users/${profileId}/unfriend`,
        withCredentials: true,
      }),
    onSuccess: () => {
      refreshProfilePlatform().catch(() => undefined);
    },
    onError: (error: unknown) => {
      console.error(
        "Failed to unfriend user:",
        error instanceof Error ? error.message : String(error),
      );
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

export default useUnfriend;
