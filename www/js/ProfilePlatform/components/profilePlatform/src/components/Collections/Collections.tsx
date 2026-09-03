import { useTranslation } from "@rbx/core-scripts/react";
import { Component } from "@rbx/profile-platform";
import useRenderAssetItem from "../../hooks/useRenderAssetItem";
import { HydratedAsset } from "../../services/catalogService";
import ProfileCarouselWithAnalytics from "../Common/ProfileCarouselWithAnalytics";

type CollectionsProps = {
  userId: string;
  assets: HydratedAsset[];
};

const Collections = ({ userId, assets }: CollectionsProps) => {
  const { translate } = useTranslation();
  const { renderAssetItem, getItemId, onItemsImpressed } = useRenderAssetItem(
    false,
    false,
    "profile-item-card",
  );

  return (
    <div className="profile-collections">
      <ProfileCarouselWithAnalytics
        headerTitle={translate("Heading.Collections")}
        headerHref={`/users/${userId}/inventory/`}
        items={assets}
        renderItem={renderAssetItem}
        getItemId={getItemId}
        onItemsImpressed={onItemsImpressed}
        component={Component.Collections}
      />
    </div>
  );
};

export default Collections;
