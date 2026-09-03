import React from 'react';
import classNames from 'classnames';
import { Icon } from '@rbx/foundation-ui';
import EmbeddableText from '../EmbeddableText';
import { marketplaceOfferIconToFilledFoundationName } from '../../utils/marketplaceOfferIcon';
import { useMarketplaceOfferContext } from './MarketplaceOfferContext';

type MarketplaceOfferBannerProps = {
  className?: string;
};

const MarketplaceOfferBanner = ({ className }: MarketplaceOfferBannerProps): JSX.Element | null => {
  const {
    offer,
    showOfferBanner,
    dismissOfferBanner,
    openOfferModal
  } = useMarketplaceOfferContext();

  const text = offer?.localizedText?.trim();
  if (!offer || !showOfferBanner || !text) {
    return null;
  }

  const iconName = marketplaceOfferIconToFilledFoundationName(offer.icon);

  const handleDismiss = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Don't let the dismiss click bubble up and re-open the modal.
    event.stopPropagation();
    dismissOfferBanner();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openOfferModal();
    }
  };

  return (
    <div
      className={classNames('marketplace-offer-banner', className)}
      role='button'
      tabIndex={0}
      onClick={openOfferModal}
      onKeyDown={handleKeyDown}>
      {iconName && <Icon name={iconName} size='Medium' className='marketplace-offer-banner-icon' />}
      <span className='marketplace-offer-banner-text'>
        <EmbeddableText text={text} />
      </span>
      <button
        type='button'
        className='marketplace-offer-banner-dismiss'
        aria-label='Dismiss'
        onClick={handleDismiss}>
        <Icon name='icon-regular-x' size='Medium' />
      </button>
    </div>
  );
};

export default MarketplaceOfferBanner;
