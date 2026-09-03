import { useCallback, useEffect, useState } from "react";
import { getItem, setItem } from "@rbx/core-lib/local-storage";
import avatarConstants from "../constants/avatarConstants";

// Register the 3D-thumbnail toggle preference key with the typed local-storage registry.
declare module "@rbx/core-lib/local-storage" {
  interface LocalStorageRegistry {
    RobloxUse3DThumbnailsV2: boolean;
  }
}

// `avatarConstants` is not declared `as const`, so the key widens to `string`; narrow it back to
// the registered literal so the typed `getItem`/`setItem` accept it.
const useThreeDeeThumbsKey = avatarConstants.thumbnail
  .useThreeDeeThumbsKey as "RobloxUse3DThumbnailsV2";

const useThreeDToggle = () => {
  const [is3d, setIs3d] = useState<boolean>(false);
  const [avatarToggleButton, setAvatarToggleButton] = useState<string>(
    avatarConstants.thumbnail.threeDeeButton,
  );

  useEffect(() => {
    setAvatarToggleButton(
      is3d ? avatarConstants.thumbnail.twoDeeButton : avatarConstants.thumbnail.threeDeeButton,
    );
  }, [is3d]);

  const toggleThreeDee = useCallback(() => {
    const newIs3d = !is3d;
    setItem(useThreeDeeThumbsKey, newIs3d);
    setIs3d(newIs3d);
  }, [is3d]);

  // Force the thumbnail into 2D. Profile backgrounds only render in the 2D thumbnail
  // (via `includeBackground`), so equipping a background while in 3D would hide it.
  const switchToTwoDee = useCallback(() => {
    setItem(useThreeDeeThumbsKey, false);
    setIs3d(false);
  }, []);

  const initializeThreeDeeButton = useCallback(() => {
    const localStorageIs3d = getItem(useThreeDeeThumbsKey);
    setIs3d(!!localStorageIs3d);
  }, []);

  useEffect(() => {
    initializeThreeDeeButton();
  }, [initializeThreeDeeButton]);

  return {
    avatarToggleButton,
    toggleThreeDee,
    switchToTwoDee,
    is3d,
  };
};

export default useThreeDToggle;
