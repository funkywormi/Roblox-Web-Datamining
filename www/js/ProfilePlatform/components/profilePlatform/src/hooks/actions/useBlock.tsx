import React, { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Dialog, DialogBody, DialogContent, DialogTitle } from "@rbx/foundation-ui";
import * as http from "@rbx/core-scripts/http";
import { Component as ProfileComponent } from "@rbx/profile-platform";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useTranslation } from "@rbx/core-scripts/react";
import { AbuseReportDialog } from "@rbx/abuse-report-ui";
import environmentUrls from "@rbx/environment-urls";
import { useSystemFeedback } from "@rbx/core-ui";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import type { ActionHookResult } from "../../types/actionHookTypes";
import { redirectToSignupWithProfileReturn } from "../../utils/profileUtils";
import useProfileJsonComponent from "../useProfileJsonComponent";

const useBlock = (): ActionHookResult => {
  const { profileData, refreshProfilePlatform } = useProfilePlatformContext();
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();
  const userProfileHeaderData = useProfileJsonComponent(ProfileComponent.UserProfileHeader);
  const profileId = profileData?.profileId;
  const authenticatedUserId = authenticatedUser()?.id;
  const primaryName = userProfileHeaderData?.names.primaryName ?? "";
  const [isBlockConfirmDialogOpen, setIsBlockConfirmDialogOpen] = useState(false);
  const [showAbuseReportDialog, setShowAbuseReportDialog] = useState(false);

  const blockMutation = useMutation({
    mutationFn: () =>
      http.post({
        url: `${environmentUrls.apiGatewayUrl}/user-blocking-api/v1/users/${profileId}/block-user`,
        withCredentials: true,
      }),
    onError: (error: unknown) => {
      systemFeedbackService.warning(translate("Error.BlockUserFailure"));
      console.error(
        "Failed to block user:",
        error instanceof Error ? error.message : String(error),
      );
    },
  });

  const handler = useCallback(() => {
    if (!authenticatedUserId) {
      if (profileId) {
        redirectToSignupWithProfileReturn(profileId);
      }
      return;
    }
    setIsBlockConfirmDialogOpen(true);
  }, [authenticatedUserId, profileId]);

  const handleConfirmBlock = useCallback(() => {
    if (!profileId) {
      systemFeedbackService.warning(translate("Message.UserDoesNotExist"));
      return;
    }
    blockMutation
      .mutateAsync()
      .then(() => {
        refreshProfilePlatform().catch(() => undefined);
      })
      .catch(() => undefined)
      .finally(() => {
        setIsBlockConfirmDialogOpen(false);
      });
  }, [profileId, systemFeedbackService, translate, blockMutation, refreshProfilePlatform]);

  const handleBlockAndReport = useCallback(() => {
    if (!profileId) {
      systemFeedbackService.warning(translate("Message.UserDoesNotExist"));
      return;
    }
    blockMutation
      .mutateAsync()
      .then(() => {
        refreshProfilePlatform().catch(() => undefined);
        setShowAbuseReportDialog(true);
      })
      .catch(() => undefined)
      .finally(() => {
        setIsBlockConfirmDialogOpen(false);
      });
  }, [profileId, systemFeedbackService, translate, blockMutation, refreshProfilePlatform]);

  const handleCancelBlock = useCallback(() => {
    setIsBlockConfirmDialogOpen(false);
  }, []);

  const Component = () => (
    <React.Fragment>
      <Dialog
        open={isBlockConfirmDialogOpen}
        onOpenChange={handleCancelBlock}
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
              {translate("Heading.BlockUser", {
                displayName: primaryName,
                DisplayName: primaryName,
              })}
            </DialogTitle>
            <p
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: translate("Message.BlockConfirmation.FriendsRename"),
              }}
            />
            <div className="flex gap-medium justify-end">
              <Button variant="Alert" size="Medium" onClick={handleConfirmBlock}>
                {translate("Action.Block")}
              </Button>
              <Button variant="Alert" size="Medium" onClick={handleBlockAndReport}>
                {translate("Action.BlockAndReport")}
              </Button>
              <Button variant="Standard" size="Medium" onClick={handleCancelBlock}>
                {translate("Action.Cancel")}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {profileId && (
        <AbuseReportDialog
          abuseVector="user_profile"
          targetIdStr={profileId}
          open={showAbuseReportDialog}
          onClose={() => {
            setShowAbuseReportDialog(false);
            // Reporter might have blocked the user during the reporting flow.
            refreshProfilePlatform().catch((error: unknown) => {
              console.error(error);
            });
          }}
        />
      )}
    </React.Fragment>
  );

  return {
    handler,
    Component,
    isLoading: blockMutation.isPending,
  };
};

export default useBlock;
