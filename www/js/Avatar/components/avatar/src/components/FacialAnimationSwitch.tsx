import React, { useCallback } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Toggle } from "@rbx/foundation-ui";
import type { AccoutrementAsset } from "@rbx/avatar-common";
import { useCurrentlyWearingAssetsStoreContext } from "../contexts/CurrentlyWearingAssetsStoreContext";
import { useAssetManagerContext } from "../contexts/AssetManagerContext";
import { useSystemFeedback } from "../contexts/SystemFeedbackContext";
import avatarConstants from "../constants/avatarConstants";

function FacialAnimationSwitch(): JSX.Element | null {
  const { translate } = useTranslation();
  const { currentlyWornAssetsList } = useCurrentlyWearingAssetsStoreContext();
  const { setWearingAssets } = useAssetManagerContext();
  const systemFeedback = useSystemFeedback();

  const dynamicHeadAsset = currentlyWornAssetsList.find(
    (asset: AccoutrementAsset) => asset.assetType.id === 79,
  );

  const isFacialAnimationEnabled = useCallback(() => {
    if (!dynamicHeadAsset) {
      return true;
    }
    return dynamicHeadAsset.meta?.staticFacialAnimation !== true;
  }, [dynamicHeadAsset]);

  const handleToggleChange = useCallback(
    (isChecked: boolean) => {
      if (!dynamicHeadAsset) {
        return;
      }

      const newStaticValue = !isChecked;

      const updatedAssetsList = currentlyWornAssetsList.map((asset: AccoutrementAsset) => {
        if (asset.assetType.id === 79) {
          return {
            ...asset,
            meta: {
              ...asset.meta,
              staticFacialAnimation: newStaticValue,
            },
          };
        }
        return asset;
      });

      setWearingAssets(updatedAssetsList).catch(() => {
        systemFeedback.error(avatarConstants.assets.errorUpdatingItems);
      });
    },
    [currentlyWornAssetsList, dynamicHeadAsset, setWearingAssets, systemFeedback],
  );

  if (!dynamicHeadAsset) {
    return null;
  }

  const isEnabled = isFacialAnimationEnabled();

  return (
    <div style={{ marginTop: 12 }}>
      <Toggle
        size="Medium"
        placement="End"
        isChecked={isEnabled}
        label={translate("Label.FacialAnimation")}
        onCheckedChange={handleToggleChange}
      />
    </div>
  );
}

export default FacialAnimationSwitch;
