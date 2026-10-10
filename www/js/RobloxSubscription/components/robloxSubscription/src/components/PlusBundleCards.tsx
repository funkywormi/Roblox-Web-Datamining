import { useTheme, useTranslation } from "@rbx/core-scripts/react";
import { Icon } from "@rbx/foundation-ui";
import { Carousel } from "@rbx/payments/components/carousel";
import { SubscriptionButton } from "@rbx/subscriptions-common";

import useLocalizedMoney from "../hooks/useLocalizedMoney";
import { getEntitledRobux, isFreeTrialEligible } from "../utils/subscriptionProductInfo";

import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v2";
import type { SubscriptionButtonProps } from "@rbx/subscriptions-common";
import type { ComponentProps, FC } from "react";

export type BundleButtonProps = Pick<
  SubscriptionButtonProps,
  "deviceMeta" | "isDisabled" | "paymentSessionId" | "referrerId" | "onSubscribeClick"
>;

type BundleCardProps = {
  product: SubscriptionProductInfo;
  buttonProps: BundleButtonProps;
  trackSubscribeClick: (product: SubscriptionProductInfo) => void;
};

const BenefitLine: FC<{ icon: ComponentProps<typeof Icon>["name"]; text: string }> = ({
  icon,
  text,
}) => (
  <div className="gap-x-medium flex flex-row items-center">
    <Icon name={icon} size="Medium" />
    <span className="text-body-medium content-default">{text}</span>
  </div>
);

const BundleCard: FC<BundleCardProps> = ({ product, buttonProps, trackSubscribeClick }) => {
  const { translate, intl } = useTranslation();
  const robuxAmount = getEntitledRobux(product);
  const price = useLocalizedMoney(product.localizedPrice);
  const strikethroughPrice = useLocalizedMoney(product.localizedStrikethroughPrice);

  return (
    <div
      className="bg-surface-100 padding-medium radius-large gap-y-small height-full flex flex-col"
      data-testid={`plus-bundle-card-${product.productKey.id}`}
    >
      <div className="gap-x-large flex flex-row items-center justify-between">
        <span className="text-label-large content-emphasis text-truncate-end">
          {translate("Label.PlusBundleName", { robuxAmount: String(robuxAmount) })}
        </span>
        <div className="gap-x-small flex flex-row items-center">
          {strikethroughPrice && (
            <span className="text-title-medium text-no-wrap line-through [color:var(--color-extended-gray-600)]">
              {strikethroughPrice}
            </span>
          )}
          <span className="text-title-medium content-emphasis text-no-wrap">{price}</span>
        </div>
      </div>
      <div className="gap-y-large flex flex-col">
        <div className="gap-y-small padding-top-small flex flex-col">
          <BenefitLine
            icon="icon-regular-roblox-plus"
            text={translate("Description.Benefit.AllPlus.V2")}
          />
          <BenefitLine
            icon="icon-regular-robux"
            text={translate("Description.Benefit.RobuxAllowance", { amount: intl.n(robuxAmount) })}
          />
          {strikethroughPrice && (
            <BenefitLine
              icon="icon-regular-pig"
              text={translate("Description.Benefit.BetterValue.V2", {
                oldAmount: strikethroughPrice,
              })}
            />
          )}
        </div>
        <SubscriptionButton
          {...buttonProps}
          className="width-full"
          productId={product.productKey.id}
          productType={product.productKey.type}
          size="Medium"
          trackSubscriptionButtonClick={() => {
            trackSubscribeClick(product);
          }}
          variant="Standard"
        >
          {isFreeTrialEligible(product)
            ? translate("Action.TryItForFree")
            : translate("Label.PricePerMonth", { price })}
        </SubscriptionButton>
      </div>
    </div>
  );
};

export type PlusBundleCardsProps = {
  bundles: SubscriptionProductInfo[];
  buttonProps: BundleButtonProps;
  trackSubscribeClick: (product: SubscriptionProductInfo) => void;
};

const PlusBundleCards: FC<PlusBundleCardsProps> = ({
  bundles,
  buttonProps,
  trackSubscribeClick,
}) => {
  const { translate } = useTranslation();
  const heading = translate("Heading.GetRobuxEveryMonth");
  const inverseThemeClass =
    useTheme() === "dark" ? "color-mode-light light-theme" : "color-mode-dark dark-theme";

  return (
    <div className="gap-y-large flex flex-col" data-testid="plus-bundle-cards">
      <div className="gap-y-xxsmall flex flex-col">
        <span className="text-heading-small">{heading}</span>
        <span className="text-body-medium content-default">
          {translate("Description.GetRobuxEveryMonth")}
        </span>
      </div>
      <Carousel
        ariaLabel={heading}
        className="margin-x-[calc(var(--padding-xxlarge)*-1)] large:margin-x-none self-stretch"
      >
        <div className={inverseThemeClass}>
          <Carousel.PrevButton ariaLabel="Previous bundle" className="medium:flex hidden" />
        </div>
        <Carousel.Track
          className="padding-x-xxlarge large:padding-x-none large:[scroll-padding-inline:0] [scroll-padding-inline:var(--padding-xxlarge)]"
          gap="large"
        >
          {bundles.map(bundle => (
            <Carousel.Item
              key={bundle.productKey.id}
              className="width-[313px] medium:width-[240px] flex flex-col"
            >
              <BundleCard
                buttonProps={buttonProps}
                product={bundle}
                trackSubscribeClick={trackSubscribeClick}
              />
            </Carousel.Item>
          ))}
        </Carousel.Track>
        <div className={inverseThemeClass}>
          <Carousel.NextButton ariaLabel="Next bundle" className="medium:flex hidden" />
        </div>
        <Carousel.Indicator className="padding-top-medium medium:hidden" />
      </Carousel>
    </div>
  );
};

export default PlusBundleCards;
