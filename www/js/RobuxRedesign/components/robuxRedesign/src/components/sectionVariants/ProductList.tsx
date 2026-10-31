/* eslint-disable no-void */
import { useCallback, useContext } from "react";
import classNames from "classnames";
import { useFullKeyTranslations } from "@rbx/www-common/i18n";
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
import { getExternalLinkProps } from "../../utils/openExternalBrowser";

type ProductListProps = BaseSectionProps & {
  sectionBase: RobuxPageSection;
};

export function ProductList({ isPrimary, sectionBase }: ProductListProps) {
  const { purchaseNonRedirectProduct } = useContext(PurchaseContext);
  const { atLeastOneProductHasBonusAmount, deviceMeta } = useContext(BuyRobuxPageContext);

  const { translateFullKey } = useFullKeyTranslations();
  const bodyTranslationKey = sectionBase.productsList?.bodyTranslationKey;
  const daysLeft = resolveLimitedTimeBonusDaysLeft(
    sectionBase.productsList?.promotionExpirationTimestampMs,
  );

  // The backend swaps this section's body copy for promotional messaging unless the section carries
  // the legal disclosure, so whether the resolved string has the terms-link placeholders varies.
  // The HTML adapter returns null when the terms-link tags are absent, so keep the plain-text
  // fallback for promotional copy that does not include a terms link.
  const bodyWithTermsLink = bodyTranslationKey
    ? translateFullKey.html(bodyTranslationKey, [
        {
          opening: "termsLinkStart",
          closing: "termsLinkEnd",
          render: children => (
            <a {...getExternalLinkProps("/info/terms", deviceMeta)} className="text-link">
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
      <div className="flex flex-col gap-xsmall self-stretch">
        <div className="flex flex-row justify-between items-center self-stretch">
          <SectionHeader>{translateFullKey(sectionBase.sectionHeaderTranslationKey)}</SectionHeader>
          {daysLeft.success && <ExpirationBadge daysLeft={daysLeft.value} />}
        </div>
        {bodyTranslationKey && (
          <SectionSubHeader
            className={classNames({ "text-body-small": !atLeastOneProductHasBonusAmount })}
          >
            {/* This span is needed here as a wrapper because SectionSubHeader uses flex related styles which affects the spacing around <a/> tag in the below translation */}
            <span>{bodyWithTermsLink ?? translateFullKey(bodyTranslationKey)}</span>
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
