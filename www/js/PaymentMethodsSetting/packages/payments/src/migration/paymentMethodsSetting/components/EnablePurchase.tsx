import React, { useEffect, useState } from 'react';
import { TSystemFeedbackService, Toggle, Button } from 'react-style-guide';
import { TranslateFunction } from 'react-utilities';
import { AccessManagementUpsellV2Service } from 'Roblox';
import { authenticatedUser } from 'header-scripts';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import useCancelConsentRequestModal from '../hooks/useCancelConsentRequestModal';
import {
  getPendingEnablePurchaseConsentRequest,
  TConsentResponse,
  TSetting,
  updateEnablePurchaseSetting
} from '../services/paymentMethodsSettingService';
import { settingChangeAmpFeature } from '../constants/constants';
import SettingOptionLockedPill from './SettingOptionLockedPill';
import SettingOptionPendingPill from './SettingOptionPendingPill';
import RequirementType from '../../enums/RequirementType';
import EnablePurchaseType from '../../enums/EnablePurchaseType';
import SpendingSettingListItem from './SpendingSettingListItem';
import refetchUserSettings from '../services/refetchSettingsUtil';
import {
  sendAskMyParentButtonClickEvent,
  sendCancelPendingRequestButtonClickEvent
} from '../services/eventService';
import EVENT_CONSTANTS from '../constants/eventConstants';

type TEnablePurchaseProps = {
  enablePurchaseSettings: TSetting;
  refetchEnablePurchaseSettings: () => void;
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
};

export const EnablePurchase = ({
  enablePurchaseSettings,
  refetchEnablePurchaseSettings,
  translate,
  systemFeedbackService
}: TEnablePurchaseProps): JSX.Element => {
  const [pendingConsentRequest, setPendingConsentRequest] = useState<TConsentResponse | null>();
  const [parentalConsentRequirement, setParentalConsentRequirement] = useState<boolean>(false);
  const [isToggleOn, setIsToggleOn] = useState<boolean>(false);
  const [displayAskParentButton, setDisplayAskParentButton] = useState<boolean>(false);

  const currOptionAsBoolean = enablePurchaseSettings.currentValue === EnablePurchaseType.Enabled;

  const fetchPendingConsentRequest = async () => {
    try {
      const request = await getPendingEnablePurchaseConsentRequest(authenticatedUser.id);
      setPendingConsentRequest(request);
      setIsToggleOn(currOptionAsBoolean);
      setDisplayAskParentButton(false);
    } catch (e) {
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
  };

  const getParentalConsentRequirement = () => {
    enablePurchaseSettings.options.forEach(optionItem => {
      const { requirement } = optionItem;
      const { optionValue } = optionItem.option;
      if (
        optionValue !== enablePurchaseSettings.currentValue &&
        requirement === RequirementType.ParentalConsent
      ) {
        setParentalConsentRequirement(true);
      }
      setIsToggleOn(currOptionAsBoolean);
    });
  };

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchPendingConsentRequest();
    getParentalConsentRequirement();
  }, [enablePurchaseSettings]);

  const requestParentalConsent = async () => {
    try {
      await AccessManagementUpsellV2Service.startAccessManagementUpsell({
        featureName: settingChangeAmpFeature,
        isAsyncCall: false,
        usePrologue: false,
        ampRecourseData: {
          enablePurchases: EnablePurchaseType.Enabled
        }
      });
      await fetchPendingConsentRequest();
    } catch (e) {
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
  };

  const [
    cancelConsentRequestModal,
    cancelConsentRequestModalService
  ] = useCancelConsentRequestModal({
    systemFeedbackService,
    translate,
    consentId: pendingConsentRequest?.id,
    onSuccess: fetchPendingConsentRequest,
    state: EVENT_CONSTANTS.state.allowPurchases
  });

  const updateSettingValueHandler = async () => {
    if (parentalConsentRequirement) {
      await requestParentalConsent();
    } else {
      const requestedSettingValue = isToggleOn
        ? EnablePurchaseType.Disabled
        : EnablePurchaseType.Enabled;
      updateEnablePurchaseSetting(requestedSettingValue)
        .then(() => {
          setIsToggleOn(requestedSettingValue === EnablePurchaseType.Enabled);
          systemFeedbackService.success(translate(TRANSLATION_KEYS.GenericSuccessDialogMessage));
          refetchEnablePurchaseSettings();
          refetchUserSettings();
        })
        .catch(e => {
          systemFeedbackService.warning(
            translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse)
          );
        });
    }
  };

  function isToggleMismatch(requestedToggle: boolean, currentSettingState: boolean) {
    return !requestedToggle !== currentSettingState;
  }

  const getToggleEvent = async () => {
    if (pendingConsentRequest) {
      cancelConsentRequestModalService.open();
      return;
    }

    if (parentalConsentRequirement && isToggleMismatch(isToggleOn, currOptionAsBoolean)) {
      setIsToggleOn(currToggleState => !currToggleState);
      setDisplayAskParentButton(true);
      return;
    }

    if (!parentalConsentRequirement) {
      await updateSettingValueHandler();
      return;
    }

    setIsToggleOn(currToggleState => !currToggleState);
    setDisplayAskParentButton(false);
  };

  const getAllowPurchaseDisclaimerText = () => {
    return translate(TRANSLATION_KEYS.AllowPurchaseDisclaimer, {
      premiumSubscriptionsLinkStart: `<a href="https://help.roblox.com/hc/articles/203312540" class="text-link" target="_blank">`,
      premiumSubscriptionsLinkEnd: '</a>',
      inExperienceSubscriptionsLinkStart: `<a href="https://help.roblox.com/hc/articles/20292396051220" class="text-link" target="_blank">`,
      inExperienceSubscriptionsLinkEnd: '</a>'
    });
  };

  return (
    <React.Fragment>
      <div className='section-content spending-setting-container'>
        <SpendingSettingListItem
          title={translate(TRANSLATION_KEYS.AllowPurchases)}
          currentSettingValueComponent={
            // Pending request pill
            <React.Fragment>
              {pendingConsentRequest && <SettingOptionPendingPill translate={translate} />}
              {parentalConsentRequirement && !pendingConsentRequest && (
                <SettingOptionLockedPill translate={translate} />
              )}
              <Toggle id='allow-purchases-toggle' isOn={isToggleOn} onToggle={getToggleEvent} />
            </React.Fragment>
          }
          footer={getAllowPurchaseDisclaimerText()}
        />

        <div className='request-consent-button-container'>
          {/* Ask parent button */}
          {displayAskParentButton && !pendingConsentRequest && (
            <Button
              className='enable-purchase-action-button'
              variant={Button.variants.primary}
              onClick={async () => {
                sendAskMyParentButtonClickEvent(EVENT_CONSTANTS.state.allowPurchases);
                await updateSettingValueHandler();
              }}>
              {translate(TRANSLATION_KEYS.AskMoreRobuxHeading)}
            </Button>
          )}

          {/* Cancel request button */}
          {pendingConsentRequest && (
            <Button
              className='enable-purchase-action-button'
              variant={Button.variants.secondary}
              onClick={() => {
                sendCancelPendingRequestButtonClickEvent(EVENT_CONSTANTS.state.allowPurchases);
                cancelConsentRequestModalService.open();
              }}>
              {translate(TRANSLATION_KEYS.CancelRequestHeading)}
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      {cancelConsentRequestModal}
    </React.Fragment>
  );
};

export default EnablePurchase;
