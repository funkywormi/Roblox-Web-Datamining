import { type FC } from "react";
import { Icon } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

import type { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";
import type { SectionSubscriptionV2Product } from "../../types/buyRobuxPageData";

type BenefitContext = {
  discountPercent: string;
  // Locale-formatted Robux allowance (e.g. "1,000" in en-US, "1.000" in de-DE).
  // Plain decimal grouping; no currency or unit suffix is applied here so the
  // translation string owns the surrounding copy.
  robuxAmount: string;
  // Locale-formatted strikethrough price (e.g. "$9.98"). Null when the server
  // did not return a strikethroughPrice — in which case the BetterValue row
  // is suppressed.
  oldAmount: string | null;
  // Locale-formatted bundle price (e.g. "$8.99").
  newAmount: string;
};

type BenefitConfig = {
  iconName: TTailwindIconClass;
  translationKey: string;
  getParams?: (ctx: BenefitContext) => Record<string, string>;
  // Optional predicate; when provided and false, the row is suppressed.
  isVisible?: (ctx: BenefitContext) => boolean;
};

// Benefits shown for the baseline Roblox Plus tier (no Robux allowance).
const BASE_BENEFITS: readonly BenefitConfig[] = [
  {
    iconName: "icon-regular-tag",
    translationKey: "Description.Benefit.DiscountBase",
    getParams: ({ discountPercent }) => ({ discountPercent }),
  },
  {
    iconName: "icon-regular-controller",
    translationKey: "Description.Benefit.PrivateServersExpandedTitle",
  },
  {
    iconName: "icon-regular-robux",
    translationKey: "Description.Benefit.RobuxTransfers",
  },
];

// Benefits shown for bundled tiers (Plus + monthly Robux allowance). Order is
// significant: Plus benefits banner, then the per-month Robux allowance, then
// the strikethrough "value" line.
const BUNDLED_BENEFITS: readonly BenefitConfig[] = [
  {
    iconName: "icon-regular-roblox-plus",
    translationKey: "Description.Benefit.AllPlus.V2",
  },
  {
    iconName: "icon-regular-robux",
    translationKey: "Description.Benefit.RobuxAllowance",
    getParams: ({ robuxAmount }) => ({ amount: robuxAmount }),
  },
  {
    iconName: "icon-regular-pig",
    translationKey: "Description.Benefit.BetterValue.V2",
    // Suppress when the server did not provide a strikethrough price; a
    // "value for value" line with no anchor would be meaningless.
    isVisible: ({ oldAmount }) => oldAmount != null,
    getParams: ({ oldAmount }) => ({
      oldAmount: oldAmount ?? "",
    }),
  },
];

type TileBenefitRowProps = {
  iconName: TTailwindIconClass;
  benefit: string;
};

const TileBenefitRow: FC<TileBenefitRowProps> = ({ iconName: icon, benefit }) => (
  <li className="flex flex-row items-center gap-medium medium:gap-large">
    <Icon className="size-[20px]" name={icon} size="Medium" />
    <span className="text-body-medium content-default">{benefit}</span>
  </li>
);

export type SubscriptionTileBenefitsProps = {
  product: SectionSubscriptionV2Product;
  robuxAllowance: number;
};

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

/**
 * Renders the bullet list of benefits for a Roblox Plus tile.
 *
 * Benefits are hard-coded on the client (one preset for the baseline tier and
 * one for bundled Robux-allowance tiers). Backend-driven benefits would
 * otherwise require service-contract changes across multiple services every
 * time copy or icons evolve. The only server-driven values we still read are
 * the discount percentage (sourced from `product.benefits[*]
 * .plusDiscountSubscriptionBenefits.discountPercentage`), and — for the
 * bundle "BetterValue" line — the bundle price + strikethrough price.
 */
export const SubscriptionTileBenefits: FC<SubscriptionTileBenefitsProps> = ({
  product,
  robuxAllowance,
}) => {
  const { translate, intl } = useTranslation();

  const rawDiscountPercent =
    product.benefits?.find(b => b.plusDiscountSubscriptionBenefits)
      ?.plusDiscountSubscriptionBenefits?.discountPercentage ?? 0;
  const discountPercent = intl.n(rawDiscountPercent / 100, {
    style: "percent",
    maximumFractionDigits: 0,
  });

  const newAmount = intl.n(
    parseMoneyUnits(product.price.units) + (product.price.nanos ?? 0) * 1e-9,
    {
      style: "currency",
      currency: product.price.currencyCode,
    },
  );
  const oldAmount = product.strikethroughPrice
    ? intl.n(
        parseMoneyUnits(product.strikethroughPrice.units) +
          (product.strikethroughPrice.nanos ?? 0) * 1e-9,
        {
          style: "currency",
          currency: product.strikethroughPrice.currencyCode,
        },
      )
    : null;

  // intl.n with no `style` does locale-aware decimal grouping ("1,000" in
  // en-US, "1.000" in de-DE). The Robux glyph itself is owned by the
  // translation string, not appended here.
  const formattedRobuxAmount = intl.n(robuxAllowance);

  const configs = robuxAllowance > 0 ? BUNDLED_BENEFITS : BASE_BENEFITS;
  const ctx: BenefitContext = {
    discountPercent,
    robuxAmount: formattedRobuxAmount,
    oldAmount,
    newAmount,
  };

  return (
    <ul
      className="flex flex-col gap-medium padding-y-small"
      // foundation-tailwind ships no `list-*` utilities; reset inline.
      style={{ listStyle: "none", paddingInlineStart: 0, marginBlock: 0 }}
    >
      {configs
        .filter(c => c.isVisible?.(ctx) ?? true)
        .map(({ iconName, translationKey, getParams }, index) => (
          <TileBenefitRow
            key={`${iconName}-${String(index)}`}
            benefit={translate(translationKey, getParams?.(ctx))}
            iconName={iconName}
          />
        ))}
    </ul>
  );
};

export default SubscriptionTileBenefits;
