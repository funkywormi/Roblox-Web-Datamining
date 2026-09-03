import { useTranslation } from "@rbx/core-scripts/react";
import { Button, Icon } from "@rbx/foundation-ui";
import { ProductFeaturesList } from "@rbx/subscriptions-common";
import { Fragment, useEffect, useState } from "react";

import BackdropTexture from "./BackdropTexture";
import BenefitDetailDialog from "./BenefitDetailDialog";
import Divider from "./ui/Divider";
import { getFeatureConfig } from "../utils/subscriptionProductInfo";

import type { SubscriptionProductInfo, Subscription } from "@rbx/client-subscriptions-api/v1";
import type { DeviceMeta } from "@rbx/core-scripts/meta/device";
import type { FC } from "react";

export type WelcomeViewProps = {
  deviceMeta: DeviceMeta;
  robloxSubscriptionProduct: SubscriptionProductInfo;
  robloxSubscriptionMembership: Subscription;
  onDismiss: () => void;
};

const WelcomeView: FC<WelcomeViewProps> = ({
  deviceMeta,
  robloxSubscriptionProduct,
  onDismiss,
}) => {
  const { translate } = useTranslation();

  const [benefitDetail, setBenefitDetail] = useState<{ primary: string; secondary: string } | null>(
    null,
  );

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const mobileDock = !deviceMeta.isInApp && (
    <div
      aria-label={translate("Action.OK")}
      className="bottom-dock padding-t-medium bg-surface-100 large:hidden width-full gap-y-medium flex flex-col"
      data-testid="welcome-dismiss-dock"
      role="region"
    >
      <Divider />
      <div className="width-full gap-y-medium padding-bottom-[env(safe-area-inset-bottom\,0px)] padding-x-xxlarge flex flex-col items-stretch">
        <Button
          className="min-width-0 width-full margin-bottom-[24px] large:margin-bottom-none"
          size="Large"
          variant="Emphasis"
          onClick={onDismiss}
        >
          {translate("Action.OK")}
        </Button>
      </div>
    </div>
  );

  return (
    <Fragment>
      <BackdropTexture />
      <div className="width-full min-width-0 large:items-center flex flex-col items-start">
        <div className="margin-top-[48px] width-full min-width-0 content-emphasis large:max-width-[730px] large:gap-y-[60px] large:self-auto large:padding-x-xlarge flex flex-col gap-y-[var(--size-1200)] self-stretch">
          <div className="width-full min-width-0 gap-y-xxlarge padding-x-xxlarge text-align-x-start large:gap-y-[24px] large:items-center large:padding-x-none large:text-align-x-center flex flex-col items-start">
            <div className="gap-y-xsmall large:items-center flex flex-col items-start">
              <Icon className="!size-1800 margin-bottom-medium" name="icon-regular-roblox-plus" />
              <h1 className="text-heading-large">
                {translate("Title.Welcome", { productShort: translate("Label.BlackbirdShort") })}
              </h1>
              <p className="text-body-large content-default">
                {translate("Description.Welcome", { product: translate("Label.Blackbird") })}
              </p>
            </div>
            {!deviceMeta.isInApp && (
              // Offsets the button to match PurchaseView's CTA position, which has a BillingInfoDisplay above it.
              <div
                className="width-full gap-y-medium padding-t-none large:margin-x-auto large:margin-top-[12px] large:flex large:max-width-[min(440px,100%)] large:width-full large:flex-col large:items-center hidden items-start"
                data-testid="welcome-dismiss-inline"
              >
                <div className="width-full gap-x-small flex shrink-0 flex-row items-start justify-center">
                  <Button
                    className="width-full large:width-[230px] shrink-0"
                    size="Medium"
                    variant="Emphasis"
                    onClick={onDismiss}
                  >
                    {translate("Action.OK")}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="width-full min-width-0 gap-y-xxlarge padding-x-xxlarge large:padding-x-none flex flex-col">
            <span className="text-heading-small">{translate("Title.BenefitsUnlocked")}</span>
            <ProductFeaturesList
              featureConfig={getFeatureConfig(robloxSubscriptionProduct)}
              overrideIconName="icon-filled-check"
              periodType={robloxSubscriptionProduct.periodType}
              onTileClick={(primary, secondary) => {
                setBenefitDetail({ primary, secondary });
              }}
            />
          </div>
        </div>
      </div>
      {mobileDock}
      <BenefitDetailDialog
        body={benefitDetail?.secondary ?? ""}
        open={benefitDetail != null}
        title={benefitDetail?.primary ?? ""}
        onOpenChange={nextOpen => {
          if (!nextOpen) {
            setBenefitDetail(null);
          }
        }}
      />
    </Fragment>
  );
};

export default WelcomeView;
