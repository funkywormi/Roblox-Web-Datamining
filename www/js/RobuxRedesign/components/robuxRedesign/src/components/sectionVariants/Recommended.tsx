/* eslint-disable no-void */
import { useCallback, useContext } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button } from "@rbx/foundation-ui";
import { PriceTag } from "@rbx/payments/priceTag";
import { Product, SectionBase, SectionRecommended } from "../../types/buyRobuxPageData";
import { Section, SectionHeader, SectionBody, BaseSectionProps } from "../sections/Section";
import { RobuxAmount } from "../sections/RobuxAmount";
import { formatAmount } from "../../utils/formatMoney";
import { PurchaseContext, BuyRobuxPageSectionType } from "../../contexts/PurchaseContext";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import {
  getRobuxProductTrackingProps,
  getSectionTrackingProps,
} from "../../hooks/useScrollTracking";

type RecommendedProps = BaseSectionProps & {
  sectionBase: SectionBase;
  recommended: SectionRecommended;
};

export function Recommended({ isPrimary, sectionBase }: RecommendedProps) {
  const { purchaseNonRedirectProduct } = useContext(PurchaseContext);

  const { breakpoint } = useContext(BuyRobuxPageContext);
  const { translate } = useTranslation();

  const buttonClickHandler = useCallback(
    (product: Product) => {
      void purchaseNonRedirectProduct(product, false, false, BuyRobuxPageSectionType.Recommended);
    },
    [purchaseNonRedirectProduct],
  );

  const [product] = sectionBase.products ?? [];
  if (!product) {
    return null;
  }

  return (
    <Section {...getSectionTrackingProps(sectionBase)}>
      <SectionHeader>{translate(sectionBase.sectionHeaderTranslationKey)}</SectionHeader>
      <SectionBody isPrimary={isPrimary}>
        <div className="flex flex-col self-stretch medium:flex-row medium:justify-between medium:items-center">
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
            className={`text-label-medium shrink-0 ${breakpoint.isAboveInclusive("medium") ? "button-extra-wide" : "width-full"}`}
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
