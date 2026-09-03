import { type KeyboardEvent, useCallback, useContext, useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { LearnMoreSheet, RobloxSubscriptionWidget } from "@rbx/subscriptions-common";
import { Icon, SheetRoot } from "@rbx/foundation-ui";

import { useTranslation } from "@rbx/core-scripts/react";
import { useSubscriptionV2TrackingFields } from "../../hooks/subscriptionV2/useSubscriptionV2TrackingFields";
import { SectionBase, SectionSubscriptionV2 } from "../../types/buyRobuxPageData";
import { Section, SectionHeader, SectionBody, BaseSectionProps } from "../sections/Section";
import { trackCounter } from "../../observability";
import { getSectionTrackingProps } from "../../hooks/useScrollTracking";
import { BundleCarousel } from "../subscription/BundleCarousel";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";

type SubscriptionV2Props = BaseSectionProps & {
  sectionBase: SectionBase;
  subscriptionV2: SectionSubscriptionV2;
};

const LEARN_MORE_HREF = "/plus";

const HEADER_LEARN_MORE_CLASSNAME =
  "text-label-medium text-default [text-decoration:underline] [text-underline-position:from-font]";

export function SubscriptionV2({ isPrimary, sectionBase, subscriptionV2 }: SubscriptionV2Props) {
  const { translate } = useTranslation();
  const { paymentSession, breakpoint, redirect } = useContext(BuyRobuxPageContext);
  const {
    trackSubscriptionV2Shown,
    trackSubscriptionV2SubscribeClick,
    trackSubscriptionV2LearnMoreClick,
  } = useSubscriptionV2TrackingFields();
  const deviceMeta = useMemo(() => getDeviceMeta(), []);
  const [isLearnMoreSheetOpen, setIsLearnMoreSheetOpen] = useState(false);

  const isInApp = Boolean(deviceMeta?.isInApp);

  const handleLearnMoreSelect = useCallback(() => {
    trackSubscriptionV2LearnMoreClick();
    if (isInApp) {
      setIsLearnMoreSheetOpen(true);
    }
  }, [isInApp, trackSubscriptionV2LearnMoreClick]);

  const handleLearnMoreSheetOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      setIsLearnMoreSheetOpen(false);
    }
  }, []);

  const handleLearnMoreKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleLearnMoreSelect();
      }
    },
    [handleLearnMoreSelect],
  );

  const { products } = subscriptionV2;
  const primaryProduct = products.at(0);

  const isFreeTrial = useMemo(
    () => products.some(p => p.offers?.some(o => Boolean(o.freeTrial)) ?? false),
    [products],
  );

  const willRender = primaryProduct != null && deviceMeta != null;

  useEffect(() => {
    if (!willRender) {
      return;
    }
    trackCounter("SubscriptionV2SectionShown", {
      variant: products.length > 1 ? "carousel" : "single",
      tierCount: String(products.length),
      isFreeTrial: String(isFreeTrial),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only section impression (matches BundleCarousel)
  }, []);

  const handleSubscriptionSectionViewShown = useCallback(() => {
    trackSubscriptionV2Shown(isFreeTrial);
  }, [trackSubscriptionV2Shown, isFreeTrial]);

  const handleSubscriptionSubscribeClick = useCallback(() => {
    trackSubscriptionV2SubscribeClick({
      isFreeTrial: isFreeTrial,
      productId: primaryProduct?.subscriptionProductId ?? "Unknown",
      isRedirect: false,
    });
  }, [trackSubscriptionV2SubscribeClick, isFreeTrial, primaryProduct]);

  if (!primaryProduct) {
    trackCounter("SubscriptionV2NoPrimaryProduct");
    return null;
  }

  if (!deviceMeta) {
    trackCounter("SubscriptionV2NoDeviceMeta");
    return null;
  }

  const learnMoreLabel = translate("Label.Learnmore");

  const hasMultipleTiers = products.length > 1;

  return (
    <Section data-testid="section-subscription-v2" {...getSectionTrackingProps(sectionBase)}>
      <SectionHeader>
        <div className="flex flex-row width-full justify-between items-center">
          <div className="flex flex-row items-center gap-x-small medium:gap-x-medium">
            <Icon
              name="icon-regular-roblox-plus"
              size={breakpoint.isAboveInclusive("medium") ? "XLarge" : "Large"}
            />
            {translate(sectionBase.sectionHeaderTranslationKey)}
          </div>
          {/* Mobile-only "Learn more" affordance. Desktop renders the same
              action as a wider button next to the subscribe CTA inside the
              widget. In-app webviews can't reliably navigate back, so the
              affordance is a span styled like the link that opens a sheet
              (rather than a <button> whose UA chrome would clash with the
              inline link styling). */}
          {isInApp ? (
            <span
              className={classNames(HEADER_LEARN_MORE_CLASSNAME, "cursor-pointer", {
                "medium:[display:none]": !hasMultipleTiers,
              })}
              data-testid="header-learn-more-trigger"
              onClick={handleLearnMoreSelect}
              onKeyDown={handleLearnMoreKeyDown}
              role="button"
              tabIndex={0}
            >
              {learnMoreLabel}
            </span>
          ) : (
            <a
              className={classNames(HEADER_LEARN_MORE_CLASSNAME, {
                "medium:[display:none]": !hasMultipleTiers,
              })}
              data-testid="header-learn-more-link"
              href={LEARN_MORE_HREF}
              onClick={trackSubscriptionV2LearnMoreClick}
            >
              {learnMoreLabel}
            </a>
          )}
        </div>
      </SectionHeader>
      {hasMultipleTiers ? (
        <BundleCarousel
          deviceMeta={deviceMeta}
          isPrimary={Boolean(isPrimary)}
          onSubscriptionSectionViewShown={handleSubscriptionSectionViewShown}
          onSubscriptionSubscribeClick={trackSubscriptionV2SubscribeClick}
          paymentSessionId={paymentSession?.id}
          redirect={redirect}
          subscriptionV2={subscriptionV2}
        />
      ) : (
        <SectionBody isPrimary={isPrimary}>
          <div className="self-stretch medium:flex-row medium:justify-between">
            <RobloxSubscriptionWidget
              deviceMeta={deviceMeta}
              isPrimary={Boolean(isPrimary)}
              onSubscriptionSectionViewShown={handleSubscriptionSectionViewShown}
              onSubscriptionSubscribeClick={handleSubscriptionSubscribeClick}
              subscriptionV2={subscriptionV2}
              onLearnMoreClick={handleLearnMoreSelect}
              learnMoreHref={isInApp ? undefined : LEARN_MORE_HREF}
              paymentSessionId={paymentSession?.id}
            />
          </div>
        </SectionBody>
      )}
      {isInApp && (
        <SheetRoot open={isLearnMoreSheetOpen} onOpenChange={handleLearnMoreSheetOpenChange}>
          <LearnMoreSheet />
        </SheetRoot>
      )}
    </Section>
  );
}
