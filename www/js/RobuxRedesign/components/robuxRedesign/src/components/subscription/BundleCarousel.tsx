import { useEffect } from "react";

import type { DeviceMeta } from "@rbx/core-scripts/meta/device";
import { useTheme } from "@rbx/core-scripts/react";
import { Carousel } from "@rbx/payments/components/carousel";

import type { TrackSubscriptionV2SubscribeClickArgs } from "../../hooks/subscriptionV2/useSubscriptionV2Tracking";
import type { SectionSubscriptionV2 } from "../../types/buyRobuxPageData";

import { SubscriptionTile } from "./SubscriptionTile";
import { UseRedirectResult } from "../../hooks/useRedirect";

type BundleCarouselProps = {
  subscriptionV2: SectionSubscriptionV2;
  deviceMeta: DeviceMeta;
  isPrimary: boolean;
  onSubscriptionSectionViewShown: () => void;
  onSubscriptionSubscribeClick: (args: TrackSubscriptionV2SubscribeClickArgs) => void;
  paymentSessionId?: string;
  redirect?: UseRedirectResult;
};

export function BundleCarousel({
  subscriptionV2,
  deviceMeta,
  isPrimary,
  onSubscriptionSectionViewShown,
  onSubscriptionSubscribeClick,
  paymentSessionId,
  redirect,
}: BundleCarouselProps) {
  const { products } = subscriptionV2;

  const inverseThemeClass = useTheme() === "dark" ? "light-theme" : "dark-theme";

  // Section-shown fires once per carousel mount and avoids
  // double-counting impressions when the user swipes between tiers.
  useEffect(() => {
    if (products.length > 0) {
      onSubscriptionSectionViewShown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <Carousel
      ariaLabel="Roblox Plus subscription tiers"
      className="self-stretch bleed-section-padding"
    >
      <div className={inverseThemeClass}>
        <Carousel.PrevButton ariaLabel="Previous tier" className="hidden medium:flex" />
      </div>

      <Carousel.Track className="bleed-section-padding-track bundle-carousel-track-cap">
        {products.map((product, index) => (
          <Carousel.Item
            className="flex flex-col width-[313px] medium:width-[242px]"
            key={product.subscriptionProductId}
          >
            <SubscriptionTile
              deviceMeta={deviceMeta}
              isEmphasized={isPrimary && index === 0}
              isPrimary={isPrimary}
              onSubscribeClick={onSubscriptionSubscribeClick}
              paymentSessionId={paymentSessionId}
              product={product}
              redirect={redirect}
            />
          </Carousel.Item>
        ))}
      </Carousel.Track>
      <div className={inverseThemeClass}>
        <Carousel.NextButton ariaLabel="Next tier" className="hidden medium:flex" />
      </div>

      <Carousel.Indicator className="padding-top-medium medium:hidden" />
    </Carousel>
  );
}

export default BundleCarousel;
