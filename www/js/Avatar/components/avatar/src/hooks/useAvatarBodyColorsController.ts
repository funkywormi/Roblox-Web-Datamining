import React, { useEffect, useState } from "react";
import { reportAXError } from "../utils/axAnalyticsService";

import { BodyColorsStateV2 } from "../types";
import { useSystemFeedback } from "../contexts/SystemFeedbackContext";
import { DEFAULT_AVATAR_BODY_COLORS_V2 } from "../utils/avatarBodyColors.constants";
import avatarConstants from "../constants/avatarConstants";
import AvatarAPIService from "../services/avatarAPIService";
import parseError from "../utils/parseErrorUtil";
import { isAvatarEditingDisabledError } from "../utils/avatarEditingError.utils";
import { trackAvatarEdit, AvatarEditorTrackingEvents } from "../utils/axTracking";

const useAvatarBodyColorsController = (): {
  bodyColors: BodyColorsStateV2;
  setBodyColors: React.Dispatch<React.SetStateAction<BodyColorsStateV2>>;
  setShouldUpdateAvatarBodyColors: React.Dispatch<React.SetStateAction<boolean>>;
} => {
  const [bodyColors, setBodyColors] = useState<BodyColorsStateV2>(DEFAULT_AVATAR_BODY_COLORS_V2);
  const [shouldUpdateAvatarBodyColors, setShouldUpdateAvatarBodyColors] = useState<boolean>(false);

  const systemFeedback = useSystemFeedback();

  // Persist updated body colors to the backend via avatarService
  useEffect(() => {
    if (!shouldUpdateAvatarBodyColors) {
      return;
    }

    trackAvatarEdit(AvatarEditorTrackingEvents.BodyColorChange);

    AvatarAPIService.setBodyColors(bodyColors)
      .then(() => {
        setShouldUpdateAvatarBodyColors(false);
      })
      .catch((e: unknown) => {
        reportAXError({
          itemName: "UpdateBodyColorsError",
          counterName: "AvatarEditorError",
          log: parseError(e),
        });

        if (isAvatarEditingDisabledError(e)) {
          systemFeedback.info(avatarConstants.page.avatarEditingDisabled);
        } else {
          systemFeedback.error(avatarConstants.bodyColors.failedToUpdate);
        }
      });
  }, [bodyColors, systemFeedback, shouldUpdateAvatarBodyColors]);

  return {
    bodyColors,
    setBodyColors,
    setShouldUpdateAvatarBodyColors,
  };
};

export default useAvatarBodyColorsController;
