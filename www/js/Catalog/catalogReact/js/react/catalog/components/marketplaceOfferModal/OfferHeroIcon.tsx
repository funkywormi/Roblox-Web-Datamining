import React, { useEffect, useRef } from 'react';
import { Icon } from '@rbx/foundation-ui';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import parseRbxAssetId from '../../utils/parseRbxAssetId';
import { marketplaceOfferIconToFoundationName } from '../../utils/marketplaceOfferIcon';

type OfferHeroIconProps = {
  modalHeroIcon?: string;
};

export const OfferHeroIcon = ({ modalHeroIcon }: OfferHeroIconProps): JSX.Element | null => {
  const assetId = parseRbxAssetId(modalHeroIcon);
  const foundationIconName = marketplaceOfferIconToFoundationName(modalHeroIcon);
  const iconRef = useRef<HTMLSpanElement>(null);

  // eslint-disable-next-line no-console
  console.log('[Catalog.MarketplaceOfferModal] Offer hero icon', {
    modalHeroIcon,
    rbxAssetId: assetId ?? null,
    foundationIconName: foundationIconName ?? null,
    usingFoundationIcon: !!foundationIconName
  });

  useEffect(() => {
    if (!foundationIconName) {
      return;
    }

    const iconEl = iconRef.current?.querySelector<HTMLElement>('.icon') ?? iconRef.current;
    if (!iconEl) {
      // eslint-disable-next-line no-console
      console.warn('[Catalog.MarketplaceOfferModal] Foundation icon element not found in DOM');
      return;
    }

    const computed = window.getComputedStyle(iconEl);
    const svgVar = computed.getPropertyValue('--svg').trim();
    const maskImage = computed.maskImage || computed.webkitMaskImage;

    // eslint-disable-next-line no-console
    console.log('[Catalog.MarketplaceOfferModal] Foundation icon computed style', {
      foundationIconName,
      className: iconEl.className,
      hasSvgVar: !!svgVar && svgVar !== 'none',
      svgVarPreview: svgVar ? `${svgVar.slice(0, 40)}...` : '(empty)',
      maskImage: maskImage || '(none)',
      backgroundColor: computed.backgroundColor,
      width: computed.width,
      height: computed.height,
      // If hasSvgVar is false / maskImage is none, the icon class was purged
      // by Tailwind (dynamic class not seen by the content scanner).
      likelyPurged: !svgVar || svgVar === 'none' || !maskImage || maskImage === 'none'
    });
  }, [foundationIconName]);

  if (!assetId && !foundationIconName) {
    return null;
  }

  return (
    <div className='marketplace-offer-modal-hero' aria-hidden>
      <div className='marketplace-offer-modal-hero-frame'>
        {foundationIconName ? (
          <span ref={iconRef} className='marketplace-offer-modal-hero-icon-wrapper'>
            <Icon
              name={foundationIconName}
              size='XLarge'
              className='marketplace-offer-modal-hero-icon'
            />
          </span>
        ) : (
          <Thumbnail2d
            type={ThumbnailTypes.assetThumbnail}
            targetId={Number(assetId)}
            size={DefaultThumbnailSize}
          />
        )}
      </div>
    </div>
  );
};

export default OfferHeroIcon;
