/* eslint-disable react/jsx-no-literals */
import React, { useMemo } from 'react';
import * as itemPurchase from 'roblox-item-purchase';
import { createSystemFeedback } from 'react-style-guide';
import { AccessManagementUpsellV2Service } from 'Roblox';
import { TItemPricing, TItemPurchaseParams } from '../constants/types';
import { TItemDetailsInfoBodyProps } from './ItemDetailsInfoBody';
import { catalogTranslations, itemTranslations } from '../services/translationService';
import { hrefs } from '../constants/urlConfigs';

type TUnathentictedPurchaseButtonProps = TItemDetailsInfoBodyProps & {
  itemPricingInfo: TItemPricing;
};

type TPurchaseButtonProps = {
  itemPurchaseParams: TItemPurchaseParams | null;
  label?: React.ReactNode;
  onBuyButtonClick?: () => void;
  // Overrides the default primary (btn-growth-lg) styling, e.g. to render a
  // secondary "Rent" button alongside the primary "Buy" button.
  buttonClassName?: string;
};

const { createItemPurchase } = itemPurchase;

export function startFacialAgeEstimation(onSuccess?: () => void): void {
  if (!window.Roblox?.AccessManagementUpsellV2Service) return;
  AccessManagementUpsellV2Service.startAccessManagementUpsell({
    featureName: 'TriggerFacialAgeEstimationRecourse',
    namespace: 'account_identity/AgeCheck',
    isAsyncCall: false,
    featureSpecificData: {
      context: 'avatar-marketplace',
      source: 'item-details-buy-button'
    }
  })
    .then(success => {
      if (success) {
        onSuccess?.();
      }
    })
    .catch(err => {
      // eslint-disable-next-line no-console
      console.error('FAE upsell error', err);
    });
}

type TFacialAuthVerifyButtonProps = {
  label: React.ReactNode;
  itemName: string;
};

export function FacialAuthVerifyButton({
  label,
  itemName
}: TFacialAuthVerifyButtonProps): JSX.Element {
  const [SystemFeedback, systemFeedbackService] = useMemo(() => createSystemFeedback(), []);

  const handleClick = (): void => {
    startFacialAgeEstimation(() => {
      systemFeedbackService.loading(catalogTranslations.messageAgeCheckCompleteInventory(itemName));
      // Give the user a moment to read the toast, then refresh so the page
      // reflects the new inventory/eligibility state.
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    });
  };

  return (
    <React.Fragment>
      <SystemFeedback />
      <button
        className='shopping-cart-buy-button btn-growth-lg PurchaseButton facial-auth-verify-button'
        type='button'
        onClick={handleClick}>
        {label}
      </button>
    </React.Fragment>
  );
}

export function UnathentictedPurchaseButton({
  itemPricingInfo,
  itemDetails
}: TUnathentictedPurchaseButtonProps): JSX.Element {
  if (itemPricingInfo.priceDisplayMode === 'UNAUTHENTICATED_USER_PREMIUM_ITEM') {
    return (
      <div className='btn-container'>
        <a
          className='btn-fixed-width-lg btn-primary-lg'
          href={hrefs.upgradeToPremium(itemDetails.id, itemDetails.itemType)}>
          {itemTranslations.actionGetPremium()}
        </a>
      </div>
    );
  }
  return (
    <div className='btn-container'>
      <a className='btn-growth-lg btn-fixed-width-lg' href={hrefs.loginWithRedirect()}>
        {itemTranslations.actionBuy()}
      </a>
    </div>
  );
}

export default function PurchaseButton({
  itemPurchaseParams,
  label,
  onBuyButtonClick,
  buttonClassName
}: TPurchaseButtonProps): JSX.Element {
  if (!document.getElementById('ItemPurchaseAjaxData')) {
    return <div />;
  }
  const [ItemPurchase, itemPurchaseService] = createItemPurchase();
  return (
    // selenium tests use "PurchaseButton" class name to find the element
    // https://sourcegraph.rbx.com/github.rbx.com/Roblox/web-platform@1e48226ae6c032c21a88cc020639d2e7f1cf2075/-/blob/Assemblies/Selenium/Roblox.Selenium.Framework/Pages/Web/Item/ItemPage.cs?L72&subtree=true#tab=def
    <div className='btn-container'>
      <button
        className={`shopping-cart-buy-button PurchaseButton ${buttonClassName ?? 'btn-growth-lg'}`}
        type='button'
        onClick={() => {
          onBuyButtonClick?.();
          itemPurchaseService.start();
        }}>
        {label ?? catalogTranslations.actionBuy()}
      </button>
      {!!itemPurchaseParams && <ItemPurchase {...itemPurchaseParams} />}
    </div>
  );
}
