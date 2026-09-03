/* eslint-disable no-void */
import React, { useEffect, useState } from 'react';
import { Button, TSystemFeedbackService } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { AccessManagementUpsellV2Service } from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import {
  getParentalSpendControlsSettings,
  getPendingSpendLimitConsentRequest,
  TConsentResponse,
  TParentalSpendControlsSettings,
  TSetting
} from '../services/paymentMethodsSettingService';
import { settingChangeAmpFeature } from '../constants/constants';
import useSettingsModal from '../hooks/useSettingsModal';
import useCancelConsentRequestModal from '../hooks/useCancelConsentRequestModal';
import SpendingSettingListItem from './SpendingSettingListItem';
import SettingOptionPendingPill from './SettingOptionPendingPill';
import EnablePurchaseType from '../../enums/EnablePurchaseType';
import {
  sendAskNowModalButtonClickEvent,
  sendAskYourParentModalShownEvent,
  sendCancelAskParentModalButtonClickEvent,
  sendCancelPendingRequestButtonClickEvent
} from '../services/eventService';
import EVENT_CONSTANTS from '../constants/eventConstants';

type TMonthlySpendingLimitProps = {
  enablePurchaseSettings: TSetting | undefined;
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
};

export const MonthlySpendingLimit = ({
  enablePurchaseSettings,
  translate,
  systemFeedbackService
}: TMonthlySpendingLimitProps): JSX.Element => {
  const [
    spendLimitSettings,
    setSpendLimitSettings
  ] = useState<TParentalSpendControlsSettings | null>(null);
  const [pendingConsentRequest, setPendingConsentRequest] = useState<TConsentResponse | null>();
  const purchaseDisabled = enablePurchaseSettings?.currentValue === EnablePurchaseType.Disabled;

  const fetchSpendLimitSettings = async () => {
    try {
      const response = await getParentalSpendControlsSettings();
      setSpendLimitSettings(response);
    } catch (error) {
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
  };

  const fetchPendingConsentRequest = async () => {
    try {
      const request = await getPendingSpendLimitConsentRequest(authenticatedUser.id);
      setPendingConsentRequest(request);
    } catch (e) {
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
  };

  useEffect(() => {
    void fetchSpendLimitSettings();
    void fetchPendingConsentRequest();
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('price-tag:render', {
        detail: {
          targetSelector: '.fiat-spending-limit-tag',
          tagClassName: 'font-body'
        }
      })
    );
  }, [spendLimitSettings]);

  const requestParentalConsent = async () => {
    try {
      await AccessManagementUpsellV2Service.startAccessManagementUpsell({
        featureName: settingChangeAmpFeature,
        isAsyncCall: false,
        usePrologue: false,
        ampRecourseData: {
          monthlySpendLimit: null,
          monthlySpendLimitCurrencyCode: null
        }
      });
      await fetchPendingConsentRequest();
    } catch (e) {
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
  };

  const [requestParentalConsentModal, requestParentalConsentModalService] = useSettingsModal({
    translate,
    titleResourceId: TRANSLATION_KEYS.AskMoreRobuxHeading,
    bodyResourceId: TRANSLATION_KEYS.AskMoreRobuxDesc,
    actionButtonTextResourceId: TRANSLATION_KEYS.AskMoreRobuxAction,
    neutralButtonTextResourceId: TRANSLATION_KEYS.CancelAction,
    size: 'sm',
    onAction: async () => {
      sendAskNowModalButtonClickEvent(EVENT_CONSTANTS.state.spendLimit);
      await requestParentalConsent();
    },
    onNeutral: () => {
      sendCancelAskParentModalButtonClickEvent(EVENT_CONSTANTS.state.spendLimit);
    }
  });

  const hasMonthlySpendLimit =
    spendLimitSettings?.monthlySpendLimit !== null &&
    spendLimitSettings?.monthlySpendLimit !== undefined;

  const spendLimitPriceTag = (
    <span
      className='fiat-spending-limit-tag'
      data-amount={spendLimitSettings?.monthlySpendLimit}
      data-currency-code={spendLimitSettings?.monthlySpendLimitCurrencyType}
    />
  );

  const [
    cancelConsentRequestModal,
    cancelConsentRequestModalService
  ] = useCancelConsentRequestModal({
    systemFeedbackService,
    translate,
    consentId: pendingConsentRequest?.id,
    onSuccess: fetchPendingConsentRequest,
    state: EVENT_CONSTANTS.state.spendLimit
  });

  const getMonthlySpendLimitDisclaimerText = () => {
    return translate(TRANSLATION_KEYS.MonthlySpendLimitDisclaimer, {
      linkStart: `<a href="https://help.roblox.com/hc/articles/4409125091348" class="text-link" target="_blank">`,
      linkEnd: '</a>'
    });
  };

  const onClickMonthlySpendLimit = () => {
    if (purchaseDisabled) {
      // Disable monthly spend limit if the user has disabled purchases
      return;
    }

    if (pendingConsentRequest) {
      cancelConsentRequestModalService.open();
    } else {
      sendAskYourParentModalShownEvent(EVENT_CONSTANTS.state.spendLimit);
      requestParentalConsentModalService.open();
    }
  };

  if (hasMonthlySpendLimit) {
    return (
      <React.Fragment>
        <div className='section-content spending-setting-container'>
          <SpendingSettingListItem
            disabled={purchaseDisabled}
            title={translate(TRANSLATION_KEYS.MonthlySpendingLimit)}
            currentSettingValueComponent={
              <React.Fragment>
                {pendingConsentRequest && <SettingOptionPendingPill translate={translate} />}
                {spendLimitPriceTag}
              </React.Fragment>
            }
            onClick={onClickMonthlySpendLimit}
            showArrow
            footer={getMonthlySpendLimitDisclaimerText()}
          />

          <div className='request-consent-button-container'>
            {/* Cancel request button */}
            {pendingConsentRequest && (
              <Button
                variant={Button.variants.secondary}
                onClick={() => {
                  sendCancelPendingRequestButtonClickEvent(EVENT_CONSTANTS.state.spendLimit);
                  cancelConsentRequestModalService.open();
                }}>
                {translate(TRANSLATION_KEYS.CancelRequestHeading)}
              </Button>
            )}
          </div>
          {/* Modals */}
          {requestParentalConsentModal}
          {cancelConsentRequestModal}
        </div>
      </React.Fragment>
    );
  }

  // No monthly spending limit set
  const noLimit = <span className='text-description'>{translate(TRANSLATION_KEYS.NoLimit)}</span>;

  return (
    <div className='section-content spending-setting-container'>
      <SpendingSettingListItem
        title={translate(TRANSLATION_KEYS.MonthlySpendingLimit)}
        currentSettingValueComponent={noLimit}
        footer={getMonthlySpendLimitDisclaimerText()}
      />
    </div>
  );
};

export default MonthlySpendingLimit;
