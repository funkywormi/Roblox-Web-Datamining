import { type FC, useMemo } from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button } from "@rbx/foundation-ui";
import {
  SubscriptionButton,
  PeriodType as SubscriptionPeriodType,
} from "@rbx/subscriptions-common";
import type { DeviceMeta } from "@rbx/core-scripts/meta/device";
import { getSubscriptionProductTrackingProps } from "../../hooks/useScrollTracking";

import type { PeriodType, SectionSubscriptionV2Product } from "../../types/buyRobuxPageData";
import type { TrackSubscriptionV2SubscribeClickArgs } from "../../hooks/subscriptionV2/useSubscriptionV2Tracking";

import { SubscriptionTileBenefits } from "./SubscriptionTileBenefits";
import { UseRedirectResult } from "../../hooks/useRedirect";

const SECTION_PRODUCT_TYPE_TO_API: Record<string, string> = {
  PRODUCT_TYPE_ROBLOX_PLUS: "Blackbird",
};

function parseRobuxAllowance(robuxAmount: string | undefined): number {
  if (robuxAmount == null) {
    return 0;
  }
  // Protobuf int64 arrives as string; a malformed value falls back to 0.
  const parsed = Number.parseInt(robuxAmount, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseMoneyUnits(value: number | string | undefined): number {
  if (value == null) {
    return 0;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function deriveTileTitle(robuxAllowance: number): string {
  if (robuxAllowance > 0) {
    return `Plus ${String(robuxAllowance)}`;
  }
  return "Roblox Plus";
}

function convertPeriodTypeForTranslation(periodType: PeriodType): SubscriptionPeriodType {
  switch (periodType) {
    case "PERIOD_TYPE_WEEK":
      return "Week";
    case "PERIOD_TYPE_MONTH":
      return "Month";
    case "PERIOD_TYPE_YEAR":
      return "Year";
  }
}

const RedirectButton: FC<{
  href: string;
  onClick: () => void;
  isEmphasized: boolean;
  children: React.ReactNode;
}> = ({ href, onClick, isEmphasized, children }) => {
  return (
    <Button
      as="a"
      className="width-full"
      href={href}
      icon="icon-regular-arrow-up-right-from-square"
      onClick={onClick}
      rel="noreferrer"
      role="button"
      size="Medium"
      target="_blank"
      variant={isEmphasized ? "Emphasis" : "Standard"}
    >
      {children}
    </Button>
  );
};

export type SubscriptionTileProps = {
  product: SectionSubscriptionV2Product;
  deviceMeta: DeviceMeta;
  isEmphasized: boolean;
  isPrimary: boolean;
  onSubscribeClick?: (args: TrackSubscriptionV2SubscribeClickArgs) => void;
  paymentSessionId?: string;
  redirect?: UseRedirectResult;
};

export const SubscriptionTile: FC<SubscriptionTileProps> = ({
  product,
  deviceMeta,
  isEmphasized,
  isPrimary,
  onSubscribeClick,
  paymentSessionId,
  redirect,
}) => {
  const { translate, intl } = useTranslation();

  // Takes global redirect url and modifies for subscription bundle.
  // - Overrides ctx to subscription
  // - Appends type and id
  const redirectHref = useMemo(() => {
    if (!redirect?.url) {
      return "";
    }
    const url = new URL(redirect.url, window.location.origin);
    url.searchParams.set("ctx", "subscription");
    url.searchParams.set("type", "RobloxPlus");
    url.searchParams.set("id", product.subscriptionProductId);
    return `${url.pathname}${url.search}`;
  }, [redirect?.url, product.subscriptionProductId]);

  const apiProductType = SECTION_PRODUCT_TYPE_TO_API[product.subscriptionProductType];
  if (apiProductType == null) {
    return null;
  }

  const robuxAllowance = parseRobuxAllowance(product.robuxAmount);
  const title = deriveTileTitle(robuxAllowance);

  const offers = Array.isArray(product.offers) ? product.offers : [];
  const hasFreeTrial = offers.some(o => o.freeTrial);
  const isRedirect = Boolean(product.isRedirect);

  const price = intl.n(parseMoneyUnits(product.price.units) + (product.price.nanos ?? 0) * 1e-9, {
    style: "currency",
    currency: product.price.currencyCode,
  });
  const strikethroughPrice = product.strikethroughPrice
    ? intl.n(
        parseMoneyUnits(product.strikethroughPrice.units) +
          (product.strikethroughPrice.nanos ?? 0) * 1e-9,
        {
          style: "currency",
          currency: product.strikethroughPrice.currencyCode,
        },
      )
    : null;

  const buttonLabel = hasFreeTrial
    ? translate("Action.TryItForFree")
    : translate("Action.PricePerMonth", {
        price: price,
        periodType: convertPeriodTypeForTranslation(product.periodType),
      });

  return (
    <div
      className={classNames(
        "radius-large padding-medium flex flex-col items-stretch justify-between gap-small height-full",
        {
          "bg-surface-100": isPrimary,
          "stroke-standard": !isPrimary,
          "stroke-default": !isPrimary,
        },
      )}
      data-testid={`subscription-tile-${product.subscriptionProductId}`}
      {...getSubscriptionProductTrackingProps(
        product.subscriptionProductId,
        product.subscriptionProductType,
      )}
    >
      <div className="flex flex-row items-center justify-between gap-large">
        <h3 className="text-label-large content-emphasis text-truncate-end">{title}</h3>
        <div className="flex flex-row items-center justify-end gap-small">
          {strikethroughPrice && (
            <span className="text-title-medium text-no-wrap content-muted strike-through">
              {strikethroughPrice}
            </span>
          )}
          <span className="text-title-medium content-emphasis text-no-wrap">{price}</span>
        </div>
      </div>

      <SubscriptionTileBenefits product={product} robuxAllowance={robuxAllowance} />

      {isRedirect ? (
        <RedirectButton
          href={redirectHref}
          onClick={() => {
            onSubscribeClick?.({
              isFreeTrial: false,
              productId: product.subscriptionProductId,
              isRedirect: true,
            });
            redirect?.refreshAuthTicket();
          }}
          isEmphasized={isEmphasized}
        >
          {buttonLabel}
        </RedirectButton>
      ) : (
        <SubscriptionButton
          className="width-full"
          deviceMeta={deviceMeta}
          paymentSessionId={paymentSessionId}
          productId={product.subscriptionProductId}
          productType={apiProductType}
          size="Medium"
          trackSubscriptionButtonClick={() => {
            onSubscribeClick?.({
              isFreeTrial: hasFreeTrial,
              productId: product.subscriptionProductId,
              isRedirect: false,
            });
          }}
          variant={isEmphasized ? "Emphasis" : "Standard"}
        >
          {buttonLabel}
        </SubscriptionButton>
      )}
    </div>
  );
};

export default SubscriptionTile;
