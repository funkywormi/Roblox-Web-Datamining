import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { List } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { isBlackbirdUser } from "@rbx/core-scripts/meta/user";
import { useSystemFeedback } from "@rbx/core-ui";
import { useChangeDisplayNameModal } from "@rbx/user-settings";
import EditUserBioModal from "@rbx/profile-common/EditUserBioModal";

import { ProfileAvatar } from "./components/ProfileAvatar";
import { ProfileSettingRow } from "./components/ProfileSettingRow";
import { ProfileFrameRow } from "./components/ProfileFrameRow";
import { ProfileFrameDialog } from "./components/ProfileFrameDialog";
import { ProfileFrameOverlay } from "./components/ProfileFrameOverlay";
import { EditProfileBackAffordance } from "./components/EditProfileBackAffordance";
import useAgedUpDisplayNames from "./hooks/useAgedUpDisplayNames";
import useUserProfileData from "./hooks/useUserProfileData";
import useProfileFrames from "./hooks/useProfileFrames";
import {
  checkHasFrameDialogQueryParam,
  hasSeenProfileFrameNewBadge,
  markProfileFrameNewBadgeSeen,
  stripFrameDialogQueryParam,
} from "./frames/profileFrameConfig";
import ProfileFramePlusUpsell from "./components/ProfileFramePlusUpsell";
import { NONE_FRAME, NONE_FRAME_ASSET_ID } from "./frames/profileFrameConstants";
import {
  trackProfileFrameDialogOpened,
  trackProfileFrameFrameSaved,
} from "./frames/profileFrameTelemetry";
import { trackError } from "./observability";

export const EditUserProfileContainer = () => {
  const { translate } = useTranslation();
  const { SystemFeedbackComponent, systemFeedbackService } = useSystemFeedback();
  const hasAgedUpDisplayNames = useAgedUpDisplayNames();
  const { userId, displayName, username, description, refetchDescription, refetchDisplayName } =
    useUserProfileData();
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isFrameDialogOpen, setIsFrameDialogOpen] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  // "New" badge on the frame row: show until the user opens the dialog once (persisted
  // in localStorage). Read lazily so SSR/first paint agree with the stored state.
  const [showFrameNewBadge, setShowFrameNewBadge] = useState(() => !hasSeenProfileFrameNewBadge());
  // Frames are a Plus perk: non-Plus users get a preview-only dialog that upsells
  // Plus instead of saving. Gate on Blackbird (Roblox Plus) membership specifically —
  // this matches every other Plus gate in the workspace.
  const hasPlus = isBlackbirdUser();
  const { frames, equippedFrame, equippedFrameId, isLoading, isSaving, saveFrame } =
    useProfileFrames();
  const [displayNameModal, displayNameModalService] = useChangeDisplayNameModal({
    showAgedUpDisplayName: hasAgedUpDisplayNames,
    translatedTitle: translate(
      hasAgedUpDisplayNames ? "Label.AgedUpConfigureDN" : "Label.ConfigureDN",
    ),
    translatedDescription: translate("Description.WarningFrequencyOfChanges"),
    translatedSaveButtonText: translate("Action.Save"),
    onSuccess: () => {
      refetchDisplayName().catch(() => undefined);
      systemFeedbackService.success(translate("Response.Dialog.DefaultSuccessMessage"));
    },
    translatedClearButtonAriaLabel: translate("Label.Clear"),
  });

  const displayNameLabel = translate(
    hasAgedUpDisplayNames ? "Label.AgedUpDisplayNameV2" : "Label.DisplayNameSettingV2",
  );

  const bioValue = useMemo(() => {
    if (description === undefined) {
      return undefined;
    }
    if (!description) {
      return translate("Label.NoBio");
    }
    return description;
  }, [description, translate]);

  const onBioUpdated = () => {
    refetchDescription().catch(() => undefined);
    systemFeedbackService.success(translate("Description.AboutSuccess"));
  };

  const onFrameSaved = async (assetId: number): Promise<boolean> => {
    try {
      await saveFrame(assetId);
      trackProfileFrameFrameSaved({
        userId,
        frameId: String(assetId),
        hasPlus,
      });
      systemFeedbackService.success(translate("Response.Dialog.DefaultSuccessMessage"));
      return true;
    } catch {
      trackError("Frames_SaveFailed");
      systemFeedbackService.warning(translate("Response.Dialog.DefaultErrorMessage"));
      return false;
    }
  };

  const onProfileFrameClick = useCallback(() => {
    setIsFrameDialogOpen(true);
    trackProfileFrameDialogOpened({
      userId,
      frameId: String(equippedFrameId ?? NONE_FRAME_ASSET_ID),
      hasPlus,
    });
    if (showFrameNewBadge) {
      markProfileFrameNewBadgeSeen();
      setShowFrameNewBadge(false);
    }
  }, [showFrameNewBadge, userId, equippedFrameId, hasPlus]);

  const onUpsellOpen = () => {
    setShowUpsell(true);
    setIsFrameDialogOpen(false);
  };

  const onUpsellClose = () => {
    setShowUpsell(false);
    setIsFrameDialogOpen(true);
  };

  const isFrameDialogAutoOpenExecuted = useRef(false);

  useEffect(() => {
    if (
      !checkHasFrameDialogQueryParam() ||
      isFrameDialogAutoOpenExecuted.current ||
      isLoading ||
      frames.length === 0
    ) {
      return;
    }
    stripFrameDialogQueryParam();
    isFrameDialogAutoOpenExecuted.current = true;
    onProfileFrameClick();
  }, [isLoading, frames.length, onProfileFrameClick]);

  const consumeFrameDeeplink = () => {
    stripFrameDialogQueryParam();
    isFrameDialogAutoOpenExecuted.current = true;
  };

  return (
    <div className="min-height-full bg-surface-sunken-0 padding-xlarge">
      <SystemFeedbackComponent />
      <div className="max-width-[970px] margin-x-auto">
        {/* Back Affordance */}
        <EditProfileBackAffordance />
        {/* Avatar Section */}
        <div className="flex justify-center padding-bottom-xlarge">
          <ProfileFrameOverlay
            frameAssetId={equippedFrameId}
            className="width-2400 height-2400 radius-circle"
          >
            <ProfileAvatar userId={userId} displayName={displayName} />
          </ProfileFrameOverlay>
        </div>

        {/* Settings list(s). Per the latest Figma the profile frame lives in its own
            grouped card, separated from the identity rows. */}
        <div className="flex flex-col gap-medium" onClickCapture={consumeFrameDeeplink}>
          <List className="width-full bg-shift-100 flex flex-col radius-large clip">
            <ProfileSettingRow
              label={displayNameLabel}
              value={displayName}
              onClick={() => {
                displayNameModalService.open();
              }}
            />
            <ProfileSettingRow
              label={translate("Label.UsernameV2")}
              value={username ? `@${username}` : ""}
              onClick={() => {
                window.location.href = "/my/account#!/info?changeusername";
              }}
            />
            <ProfileSettingRow
              label={translate("Label.About")}
              value={bioValue}
              onClick={() => {
                setIsBioModalOpen(true);
              }}
            />
            <ProfileSettingRow
              label={translate("Action.EditAvatar")}
              onClick={() => {
                window.location.href = "/my/avatar";
              }}
              divider="None"
            />
          </List>
          <List className="width-full bg-shift-100 flex flex-col radius-large clip">
            <ProfileFrameRow
              equippedFrame={equippedFrameId === 0 ? NONE_FRAME : equippedFrame}
              showNewBadge={showFrameNewBadge}
              onClick={onProfileFrameClick}
              divider="None"
            />
          </List>
        </div>
      </div>
      {displayNameModal}
      {isBioModalOpen && (
        <EditUserBioModal
          open={isBioModalOpen}
          onClose={() => {
            setIsBioModalOpen(false);
          }}
          onBioUpdated={onBioUpdated}
          initialBio={description}
        />
      )}
      <ProfileFrameDialog
        open={isFrameDialogOpen}
        onClose={() => {
          setIsFrameDialogOpen(false);
        }}
        userId={userId}
        displayName={displayName}
        frames={frames}
        equippedFrameId={equippedFrameId}
        isSaving={isSaving}
        onSave={onFrameSaved}
        hasPlus={hasPlus}
        onUpsellOpen={onUpsellOpen}
      />
      {!hasPlus && <ProfileFramePlusUpsell open={showUpsell} onBack={onUpsellClose} />}
    </div>
  );
};
