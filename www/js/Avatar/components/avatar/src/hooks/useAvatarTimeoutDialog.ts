import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUniversalFeatureRestrictions } from "@rbx/universal-feature-restrictions";
import { useAvatarEditingAccessContext } from "../contexts/AvatarEditingAccessContext";
import AvatarAPIService from "../services/avatarAPIService";

const AVATAR_CHANGE_ABUSE_VECTOR = "avatar_change";
const APP_POLICY_QUERY_KEY = "avatar/appPolicyBehavior";

/**
 * No-op handler for appeals. The UFR component will automatically handle proper appeals analytics
 * and UI behavior but we need to supply a dummy handler to enable appeals since these shorter,
 * proactive interventions typically don't require appeals.
 */
const handleAvatarChangeAppeal = () => undefined;

const useAvatarTimeoutDialog = () => {
  const [isEditingBlockedDialogOpen, setIsEditingBlockedDialogOpen] = useState(false);
  const {
    isAvatarEditingBlocked,
    hasTimeoutAction,
    formattedBlockEndTime,
    isLoading: isAccessLoading,
    refetchAccess,
  } = useAvatarEditingAccessContext();
  const { showFeatureRestriction } = useUniversalFeatureRestrictions();
  const isTimedOut = !isAccessLoading && isAvatarEditingBlocked && hasTimeoutAction;

  // Acknowledging changes the server state, so refetch to check if we can unlock the page.
  const handleAcknowledgmentSuccess = useCallback(() => {
    refetchAccess().catch((): undefined => undefined);
  }, [refetchAccess]);

  const {
    data: isUfrTimeoutDialogFlagEnabled,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: [APP_POLICY_QUERY_KEY],
    queryFn: () => AvatarAPIService.getAppPolicyBehavior(),
    select: policy => policy?.EnableAvatarUfrTimeoutDialog === true,
    enabled: isTimedOut,
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    // A failed GUAC fetch keeps the legacy dialog.
    if (!isTimedOut || !(isSuccess || isError)) {
      return;
    }
    if (isUfrTimeoutDialogFlagEnabled) {
      showFeatureRestriction({
        abuseVector: AVATAR_CHANGE_ABUSE_VECTOR,
        onAppeal: handleAvatarChangeAppeal,
        onAcknowledgmentSuccess: handleAcknowledgmentSuccess,
      });
    } else if (formattedBlockEndTime) {
      setIsEditingBlockedDialogOpen(true);
    }
  }, [
    isTimedOut,
    isSuccess,
    isError,
    isUfrTimeoutDialogFlagEnabled,
    formattedBlockEndTime,
    showFeatureRestriction,
    handleAcknowledgmentSuccess,
  ]);

  const closeEditingBlockedDialog = useCallback(() => {
    setIsEditingBlockedDialogOpen(false);
  }, []);

  return { isEditingBlockedDialogOpen, closeEditingBlockedDialog, formattedBlockEndTime };
};

export default useAvatarTimeoutDialog;
