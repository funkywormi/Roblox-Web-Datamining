import { useTranslation } from "@rbx/core-scripts/react";
import { Link } from "@rbx/foundation-ui";

import { getPlusUpsellCtaKey } from "../../utils/plusUpsell";

import type { SubscriptionOffer } from "@rbx/client-subscriptions-api/v2";
import type { FC } from "react";

export type PlusUpsellBannerAppearance = "Outlined" | "Filled";

export type PlusUpsellBannerProps = {
  upsellText: string;
  /** Offers on the Plus product; a free trial switches the CTA to "Try it for free". */
  eligibleOffers?: readonly SubscriptionOffer[];
  /** Hides the CTA until offers land so it never flips from "Subscribe" to the trial copy. */
  isLoading?: boolean;
  appearance?: PlusUpsellBannerAppearance;
  testId?: string;
  onClick: () => void;
};

const containerClassNames: Record<PlusUpsellBannerAppearance, string> = {
  Outlined: "radius-medium stroke-standard stroke-default",
  Filled: "padding-medium bg-shift-200 radius-medium",
};

// Outlined padding is off the token scale.
const OUTLINED_PADDING = { padding: "10px 20px" };

/** One-line Plus upsell with a text CTA; the label follows the viewer's trial eligibility. */
const PlusUpsellBanner: FC<PlusUpsellBannerProps> = ({
  upsellText,
  eligibleOffers,
  isLoading = false,
  appearance = "Filled",
  testId,
  onClick,
}) => {
  const { translate } = useTranslation();

  return (
    <div
      className={`gap-large flex items-center justify-between ${containerClassNames[appearance]}`}
      data-testid={testId}
      style={appearance === "Outlined" ? OUTLINED_PADDING : undefined}
    >
      <span className="text-body-medium content-emphasis">{upsellText}</span>
      <Link
        aria-hidden={isLoading || undefined}
        as="button"
        className="shrink-0"
        size={appearance === "Outlined" ? "Medium" : "Small"}
        style={isLoading ? { visibility: "hidden" } : undefined}
        underline="always"
        onClick={onClick}
      >
        {translate(getPlusUpsellCtaKey(eligibleOffers))}
      </Link>
    </div>
  );
};

export default PlusUpsellBanner;
