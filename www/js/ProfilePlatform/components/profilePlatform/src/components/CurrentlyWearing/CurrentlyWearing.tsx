import { useTranslation } from "@rbx/core-scripts/react";
import { Component } from "@rbx/profile-platform";
import { HydratedAsset } from "../../services/catalogService";
import useRenderAssetItem from "../../hooks/useRenderAssetItem";
import ProfileCarouselWithAnalytics from "../Common/ProfileCarouselWithAnalytics";

type CurrentlyWearingProps = {
  assets: HydratedAsset[];
};

const CurrentlyWearing = ({ assets }: CurrentlyWearingProps) => {
  const { translate } = useTranslation();
  const { renderAssetItem, getItemId, onItemsImpressed } = useRenderAssetItem(
    false,
    true,
    "profile-item-card",
  );

  return (
    <div className="profile-currently-wearing">
      <ProfileCarouselWithAnalytics
        headerTitle={translate("Heading.CurrentlyWearing")}
        items={assets}
        renderItem={renderAssetItem}
        getItemId={getItemId}
        onItemsImpressed={onItemsImpressed}
        component={Component.CurrentlyWearing}
      />
    </div>
  );
};

export default CurrentlyWearing;
