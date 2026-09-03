import { useCallback } from "react";
import { Action } from "@rbx/profile-platform";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import type { ActionHandler } from "../../types/actionHookTypes";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";

export const useActionHandlers = () => {
  const { profileId, profileType } = useProfilePlatformContext();

  const toHandlerWithAnalytics = useCallback(
    (
      action: Action,
      btnContext: "Buttons" | "ContextualMenu",
      btnSortPosition: number,
      handler?: ActionHandler,
    ): (() => void) => {
      return () => {
        sendEventWithTarget(
          "buttonClick",
          "profilePlatform",
          {
            profile_type: profileType,
            profile_id: profileId,
            btn: `Action_${action}`,
            btn_context: btnContext,
            btn_sort_position: btnSortPosition,
          },
          targetTypes.WWW,
        );
        if (handler) {
          Promise.resolve(handler()).catch(() => undefined);
        }
      };
    },
    [profileId, profileType],
  );

  const sendContextualMenuClickEvent = useCallback(() => {
    sendEventWithTarget(
      "buttonClick",
      "profilePlatform",
      { profile_type: profileType, profile_id: profileId, btn: "contextualMenu" },
      targetTypes.WWW,
    );
  }, [profileId, profileType]);

  return { toHandlerWithAnalytics, sendContextualMenuClickEvent };
};
