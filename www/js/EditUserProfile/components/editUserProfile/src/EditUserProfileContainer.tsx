import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { List } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { isBlackbirdUser } from "@rbx/core-scripts/meta/user";
import { useSystemFeedback } from "@rbx/core-ui";
import { useChangeDisplayNameModal } from "@rbx/user-settings";
import EditUserBioModal from "@rbx/profile-common/EditUserBioModal";
import {
  ProfileFrameAvatarOverlay,
  ProfileFrameDialog,
  ProfileFrameListItem,
  ProfileFramePlusUpsell,
  useProfileFrames,
  checkHasFrameDialogQueryParam,
  stripFrameDialogQueryParam,
  hasSeenProfileFrameNewBadge,
  markProfileFrameNewBadgeSeen,
  trackProfileFrameDialogOpened,
  trackProfileFrameFrameSaved,
  trackProfileFrameSaveError,
  NONE_FRAME,
  NONE_FRAME_ASSET_ID,
} from "@rbx/profile-frames";

import { ProfileAvatar } from "./components/ProfileAvatar";
import { ProfileSettingRow } from "./components/ProfileSettingRow";
import { EditProfileBackAffordance } from "./components/EditProfileBackAffordance";
import useAgedUpDisplayNames from "./hooks/useAgedUpDisplayNames";
import useUserProfileData from "./hooks/useUserProfileData";

export const EditUserProfileContainer = () => {
  const { translate } = useTranslation();
  const { SystemFeedbackComponent, systemFeedbackService } = useSystemFeedback();
  const hasAgedUpDisplayNames = useAgedUpDisplayNames();
  const { userId, displayName, username, description, refetchDescription, refetchDisplayName } =
    useUserProfileData();
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);

  // Frames are a Plus perk: non-Plus users get a preview-only dialog that upsells Plus
  // instead of saving. Blackbird membership is what "has Roblox Plus" means here.
  const hasPlus = isBlackbirdUser();
  const { frames, equippedFrame, equippedFrameId, isLoading, isSaving, saveFrame } =
    useProfileFrames();
  const [isFrameDialogOpen, setIsFrameDialogOpen] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  // "New" badge on the frame row: show until the user opens the dialog once (persisted
  // in localStorage).
  const [showFrameNewBadge, setShowFrameNewBadge] = useState(() => !hasSeenProfileFrameNewBadge());
  const isFrameDialogAutoOpenExecuted = useRef(false);

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
      trackProfileFrameFrameSaved({ userId, frameId: String(assetId), hasPlus });
      systemFeedbackService.success(translate("Response.Dialog.DefaultSuccessMessage"));
      return true;
    } catch (error) {
      trackProfileFrameSaveError(error);
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

  // Auto-open the chooser when the page is reached via `?frames`, once the frame list has
  // loaded. Runs once; the ref guards against the effect re-firing when its deps change.
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

  // The auto-open waits for the frame list to load. If the user opens another settings row
  // in that window, drop the pending open so the chooser can't land on top of the modal it
  // opens. Capture phase (onClickCapture on the settings container) runs before the click's
  // own handler; a click outside the container leaves the deeplink intact.
  const consumeFrameDeeplink = () => {
    if (isFrameDialogAutoOpenExecuted.current || !checkHasFrameDialogQueryParam()) {
      return;
    }
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
          <ProfileFrameAvatarOverlay className="width-2400 height-2400 radius-circle">
            <ProfileAvatar userId={userId} displayName={displayName} />
          </ProfileFrameAvatarOverlay>
        </div>

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
            <ProfileFrameListItem
              divider="None"
              equippedFrame={equippedFrameId === NONE_FRAME_ASSET_ID ? NONE_FRAME : equippedFrame}
              showNewBadge={showFrameNewBadge}
              onClick={onProfileFrameClick}
            />
          </List>
        </div>
      </div>

      <ProfileFrameDialog
        displayName={displayName}
        equippedFrameId={equippedFrameId}
        frames={frames}
        hasPlus={hasPlus}
        isSaving={isSaving}
        open={isFrameDialogOpen}
        userId={userId}
        onClose={() => {
          setIsFrameDialogOpen(false);
        }}
        onSave={onFrameSaved}
        onUpsellOpen={onUpsellOpen}
      />
      {!hasPlus && <ProfileFramePlusUpsell open={showUpsell} onBack={onUpsellClose} />}

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
    </div>
  );
};
