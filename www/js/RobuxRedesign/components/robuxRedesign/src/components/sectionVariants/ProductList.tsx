/* eslint-disable no-void */
import { useCallback, useContext } from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { translateHtml } from "@rbx/translation-utils";
import { Product, type Section as RobuxPageSection } from "../../types/buyRobuxPageData";
import {
  BaseSectionProps,
  Section,
  SectionBody,
  SectionHeader,
  SectionSubHeader,
} from "../sections/Section";
import { SectionBodyProductList } from "../sections/SectionBodyProductList";
import { PurchaseContext, BuyRobuxPageSectionType } from "../../contexts/PurchaseContext";
import { getSectionTrackingProps } from "../../hooks/useScrollTracking";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import { ExpirationBadge } from "../ExpirationBadge";
import { resolveLimitedTimeBonusDaysLeft } from "../../utils/resolveLimitedTimeBonusDaysLeft";

type ProductListProps = BaseSectionProps & {
  sectionBase: RobuxPageSection;
};

export function ProductList({ isPrimary, sectionBase }: ProductListProps) {
  const { purchaseNonRedirectProduct } = useContext(PurchaseContext);
  const { atLeastOneProductHasBonusAmount } = useContext(BuyRobuxPageContext);

  const { translate } = useTranslation();
  const bodyTranslationKey = sectionBase.productsList?.bodyTranslationKey;
  const daysLeft = resolveLimitedTimeBonusDaysLeft(
    sectionBase.productsList?.promotionExpirationTimestampMs,
  );

  // The backend swaps this section's body copy for promotional messaging unless the section carries
  // the legal disclosure, so whether the resolved string has the terms-link placeholders varies.
  // translateHtml returns an empty array when the tag it is given goes unused, so fall back to the
  // plain string instead of rendering an empty subheader.
  const bodyWithTermsLink = bodyTranslationKey
    ? translateHtml(translate, bodyTranslationKey, [
        {
          opening: "termsLinkStart",
          closing: "termsLinkEnd",
          render: children => (
            <a href="/info/terms" className="text-link" target="_blank">
              {children}
            </a>
          ),
        },
      ])
    : undefined;

  const clickHandler = useCallback(
    (product: Product) => {
      void purchaseNonRedirectProduct(product, false, false, BuyRobuxPageSectionType.ProductsList);
    },
    [purchaseNonRedirectProduct],
  );

  return (
    <Section {...getSectionTrackingProps(sectionBase)}>
      <div className="flex flex-col self-stretch">
        <div className="flex flex-row justify-between items-center self-stretch">
          <SectionHeader>{translate(sectionBase.sectionHeaderTranslationKey)}</SectionHeader>
          {daysLeft.success && <ExpirationBadge daysLeft={daysLeft.value} />}
        </div>
        {bodyTranslationKey && (
          <SectionSubHeader
            className={classNames({ "text-body-small": !atLeastOneProductHasBonusAmount })}
          >
            {/* This span is needed here as a wrapper because SectionSubHeader uses flex related styles which affects the spacing around <a/> tag in the below translation */}
            <span>
              {bodyWithTermsLink && bodyWithTermsLink.length > 0
                ? bodyWithTermsLink
                : translate(bodyTranslationKey)}
            </span>
          </SectionSubHeader>
        )}
      </div>
      <SectionBody isPrimary={isPrimary}>
        <SectionBodyProductList
          onProductClick={clickHandler}
          products={sectionBase.products ?? []}
        />
      </SectionBody>
    </Section>
  );
}
