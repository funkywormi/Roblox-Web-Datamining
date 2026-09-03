import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { useSystemFeedback } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import type { ActionHookResult } from "../../types/actionHookTypes";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";

const useImpersonateUser = (): ActionHookResult => {
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();
  const { profileData } = useProfilePlatformContext();
  const profileId = profileData?.profileId;

  const mutation = useMutation({
    mutationFn: () =>
      http.post({
        url: `${environmentUrls.authApi}/v2/users/${profileId}/impersonate`,
        withCredentials: true,
      }),
    onSuccess: () => {
      window.location.href = getAbsoluteUrl(`/home`);
    },
    onError: () => {
      systemFeedbackService.warning(translate("Message.ImpersonateUserError"));
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

export default useImpersonateUser;
