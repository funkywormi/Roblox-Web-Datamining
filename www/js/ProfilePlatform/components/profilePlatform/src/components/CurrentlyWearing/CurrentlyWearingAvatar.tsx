import { useState } from "react";
import { Button } from "@rbx/foundation-ui";
import localStorageService from "@rbx/core-scripts/local-storage";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { Thumbnail3d } from "@rbx/thumbnails3d";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import { avatarMode } from "../../constants/enums";
import { avatarModeKey, avatarThumbnailSize } from "../../constants/profileConstants";
import { redirectToSignupWithProfileReturn } from "../../utils/profileUtils";
import useAvatarBackgroundImageUrl from "../../hooks/useAvatarBackgroundImageUrl";
import { buildAssetDeliveryUrl } from "../../utils/avatarBackground";

// Theme-specific empty-state Hero art (design-provided, replaces the legacy
// CSS gradient). Used when the profile has no ProfileBackground equipped OR
// when the avatar viewer is in 3D mode.
const EMPTY_STATE_LIGHT_ASSET_ID = 97634835410357;
const EMPTY_STATE_DARK_ASSET_ID = 76787651008882;

const getAvatarMode = (): avatarMode => {
  const stored = localStorageService.getLocalStorage(avatarModeKey);
  return stored === avatarMode.twoD || stored === avatarMode.threeD ? stored : avatarMode.twoD;
};

const setAvatarMode = (mode: avatarMode): void => {
  localStorageService.setLocalStorage(avatarModeKey, mode);
};

const CurrentlyWearingAvatar = () => {
  const { profileId } = useProfilePlatformContext();
  const isAuthenticated = authenticatedUser()?.isAuthenticated ?? false;
  const [mode, setMode] = useState<avatarMode>(() =>
    isAuthenticated ? getAvatarMode() : avatarMode.twoD,
  );
  const [isLoading, setIsLoading] = useState(true);

  const backgroundImageUrl = useAvatarBackgroundImageUrl();

  const thumbnailBlock = (
    <div className="thumbnail-holder thumbnail-holder-position">
      <div className="avatar-thumbnail-container">
        {!isAuthenticated || mode === avatarMode.twoD ? (
          <Thumbnail2d
            targetId={Number(profileId)}
            type={ThumbnailTypes.avatar}
            size={avatarThumbnailSize}
            containerClass="no-background-thumbnail thumbnail-span"
            onLoad={() => {
              setIsLoading(false);
            }}
          />
        ) : (
          <Thumbnail3d targetId={Number(profileId)} />
        )}
      </div>
    </div>
  );

  const buttonBlock = (
    <div className="avatar-toggle-button">
      <Button
        variant="Standard"
        size="Large"
        onClick={() => {
          if (!isAuthenticated) {
            if (profileId) {
              redirectToSignupWithProfileReturn(profileId);
            }
            return;
          }
          if (mode === avatarMode.twoD) {
            setMode(avatarMode.threeD);
            setAvatarMode(avatarMode.threeD);
            setIsLoading(true);
          } else {
            setMode(avatarMode.twoD);
            setAvatarMode(avatarMode.twoD);
          }
        }}
      >
        {mode === avatarMode.twoD ? avatarMode.threeD : avatarMode.twoD}
      </Button>
    </div>
  );

  const showBackgroundImage = backgroundImageUrl !== null && mode === avatarMode.twoD;

  let heroStyle: React.CSSProperties;
  if (showBackgroundImage) {
    heroStyle = { backgroundImage: `url(${backgroundImageUrl})` };
  } else {
    // Set both URLs as CSS variables; main.css picks one based on the active
    // `.light-theme` / `.dark-theme` class on a page ancestor. The intersection
    // type lets us carry CSS custom properties alongside standard style props.
    const lightUrl = buildAssetDeliveryUrl(EMPTY_STATE_LIGHT_ASSET_ID);
    const darkUrl = buildAssetDeliveryUrl(EMPTY_STATE_DARK_ASSET_ID);
    const emptyStateStyle: React.CSSProperties & Record<`--${string}`, string> = {
      "--empty-state-image-light": lightUrl ? `url("${lightUrl}")` : "none",
      "--empty-state-image-dark": darkUrl ? `url("${darkUrl}")` : "none",
    };
    heroStyle = emptyStateStyle;
  }

  return (
    <div className="relative currently-wearing-avatar-with-background">
      <div
        className={`profile-avatar-left ${
          showBackgroundImage
            ? "profile-avatar-background-with-image"
            : "profile-avatar-background-empty-state"
        }`}
        style={heroStyle}
      >
        {thumbnailBlock}
        {isLoading && mode === avatarMode.twoD && (
          <div className="avatar-loading-shimmer-overlay" />
        )}
      </div>
      {buttonBlock}
    </div>
  );
};

export default CurrentlyWearingAvatar;
