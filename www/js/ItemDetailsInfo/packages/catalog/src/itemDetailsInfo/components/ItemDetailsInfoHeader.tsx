/* eslint-disable react/jsx-no-literals */
import React, { useCallback } from "react";
import { withTranslations, WithTranslationsProps } from "react-utilities";
import { Badge } from "@rbx/foundation-ui";
import {
  EntrypointExposure,
  useEntrypointImpressionId,
  logCmntyEntrypointClickEvent,
  logCmntyEntrypointExposureEvent,
} from "@rbx/community-telemetry";
import {
  TAssetItemDetails,
  TBundleItemDetails,
  TOwnedItemInstance,
  TUserItemPermissions,
} from "../constants/types";
import translationConfig from "../translation.config";
import { isLimited, isCollectible } from "../utils/itemDetailUtils";
import ItemDetailsContextMenu from "./ItemDetailsContextMenu";
import { useCreatorReference } from "../utils/hooks";
import ShoppingCartButton from "../../shoppingCart/components/ShoppingCartButton";
import { EntryPoint, EventContext } from "../../common/communityTelemetry/constants";

type TItemDetailsInfoHeaderProps = {
  itemDetails: TAssetItemDetails | TBundleItemDetails;
  ownedItemInstances: Array<TOwnedItemInstance>;
  permissions: TUserItemPermissions;
};

export const ItemDetailsInfoHeader = ({
  itemDetails,
  ownedItemInstances,
  permissions,
  translate,
}: TItemDetailsInfoHeaderProps & WithTranslationsProps): JSX.Element | null => {
  const { name, license } = itemDetails;

  const { CreatorLinkComponent } = useCreatorReference(itemDetails);

  let licenseLabel: string | undefined;
  if (license?.licenseType === "ThirdParty") {
    licenseLabel = translate("Label.LicensingLicensed");
  } else if (license?.licenseType === "FirstParty") {
    licenseLabel = translate("Label.LicensingOfficial");
  }

  const isCommunityCreator = itemDetails.creatorType === "Group" && !!itemDetails.creatorTargetId;
  const groupId = itemDetails.creatorTargetId;
  const entrypointImpressionId = useEntrypointImpressionId();

  const handleCreatorExposure = useCallback(() => {
    logCmntyEntrypointExposureEvent({
      context: EventContext.MarketplaceItemPage,
      entryPoint: EntryPoint.MarketplaceItemPage,
      entrypointImpressionId,
      groupId,
    });
  }, [entrypointImpressionId, groupId]);

  const handleCreatorClick = useCallback(() => {
    logCmntyEntrypointClickEvent({
      context: EventContext.MarketplaceItemPage,
      entryPoint: EntryPoint.MarketplaceItemPage,
      entrypointImpressionId,
      groupId,
    });
  }, [entrypointImpressionId, groupId]);

  return (
    <div className="item-details-info-header border-bottom item-name-container">
      <div className="left">
        <div className="item-details-name-row">
          {!!itemDetails?.premiumPricing?.premiumPriceInRobux && (
            <span className="icon-premium-medium" />
          )}
          <h1>{name}</h1>
        </div>
        <div className="item-details-creator-container">
          <span id="2sv-popup-container" />
          {!!CreatorLinkComponent &&
            (isCommunityCreator ? (
              <EntrypointExposure onExposure={handleCreatorExposure}>
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
                <span className="community-creator-entrypoint" onClick={handleCreatorClick}>
                  {CreatorLinkComponent}
                </span>
              </EntrypointExposure>
            ) : (
              CreatorLinkComponent
            ))}
          {itemDetails.owned && (
            <span className="item-owned">
              <div className="label-checkmark">
                <span className="icon-checkmark-white-bold" />
              </div>
              {isLimited(itemDetails.itemRestrictions || []) ||
              isCollectible(itemDetails.itemRestrictions || []) ? (
                <span>
                  {translate("Label.ItemOwnedCount", {
                    itemCount: ownedItemInstances.length,
                  })}
                </span>
              ) : (
                <span>{translate("Label.ItemOwned")}</span>
              )}
            </span>
          )}
        </div>
      </div>
      <div className="right">
        <div className="item-details-header-actions">
          {/* Unlike the item card badge, this one stays muted for both
              first-party and third-party items. */}
          {licenseLabel && (
            <Badge
              variant="Neutral"
              shape="Box"
              label={licenseLabel}
              className="item-license-badge"
            />
          )}
          <ShoppingCartButton />
        </div>
        <ItemDetailsContextMenu itemDetails={itemDetails} permissions={permissions} />
      </div>
    </div>
  );
};
export default withTranslations(ItemDetailsInfoHeader, translationConfig);
