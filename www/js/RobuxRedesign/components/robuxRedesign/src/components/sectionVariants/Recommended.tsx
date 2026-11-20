/* eslint-disable no-void */
import { useCallback, useContext } from "react";
import { useFullKeyTranslations } from "@rbx/www-common/i18n";
import { Button } from "@rbx/foundation-ui";
import { PriceTag } from "@rbx/payments/priceTag";
import { Product, SectionBase, SectionRecommended } from "../../types/buyRobuxPageData";
import { Section, SectionHeader, SectionBody, BaseSectionProps } from "../sections/Section";
import { RobuxAmount } from "../sections/RobuxAmount";
import { formatAmount } from "../../utils/formatMoney";
import { PurchaseContext, BuyRobuxPageSectionType } from "../../contexts/PurchaseContext";
import {
  getRobuxProductTrackingProps,
  getSectionTrackingProps,
} from "../../hooks/useScrollTracking";
import { PersonalizedRecommendationsMenu } from "../PersonalizedRecommendationsMenu";
import { robuxProductEarlyClickKey, useEarlyClickRow } from "../../modules/earlyClick";

type RecommendedProps = BaseSectionProps & {
  sectionBase: SectionBase;
  recommended: SectionRecommended;
};

export function Recommended({ isPrimary, sectionBase }: RecommendedProps) {
  const { purchaseNonRedirectProduct } = useContext(PurchaseContext);
  const { translateFullKey } = useFullKeyTranslations();

  const buttonClickHandler = useCallback(
    (product: Product) => {
      void purchaseNonRedirectProduct(product, false, false, BuyRobuxPageSectionType.Recommended);
    },
    [purchaseNonRedirectProduct],
  );

  const [product] = sectionBase.products ?? [];
  const earlyClickRowProps = useEarlyClickRow(
    robuxProductEarlyClickKey(product?.productId ?? "recommended", "recommended"),
    { isEnabled: Boolean(product) },
  );
  if (!product) {
    return null;
  }

  return (
    <Section {...getSectionTrackingProps(sectionBase)}>
      <div className="flex flex-row justify-between items-center self-stretch">
        <SectionHeader>{translateFullKey(sectionBase.sectionHeaderTranslationKey)}</SectionHeader>
        {sectionBase.showPersonalizedRecommendationsMenu && (
          <PersonalizedRecommendationsMenu surfaceKey="Web_BuyRobux_Packages" />
        )}
      </div>
      <SectionBody isPrimary={isPrimary}>
        <div
          className="flex flex-col self-stretch medium:flex-row medium:justify-between medium:items-center"
          {...earlyClickRowProps}
        >
          <div className="flex flex-col self-stretch gap-small padding-bottom-large medium:padding-bottom-none medium:self-auto">
            {/* Section Title */}
            <RobuxAmount
              amount={product.robuxAmount}
              nonPromotionalAmount={product.nonPromotionalPlatformRobuxAmount}
            />
          </div>

          {/* Section Button */}
          <Button
            onClick={() => {
              buttonClickHandler(product);
            }}
            {...getRobuxProductTrackingProps(product.productId)}
            className="text-label-medium shrink-0 width-full medium:width-[200px]"
            variant={product.isCallToAction ? "Emphasis" : "Standard"}
            size="Medium"
          >
            <PriceTag
              tagClassName="robux-price-tag"
              amount={Number(formatAmount(product.price.amount))}
              currencyCode={product.price.amount.currencyCode}
            />
          </Button>
        </div>
      </SectionBody>
    </Section>
  );
}
