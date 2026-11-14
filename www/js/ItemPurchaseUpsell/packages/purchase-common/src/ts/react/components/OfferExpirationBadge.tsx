import React from 'react';
import { Badge } from '@rbx/foundation-ui';
import { formatOfferExpirationLabel } from '@rbx/www-common/offer-expiration';
import type { PurchaseTranslate } from '../itemPurchase/useTranslate';

export type OfferExpirationBadgeProps = {
  expirationTimeUtc?: string;
  translate: PurchaseTranslate;
  /** Included in the offer checkbox's accessible name when the badge renders. */
  id?: string;
};

/**
 * Clock pill shown beside a marketplace offer when cart-pricing returns
 * `expirationTimeUtc` (e.g. "Ends Dec 9").
 */
export function OfferExpirationBadge({
  expirationTimeUtc,
  translate,
  id
}: OfferExpirationBadgeProps): React.ReactElement | null {
  const label = formatOfferExpirationLabel(
    expirationTimeUtc,
    date => translate('Label.EndsDate', { date }) || `Ends ${date}`
  );

  if (!label) {
    return null;
  }

  return (
    <Badge
      id={id}
      variant='Neutral'
      size='Small'
      icon='icon-regular-clock'
      className='bg-surface-0 shrink-0'
      label={label}
      data-testid='offer-expiration-badge'
    />
  );
}

export default OfferExpirationBadge;
