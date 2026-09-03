import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Dialog, DialogBody, DialogContent, DialogTitle } from "@rbx/foundation-ui";
import * as http from "@rbx/core-scripts/http";
import { Component as ProfileComponent } from "@rbx/profile-platform";
import environmentUrls from "@rbx/environment-urls";
import { useSystemFeedback } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import type { ActionHookResult } from "../../types/actionHookTypes";
import useProfileJsonComponent from "../useProfileJsonComponent";

const useUnblock = (): ActionHookResult => {
  const { profileData, refreshProfilePlatform } = useProfilePlatformContext();
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();
  const userProfileHeaderData = useProfileJsonComponent(ProfileComponent.UserProfileHeader);
  const primaryName = userProfileHeaderData?.names.primaryName ?? "";
  const profileId = profileData?.profileId;
  const [isUnblockConfirmDialogOpen, setIsUnblockConfirmDialogOpen] = useState(false);

  const unblockMutation = useMutation({
    mutationFn: () =>
      http.post({
        url: `${environmentUrls.apiGatewayUrl}/user-blocking-api/v1/users/${profileId}/unblock-user`,
        withCredentials: true,
      }),
    onSuccess: () => {
      refreshProfilePlatform().catch(() => undefined);
      setIsUnblockConfirmDialogOpen(false);
    },
    onError: (error: unknown) => {
      const PARENT_MANAGED_ERROR_CODE = 14;
      const isParentManaged =
        error != null &&
        typeof error === "object" &&
        "data" in error &&
        error.data === PARENT_MANAGED_ERROR_CODE;
      if (isParentManaged) {
        systemFeedbackService.warning(translate("Error.ParentalControlUnblockError"));
      } else {
        systemFeedbackService.warning(translate("Message.BlockRequestError"));
      }
      setIsUnblockConfirmDialogOpen(false);
    },
  });

  const handler = useCallback(() => {
    setIsUnblockConfirmDialogOpen(true);
  }, []);

  const handleConfirmUnblock = useCallback(() => {
    if (!profileId) {
      systemFeedbackService.warning(translate("Message.UserDoesNotExist"));
      return;
    }
    unblockMutation.mutate();
  }, [profileId, systemFeedbackService, translate, unblockMutation]);

  const handleCancelUnblock = useCallback(() => {
    setIsUnblockConfirmDialogOpen(false);
  }, []);

  const Component = () => (
    <Dialog
      open={isUnblockConfirmDialogOpen}
      onOpenChange={handleCancelUnblock}
      size="Medium"
      type="Default"
      hasCloseAffordance
      closeLabel={translate("Action.Close")}
      isModal
      hasMarginTop
      hasMarginBottom
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-medium">
          <DialogTitle className="text-header-small padding-none">
            {translate("Heading.UnblockUser", {
              DisplayName: primaryName,
              displayName: primaryName,
            })}
          </DialogTitle>
          <p>{translate("Message.UnblockConfirmation")}</p>
          <div className="flex gap-medium justify-end">
            <Button variant="Standard" size="Medium" onClick={handleCancelUnblock}>
              {translate("Action.Cancel")}
            </Button>
            <Button variant="Emphasis" size="Medium" onClick={handleConfirmUnblock}>
              {translate("Action.Unblock")}
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );

  return {
    handler,
    Component,
    isLoading: unblockMutation.isPending,
  };
};

export default useUnblock;
