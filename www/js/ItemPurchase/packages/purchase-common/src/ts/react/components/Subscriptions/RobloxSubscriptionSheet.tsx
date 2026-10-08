import React from 'react';
import { getFreeTrialDisplay } from '@rbx/payments/services/subscriptions';
import { type PurchaseTranslate } from '../../itemPurchase/useTranslate';
import { DeviceMeta } from '@rbx/legacy-webapp-types/Roblox';
import { translateHtml } from '@rbx/translation-utils';
import { SheetRoot, SheetContent, SheetTitle, SheetBody, Icon, Link } from '@rbx/foundation-ui';
import type { SubscriptionProductInfo } from '@rbx/client-subscriptions-api/v2';

import BillingInfoDisplay from './BillingInfoDisplay';
import BenefitList from './BenefitList';
import SubscriptionButton from './SubscriptionButton';

type RobloxSubscriptionSheetProps = {
  translate: PurchaseTranslate;
  subscriptionProductInfo: SubscriptionProductInfo;
  isFreeTrial: boolean;
  open: boolean;
  onClose: () => void;
  isDisabled?: boolean;
  upsellUuid?: string;
  paymentSessionId?: string;
  redirectUrl?: string;
  trackSubscriptionButtonClick?: () => void;
};

const SUBSCRIPTION_TERMS_URL = 'https://www.roblox.com/info/terms';

/** Module scope so the reference is stable for `translateHtml` (see react/no-unstable-nested-components). */
function renderSubscriptionTermsLink(children: React.ReactNode) {
  return (
    <Link href={SUBSCRIPTION_TERMS_URL} color='Standard' target='_blank' isExternal={false}>
      {children}
    </Link>
  );
}

const SUBSCRIPTION_TERMS_TRANSLATE_LINK = [
  {
    opening: 'linkStart',
    closing: 'linkEnd',
    render: renderSubscriptionTermsLink
  }
];

const RobloxSubscriptionSheet: React.FC<RobloxSubscriptionSheetProps> = ({
  translate,
  subscriptionProductInfo,
  isFreeTrial,
  open,
  onClose,
  isDisabled = false,
  upsellUuid,
  paymentSessionId,
  redirectUrl,
  trackSubscriptionButtonClick
}) => {
  const deviceMeta = DeviceMeta();
  const { type, id } = subscriptionProductInfo.productKey;
  const { periodType, localizedPrice, eligibleOffers } = subscriptionProductInfo;
  const featureConfig =
    subscriptionProductInfo.productTypeDetails.robloxSubscriptionProductDetails?.featureConfig;

  const freeTrialOffer = eligibleOffers.find(o => o.offerType === 'FreeTrial');
  const trialDisplay = getFreeTrialDisplay(freeTrialOffer, periodType);
  const useVariableTrialCopy = isFreeTrial && trialDisplay != null;

  const legalContent = useVariableTrialCopy
    ? translateHtml(translate, 'Label.FreeTrialDisclosureV3', SUBSCRIPTION_TERMS_TRANSLATE_LINK, {
        trialDuration: String(trialDisplay.trialDuration),
        trialPeriodLabel: translate(trialDisplay.trialPeriodKey),
        billingPeriodLabel: translate(trialDisplay.billingPeriodKey)
      })
    : translateHtml(
        translate,
        isFreeTrial ? 'Label.FreeTrialDisclosureV2' : 'Description.SubscriptionLegal',
        SUBSCRIPTION_TERMS_TRANSLATE_LINK
      );

  return (
    <SheetRoot
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen) onClose();
      }}>
      <SheetContent
        centerSheetSize='Medium'
        largeScreenVariant='center'
        closeLabel={translate('Action.Close')}>
        <SheetTitle>
          <div className='gap-x-small flex items-center'>
            <Icon className='!size-1000' name='icon-regular-roblox-plus' />
            {translate('Title.GetBlackbird')}
          </div>
        </SheetTitle>
        <SheetBody>
          <div className='padding-large gap-y-xlarge flex flex-col'>
            <BillingInfoDisplay
              translate={translate}
              eligibleOffers={eligibleOffers}
              periodType={periodType}
              price={localizedPrice}
            />
            {featureConfig && (
              <BenefitList
                translate={translate}
                featureConfig={featureConfig}
                periodType={periodType}
              />
            )}
            <SubscriptionButton
              deviceMeta={deviceMeta}
              isDisabled={isDisabled}
              productId={id}
              productType={type}
              upsellUuid={upsellUuid}
              paymentSessionId={paymentSessionId}
              redirectUrl={redirectUrl}
              trackSubscriptionButtonClick={trackSubscriptionButtonClick}>
              {translate(isFreeTrial ? 'Action.TryItForFree' : 'Action.Subscribe')}
            </SubscriptionButton>

            <span className='text-caption-medium content-muted'>{legalContent}</span>
          </div>
        </SheetBody>
      </SheetContent>
    </SheetRoot>
  );
};

export default RobloxSubscriptionSheet;
