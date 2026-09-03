import { useTranslation } from "@rbx/core-scripts/react";
import { Component } from "@rbx/profile-platform";
import { HydratedAsset } from "../../services/catalogService";
import useRenderAssetItem from "../../hooks/useRenderAssetItem";
import ProfileCarouselWithAnalytics from "../Common/ProfileCarouselWithAnalytics";

type StoreProps = {
  name: string;
  assets: HydratedAsset[];
};

const Store = ({ name, assets }: StoreProps) => {
  const { translate } = useTranslation();
  const { renderAssetItem, getItemId, onItemsImpressed } = useRenderAssetItem(
    false,
    true,
    "profile-item-card",
  );

  return (
    <div className="profile-store">
      <ProfileCarouselWithAnalytics
        headerTitle={translate("Header.Store")}
        headerHref={`/catalog?CreatorName=${name}&CreatorType=User`}
        items={assets}
        renderItem={renderAssetItem}
        getItemId={getItemId}
        onItemsImpressed={onItemsImpressed}
        component={Component.Store}
      />
    </div>
  );
};

export default Store;
