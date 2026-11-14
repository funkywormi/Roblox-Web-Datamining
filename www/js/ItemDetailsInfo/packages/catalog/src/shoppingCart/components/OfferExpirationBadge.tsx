import React from "react";
import { Badge } from "@rbx/foundation-ui";
import { formatOfferExpirationLabel } from "@rbx/www-common/offer-expiration";
import { catalogTranslations } from "../services/translationService";

export type OfferExpirationBadgeProps = {
  expirationTimeUtc?: string;
};

/**
 * Clock pill shown beside a marketplace offer when cart-pricing returns
 * `expirationTimeUtc` (e.g. "Ends Dec 9").
 */
export function OfferExpirationBadge({
  expirationTimeUtc,
}: OfferExpirationBadgeProps): React.ReactElement | null {
  const label = formatOfferExpirationLabel(expirationTimeUtc, catalogTranslations.labelEndsDate);

  if (!label) {
    return null;
  }

  return (
    <Badge
      variant="Neutral"
      size="Small"
      icon="icon-regular-clock"
      className="bg-surface-0"
      label={label}
      data-testid="offer-expiration-badge"
    />
  );
}

export default OfferExpirationBadge;
