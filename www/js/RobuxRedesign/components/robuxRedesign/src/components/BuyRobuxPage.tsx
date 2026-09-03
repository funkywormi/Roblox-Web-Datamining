import { ErrorBoundary } from "@sentry/react";
import classNames from "classnames";
import { ReactElement, useCallback, useContext, useMemo } from "react";
import { PersonalizedBonus } from "./sectionVariants/PersonalizedBonus";
import { ProductList } from "./sectionVariants/ProductList";
import { Recommended } from "./sectionVariants/Recommended";
import { GiftCard } from "./sectionVariants/GiftCard";
import { RobuxGift } from "./sectionVariants/RobuxGift";
import { SubscriptionV2 } from "./sectionVariants/SubscriptionV2";
import { Banner } from "./Banner";
import { FAQ } from "./FAQ";
import { Header } from "./Header";
import { BuyRobuxPageContext } from "../contexts/BuyRobuxPageContext";
import { Section } from "../types/buyRobuxPageData";
import { trackCriticalError } from "../observability";
import { isInApp } from "../utils/platform";
import { RedirectProductList } from "./sectionVariants/RedirectProductList";
import { LimitedTimeBonusSection } from "./sectionVariants/LimitedTimeBonusSection";

export function BuyRobuxPage() {
  const { buyRobuxPageData } = useContext(BuyRobuxPageContext);

  const transfersSection = useMemo(
    () => buyRobuxPageData.sections.find(s => s.transfers),
    [buyRobuxPageData.sections],
  );
  const transfers = transfersSection?.transfers;

  const robuxGiftSection = useMemo(
    () => buyRobuxPageData.sections.find(s => s.robuxGift),
    [buyRobuxPageData.sections],
  );

  const onError = useCallback((error: unknown) => {
    trackCriticalError("SectionReactCrash", null, error);
  }, []);

  const reduceSections = useCallback(
    (sections: ReactElement[], section: Section) => {
      // Skip the sections that don't render a body section. `robuxGift` is
      // header-rendered too, but only when transfers is present.
      if (section.transfers || (transfers != null && section.robuxGift)) {
        return sections;
      }

      // We have to use sections.length to determine if this is the first section
      // because the transfers section occupies idx=0 in the input but renders into
      // <Header> instead of the body, so `idx === 0` isn't reliable here.
      // `sections` is the reducer accumulator — empty until a real body
      // section is appended.
      const isPrimary = sections.length === 0;
      const baseProps = {
        isPrimary,
        sectionBase: section,
      };
      const {
        giftCard,
        limitedTimeBonus,
        personalizedBonus,
        productsList,
        recommended,
        robuxGift,
        sectionHeaderTranslationKey,
        subscriptionV2,
        redirect,
      } = section;

      let element: ReactElement | undefined;

      if (redirect) {
        element = <RedirectProductList {...baseProps} redirectOptions={redirect} />;
      } else if (productsList) {
        element = <ProductList {...baseProps} />;
      } else if (recommended) {
        element = <Recommended {...baseProps} recommended={recommended} />;
      } else if (personalizedBonus) {
        element = <PersonalizedBonus {...baseProps} personalizedBonus={personalizedBonus} />;
      } else if (robuxGift) {
        element = <RobuxGift {...baseProps} robuxGift={robuxGift} />;
      } else if (subscriptionV2) {
        // TODO in REV-2970: reconcile whether or not these benefits should be
        // defined strictly on the backend or can be composed on the frontend.
        subscriptionV2.products.forEach(product => {
          product.benefits?.forEach(benefit => {
            if (benefit.plusDiscountSubscriptionBenefits) {
              // eslint-disable-next-line no-param-reassign
              benefit.plusDiscountSubscriptionBenefits.periodType = product.periodType;
            }
          });
        });
        element = <SubscriptionV2 {...baseProps} subscriptionV2={subscriptionV2} />;
      } else if (giftCard) {
        element = <GiftCard {...baseProps} giftCard={giftCard} />;
      } else if (limitedTimeBonus) {
        element = <LimitedTimeBonusSection {...baseProps} limitedTimeBonus={limitedTimeBonus} />;
      } else {
        console.error(`Unknown section type: ${sectionHeaderTranslationKey}`);
        return sections;
      }

      return [
        ...sections,
        // limit the blast radius of uncaught React errors to individual sections
        <ErrorBoundary key={sectionHeaderTranslationKey} onError={onError}>
          {element}
        </ErrorBoundary>,
      ];
    },
    [onError, transfers],
  );

  const sections = useMemo(
    () => buyRobuxPageData.sections.reduce<ReactElement[]>(reduceSections, []),
    [buyRobuxPageData.sections, reduceSections],
  );

  return (
    <div className="flex flex-col items-center">
      <div className="buy-robux-background" />
      <Header transfersSection={transfersSection} robuxGiftSection={robuxGiftSection} />
      <div
        className={classNames("buy-robux-content padding-x-large small:padding-x-xlarge", {
          "is-in-app": isInApp,
        })}
      >
        <Banner transfers={transfers} />
        {sections}
        <FAQ />
      </div>
    </div>
  );
}
