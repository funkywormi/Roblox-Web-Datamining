import { useCallback, useContext, useMemo } from "react";
import classNames from "classnames";
import { useResponsiveValue } from "@rbx/payments/hooks";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button, Media } from "@rbx/foundation-ui";
import { PriceTag } from "@rbx/payments/priceTag";
import {
  LimitedTimeBonusItem,
  Product,
  SectionBase,
  SectionLimitedTimeBonus,
} from "../../types/buyRobuxPageData";
import { BaseSectionProps, Section, SectionHeader, SectionSubHeader } from "../sections/Section";
import { RobuxAmount } from "../sections/RobuxAmount";
import { PurchaseContext, BuyRobuxPageSectionType } from "../../contexts/PurchaseContext";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import { formatAmount } from "../../utils/formatMoney";
import { trackCounter } from "../../observability";
import {
  getSectionTrackingProps,
  getRobuxProductTrackingProps,
} from "../../hooks/useScrollTracking";
import { BlueCheckIcon } from "../BlueCheckIcon";
import { ExpirationBadge } from "../ExpirationBadge";
import { resolveLimitedTimeBonusDaysLeft } from "../../utils/resolveLimitedTimeBonusDaysLeft";

type LimitedTimeBonusSectionProps = BaseSectionProps & {
  sectionBase: SectionBase;
  limitedTimeBonus: SectionLimitedTimeBonus;
};

type BonusItemCardProps = {
  item: LimitedTimeBonusItem;
  products: Product[];
  totalCards: number;
  redirectUrl?: string;
  onPurchaseClick: (
    product: Product,
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
};

function RobuxTile({
  product,
  redirectUrl,
  onPurchaseClick,
}: {
  product: Product;
  redirectUrl?: string;
  onPurchaseClick: BonusItemCardProps["onPurchaseClick"];
}) {
  const buttonSize = useResponsiveValue("Small" as const, {
    small: "Medium" as const,
  });

  const redirectProps = redirectUrl
    ? {
        as: "a" as const,
        href: `${redirectUrl}&ap=${product.productId}`,
        rel: "noreferrer",
        role: "button" as const,
        target: "_blank",
      }
    : {};

  return (
    <div
      className="self-stretch flex flex-row justify-between items-center gap-small"
      {...getRobuxProductTrackingProps(product.productId)}
    >
      <div className="min-width-0 flex-1">
        <RobuxAmount
          amount={product.robuxAmount}
          nonPromotionalAmount={product.nonPromotionalPlatformRobuxAmount}
          bonusRobuxAmount={product.bonusRobuxAmount}
          bonusRobuxTagIcon={product.bonusRobuxTagIcon}
          bonusRobuxTagTranslationKey={product.bonusRobuxTagTranslationKey}
          inlineBadgeIcon={product.inlineBadgeIcon}
          inlineBadgeTranslationKey={product.inlineBadgeTranslationKey}
        />
      </div>
      <Button
        variant={product.isCallToAction ? "Emphasis" : "Standard"}
        size={buttonSize}
        className="min-width-[90px] small:min-width-[120px] medium:min-width-[200px] text-label-medium shrink-0"
        onClick={(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
          onPurchaseClick(product, event);
        }}
        {...redirectProps}
        icon={redirectUrl ? "icon-regular-arrow-up-right-from-square" : undefined}
      >
        <PriceTag
          tagClassName="robux-price-tag"
          currencyCode={product.price.amount.currencyCode}
          amount={Number(formatAmount(product.price.amount))}
        />
      </Button>
    </div>
  );
}

function BonusItemCard({
  item,
  products,
  totalCards,
  redirectUrl,
  onPurchaseClick,
}: BonusItemCardProps) {
  const { translate } = useTranslation();
  const metadata = item.displayableBonus.collectibleItemMetadata;

  const bannerHeightClass =
    totalCards > 1 ? "min-height-[120px]" : "min-height-[186px] medium:min-height-[204px]";

  const itemName = metadata
    ? translate(metadata.translationKey) || "Bonus Item"
    : (item.displayableBonus.gamePassMetadata?.gamePassDisplayName ?? "");

  const bodyLayoutClass =
    totalCards === 1 ? "flex-col items-center justify-end" : "flex-row items-center";

  return (
    <div className="self-stretch radius-large flex flex-col" style={{ overflow: "hidden" }}>
      <div className={`relative bg-shift-200 ${bannerHeightClass}`}>
        {metadata?.backgroundImage2dUrl && (
          <Media
            aspectRatio="16:9"
            src={metadata.backgroundImage2dUrl}
            alt=""
            containerClassName="absolute inset-0 width-full height-full"
            className="width-full height-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.4)]" />
        <div
          className={classNames("relative z-10 padding-xlarge flex height-full", bodyLayoutClass, {
            "gap-medium": totalCards === 1,
            "gap-xlarge": totalCards !== 1,
          })}
        >
          {metadata?.image2dUrl && (
            <img
              src={metadata.image2dUrl}
              alt={itemName}
              className={classNames("radius-medium object-contain shrink-0", {
                "height-[150px] width-auto max-width-full": totalCards === 1,
                "height-[75px] width-auto max-width-full": totalCards !== 1,
              })}
            />
          )}
          <div
            className={`flex flex-col gap-xsmall medium:gap-small ${totalCards === 1 ? "self-start" : ""}`}
          >
            <span className="text-title-large medium:text-heading-medium content-emphasis">
              {itemName}
            </span>
            {metadata?.creatorDisplayName && (
              <span className="text-body-medium content-emphasis flex items-center gap-xsmall">
                {metadata.creatorDisplayName}
                {metadata.creatorIsVerified && <BlueCheckIcon size={16} />}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className="self-stretch flex flex-col gap-xlarge padding-medium medium:padding-xlarge bg-shift-400"
        data-testid="ltb-robux-packages"
      >
        {products.map(product => (
          <RobuxTile
            key={product.productId}
            product={product}
            redirectUrl={redirectUrl}
            onPurchaseClick={onPurchaseClick}
          />
        ))}
      </div>
    </div>
  );
}

export function LimitedTimeBonusSection({
  isPrimary: _isPrimary,
  sectionBase,
  limitedTimeBonus,
}: LimitedTimeBonusSectionProps) {
  const { purchaseProduct } = useContext(PurchaseContext);
  const { redirect } = useContext(BuyRobuxPageContext);
  const { translate } = useTranslation();

  const cards = useMemo(() => {
    const products = sectionBase.products ?? [];
    return limitedTimeBonus.limitedTimeBonuses.reduce<
      { item: LimitedTimeBonusItem; products: Product[] }[]
    >((acc, item) => {
      const { collectibleItemMetadata, gamePassMetadata } = item.displayableBonus;
      if (!collectibleItemMetadata && !gamePassMetadata) {
        trackCounter("BonusItemMissingMetadata", { productType: "LimitedTimeBonus" });
        return acc;
      }
      const matchedProducts = products.filter(p =>
        item.robuxProductIds.some(id => id === p.productId),
      );
      if (matchedProducts.length > 0) {
        acc.push({ item, products: matchedProducts });
      }
      return acc;
    }, []);
  }, [limitedTimeBonus.limitedTimeBonuses, sectionBase.products]);

  const handlePurchaseClick = useCallback(
    (product: Product, event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      purchaseProduct({
        product,
        event,
        isRedirect: Boolean(limitedTimeBonus.isRedirect && redirect?.url),
        isSubscription: false,
        isBonus: true,
        sectionType: BuyRobuxPageSectionType.LimitedTimeBonus,
      });
    },
    [purchaseProduct, limitedTimeBonus.isRedirect, redirect],
  );

  if (cards.length === 0) {
    return null;
  }

  const daysLeftResult = resolveLimitedTimeBonusDaysLeft(limitedTimeBonus.expirationTimestampMs);

  return (
    <Section {...getSectionTrackingProps(sectionBase)}>
      <div
        className="self-stretch flex flex-row items-center justify-between gap-medium"
        data-testid="ltb-section-header-row"
      >
        <SectionHeader className="self-auto min-width-0 flex-1 medium:self-stretch medium:flex-none">
          {translate(sectionBase.sectionHeaderTranslationKey) || "Limited-time avatar items"}
        </SectionHeader>
        {daysLeftResult.success && <ExpirationBadge daysLeft={daysLeftResult.value} />}
      </div>
      {limitedTimeBonus.bodyTranslationKey && (
        <SectionSubHeader>{translate(limitedTimeBonus.bodyTranslationKey)}</SectionSubHeader>
      )}
      <div className="self-stretch flex flex-col gap-xlarge medium:gap-xxlarge">
        {cards.map(({ item, products }) => (
          <BonusItemCard
            key={item.robuxProductIds.join("-")}
            item={item}
            products={products}
            totalCards={cards.length}
            redirectUrl={limitedTimeBonus.isRedirect && redirect?.url ? redirect.url : undefined}
            onPurchaseClick={handlePurchaseClick}
          />
        ))}
      </div>
    </Section>
  );
}
