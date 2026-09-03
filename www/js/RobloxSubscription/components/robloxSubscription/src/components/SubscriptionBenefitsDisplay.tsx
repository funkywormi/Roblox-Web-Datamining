import { useTranslation } from "@rbx/core-scripts/react";
import { ListItem, Icon } from "@rbx/foundation-ui";

import type { RobloxSubscriptionProductFeatureConfig } from "@rbx/client-roblox-subscriptions-api/v1";
import type { FC } from "react";

export type SubscriptionBenefitsDisplayProps = {
  featureConfig: RobloxSubscriptionProductFeatureConfig;
};

const SubscriptionBenefitsDisplay: FC<SubscriptionBenefitsDisplayProps> = ({ featureConfig }) => {
  const { translate } = useTranslation();

  return (
    <div className="gap-y-medium flex flex-col">
      <span className="text-heading-medium">{translate("Label.ExploreMoreBenefits")}</span>
      <div className="foundation-web-list-item-container">
        {featureConfig.isTradingEnabled && (
          <ListItem
            description={translate("Description.Benefit.TradeResellItemsSubtitle")}
            divider="None"
            isContained
            leading={<Icon name="icon-regular-hand-two-arrows-horizontal" size="Medium" />}
            size="Medium"
            title={translate("Description.Benefit.TradeResellItems")}
            trailing={<Icon name="icon-regular-chevron-small-right" />}
            onSelect={() => {
              window.location.href = "https://help.roblox.com/hc/articles/203313310-Trading-System";
            }}
          />
        )}
        {featureConfig.isUgcPublishingEnabled && (
          <ListItem
            description={translate("Description.Benefit.PublishItemsSubtitle")}
            divider="None"
            isContained
            leading={<Icon name="icon-regular-arrow-up-from-landscape-rectangle" size="Medium" />}
            size="Medium"
            title={translate("Description.Benefit.PublishItems")}
            trailing={<Icon name="icon-regular-chevron-small-right" />}
            onSelect={() => {
              window.location.href =
                "https://help.roblox.com/hc/articles/203313180-Creating-and-Selling-Avatar-Items";
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SubscriptionBenefitsDisplay;
