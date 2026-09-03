import { useTranslation } from "@rbx/core-scripts/react";
import { Button, Icon } from "@rbx/foundation-ui";
import { ProductFeaturesList } from "@rbx/subscriptions-common";
import { Fragment } from "react";

import ActionPanel from "./ActionPanel";
import BackdropTexture from "./BackdropTexture";
import Divider from "./ui/Divider";
import { getFeatureConfig } from "../utils/subscriptionProductInfo";

import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v1";
import type { FC } from "react";

export type FreeTrialConfirmationViewProps = {
  robloxSubscriptionProduct: SubscriptionProductInfo;
  onDismiss: () => void;
};

const FreeTrialConfirmationView: FC<FreeTrialConfirmationViewProps> = ({
  robloxSubscriptionProduct,
  onDismiss,
}) => {
  const { translate } = useTranslation();

  const okButton = (
    <Button className="width-full" size="Large" variant="Emphasis" onClick={onDismiss}>
      {translate("Action.OK")}
    </Button>
  );

  const disclaimer = (
    <p className="text-body-small content-muted text-center">
      {translate("Description.FeatureAccessDisclaimer")}{" "}
      <a
        className="text-link"
        href="https://help.roblox.com/hc/articles/39143693116052-Understanding-Age-Checks-on-Roblox"
      >
        {translate("Action.ViewDetails")}
      </a>
    </p>
  );

  return (
    <Fragment>
      <BackdropTexture />
      <div className="flex flex-col items-center">
        <div className="padding-x-xlarge content-emphasis gap-y-xxlarge width-full large:max-width-[730px] flex flex-col">
          <div className="gap-y-small large:items-center flex flex-col items-start">
            <div className="gap-x-small flex items-center">
              <Icon className="!size-600" name="icon-regular-roblox-plus" />
              <h1 className="text-heading-medium">{translate("Title.FreeTrialConfirmation")}</h1>
            </div>
            <p className="text-body-large content-default">
              {translate("Description.FreeTrialConfirmation")}
            </p>
          </div>
          <ProductFeaturesList
            featureConfig={getFeatureConfig(robloxSubscriptionProduct)}
            periodType={robloxSubscriptionProduct.periodType}
          />
          {/* Large screens render the action bar inline; the fixed bottom dock below is mobile-only. */}
          <ActionPanel>
            <div
              className="large:flex large:flex-col large:items-center width-full gap-y-medium hidden"
              data-testid="free-trial-action-inline"
            >
              {okButton}
              {disclaimer}
            </div>
          </ActionPanel>
        </div>
      </div>
      {/* Mobile: action bar mounted to the bottom of the screen, matching the Figma design. */}
      <div
        aria-label={translate("Action.OK")}
        className="bottom-dock padding-t-medium bg-surface-100 large:!hidden width-full gap-y-medium flex flex-col"
        data-testid="free-trial-action-dock"
        role="region"
      >
        <Divider />
        <div className="width-full gap-y-medium padding-b-[env(safe-area-inset-bottom\,0px)] padding-x-xxlarge flex flex-col items-stretch">
          {okButton}
          {disclaimer}
        </div>
      </div>
    </Fragment>
  );
};

export default FreeTrialConfirmationView;
