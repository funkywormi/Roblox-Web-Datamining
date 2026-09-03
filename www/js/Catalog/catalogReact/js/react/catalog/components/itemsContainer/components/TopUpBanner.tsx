import React from 'react';
import { WithTranslationsProps, withTranslations } from 'react-utilities';
import { TopUp } from '../../../constants/types';
import TopUpGiftCardBackDec from '../../../../../../images/topUp/TopUpGiftCardBackDec.png';
import TopUpGiftCardFrontDec from '../../../../../../images/topUp/TopUpGiftCardFrontDec.png';
import TopUpChest from '../../../../../../images/topUp/TopUpChest.png';
import { CatalogQuery } from '../../../hooks/catalogQuery/catalogQuery.types';
import { translationConfig } from '../../../translation.config';

export type TopUpBannerProps = {
  topUp: TopUp;
  catalogQuery: CatalogQuery;
  onTopUpClear: () => void;
};

function TopUpBanner(props: TopUpBannerProps & WithTranslationsProps): JSX.Element | null {
  const { topUp, catalogQuery, onTopUpClear, translate } = props;

  const showTopUpComponent = !!(
    topUp.featureEnabled &&
    topUp.showTopUp &&
    topUp.robuxMinThreshold !== undefined &&
    topUp.robuxMaxThreshold !== undefined &&
    topUp.currentUserBalance !== undefined &&
    topUp.currentUserBalance > topUp.robuxMinThreshold &&
    topUp.currentUserBalance <= topUp.robuxMaxThreshold &&
    catalogQuery.category &&
    topUp.displayCategories?.includes(catalogQuery.category.categoryId) &&
    catalogQuery.keyword === undefined &&
    !catalogQuery.topics?.length &&
    topUp.headerText
  );

  const closeTopUp = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onTopUpClear();
    e.stopPropagation();
  };

  if (!showTopUpComponent) {
    return null;
  }

  return (
    <div className='top-up-container'>
      {topUp.giftCard ? (
        <div
          className='gift-card'
          onClick={() => {
            window.location.href = topUp.buttonUrl;
          }}
          onKeyPress={e => {
            if (e.key === 'Enter' || e.key === 'Space') {
              window.location.href = topUp.buttonUrl;
            }
          }}
          tabIndex={0}
          role='link'>
          <div className='top-up-background' />
          <img src={TopUpGiftCardBackDec} className='top-up-gift-card-back' alt='' />
          <img src={TopUpGiftCardFrontDec} className='top-up-gift-card-front' alt='' />
          <div className='top-up-body'>
            <h1 className='top-up-header'>{translate(topUp.headerText)}</h1>
            <div className='top-up-message'>{translate(topUp.messageText)}</div>
            <a className='top-up-button btn-cta-md' href={topUp.buttonUrl} target='_self'>
              {translate(topUp.buttonText)}
            </a>
          </div>
          <button
            type='button'
            aria-label='Close top up'
            className='top-up-close-background transparent-button'
            onClick={closeTopUp}
          />
          <button
            type='button'
            aria-label='Close top up'
            className='top-up-close icon-close transparent-button'
            onClick={closeTopUp}
          />
        </div>
      ) : (
        <div
          className='robux'
          onClick={() => {
            window.location.href = topUp.buttonUrl;
          }}
          onKeyPress={e => {
            if (e.key === 'Enter' || e.key === 'Space') {
              window.location.href = topUp.buttonUrl;
            }
          }}
          tabIndex={0}
          role='link'>
          <div className='top-up-background' />
          <div className='top-up-robux' />
          <img src={TopUpChest} className='top-up-chest' alt='' />
          <div className='top-up-body'>
            <h1 className='top-up-header'>{translate(topUp.headerText || '')}</h1>
            <div className='top-up-message'>{translate(topUp.messageText)}</div>
            <a className='top-up-button btn-cta-md' href={topUp.buttonUrl} target='_self'>
              {translate(topUp.buttonText)}
            </a>
          </div>
          <button
            type='button'
            aria-label='Close top up'
            className='top-up-close-background transparent-button'
            onClick={closeTopUp}
          />
          <button
            type='button'
            aria-label='Close top up'
            className='top-up-close icon-close transparent-button'
            onClick={closeTopUp}
          />
        </div>
      )}
    </div>
  );
}

export default withTranslations(TopUpBanner, translationConfig);
