/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { useEffect, useRef, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { TSystemFeedbackService } from 'react-style-guide';
import { differenceInYears } from 'date-fns';
import { fireEvent } from 'roblox-event-tracker';
import PaymentMethods from './PaymentMethods';
import Subscriptions from './Subscriptions';
import MonthlySpendingLimit from './MonthlySpendingLimit';
import EnablePurchase from './EnablePurchase';
import {
  getIsPremiumRemovalEnabled,
  getSettingsUIPolicy,
  getUserBirthdate,
  isStripeEnabledForUser,
  SpendingNotificationDescription,
  TSettingsUIPolicyBody,
  getSettingsAndOptions,
  TSettingsAndOptionsBody,
  TUserSettingsMetadataBody,
  getSettingMetadata,
  getLinkedParents
} from '../services/paymentMethodsSettingService';
import U18View from './U18View';
import { COUNTER_METRICS } from '../constants/constants';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import { sendLoadSpendingEvent } from '../services/eventService';
import EVENT_CONSTANTS from '../constants/eventConstants';
import SpendNotifications from './SpendNotifications';
import GiftCardInformation from './GiftCardInformation';

type TSettingContainerProps = {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
};

export const SettingContainer = ({
  translate,
  systemFeedbackService
}: TSettingContainerProps): JSX.Element => {
  const [userUnder18, setUserUnder18] = useState<boolean>(true);
  const [hasLinkedParent, setHasLinkedParent] = useState<boolean>(false);
  const [stripeEnabledForUser, setStripeEnabledForUser] = useState<boolean>(false);
  const [isUserVpcApproved, setIsUserVpcApproved] = useState<boolean>(false); // Will be true for 18+ or U18 users with VPC approval.
  const [settingsUIPolicy, setSettingsUIPolicy] = useState<TSettingsUIPolicyBody>();
  const [settingsMetadata, setSettingsMetadata] = useState<TUserSettingsMetadataBody>();
  const [settingsAndOptions, setSettingsAndOptions] = useState<TSettingsAndOptionsBody>();

  // Flag to control changes from Billing -> Payment methods tab,
  // notably removing the premium display from the tab
  const [isPremiumRemovalEnabled, setIsPremiumRemovalEnabled] = useState(false);

  const getBillingHelp = (isSavePaymentInfoDisabled: boolean) => {
    const translateKey = isSavePaymentInfoDisabled
      ? TRANSLATION_KEYS.BillingAnnotateWithHelpLink
      : TRANSLATION_KEYS.BillingHelpWithLinkLabel;
    return {
      __html: translate(translateKey, {
        aTagStartWithHref: '<a href=',
        billingHelpPagesLink: '"https://help.roblox.com/hc/categories/200213820"',
        hrefEnd: ' class="text-link" target="_blank">',
        aTagEnd: '</a>'
      })
    };
  };

  const fetchUserAge = async () => {
    try {
      fireEvent(COUNTER_METRICS.API.GET_USER_BIRTHDATE_CALLED);
      const response = await getUserBirthdate();
      fireEvent(COUNTER_METRICS.API.GET_USER_BIRTHDATE_SUCCEEDED);
      const age = differenceInYears(
        new Date(),
        new Date(response.data.birthYear, response.data.birthMonth - 1, response.data.birthDay)
      );
      if (age >= 18) setUserUnder18(false);
      // We were going to show a saved card if a user had any, including U18, but the only U18 users that should be able to save and view saved cards
      // should be users with VPC, right? So instead of making a call to check if a user has any saved credit cards, we should make a call to
      // check if they have VPC and then show the saved cards section.
    } catch (e) {
      fireEvent(COUNTER_METRICS.API.GET_USER_BIRTHDATE_FAILED);
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
  };

  const fetchIsStripeEnabledForUser = async () => {
    try {
      const response = await isStripeEnabledForUser();
      setStripeEnabledForUser(response.data.isPaymentProviderEnabledForUser);
      setIsUserVpcApproved(response.data.isUserVpcApproved);
    } catch (e) {
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
  };

  const fetchSettingsUIPolicy = async () => {
    try {
      const response = await getSettingsUIPolicy();
      setSettingsUIPolicy(response);
      const metadata = await getSettingMetadata();
      if (metadata) {
        setSettingsMetadata(metadata);
      }
    } catch (e) {
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
  };

  const fetchSettingsAndOptions = async () => {
    try {
      const response = await getSettingsAndOptions();
      setSettingsAndOptions(response);
    } catch (e) {
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
  };

  const fetchLinkedParents = async () => {
    try {
      const response = await getLinkedParents();
      setHasLinkedParent((response.parents?.length ?? 0) > 0);
    } catch (e) {
      setHasLinkedParent(false);
    }
  };

  useEffect(() => {
    void fetchUserAge();
    void fetchIsStripeEnabledForUser();
    void fetchSettingsUIPolicy();
    void fetchSettingsAndOptions();
    void fetchLinkedParents();
    getIsPremiumRemovalEnabled()
      .then(value => setIsPremiumRemovalEnabled(value))
      .catch(() => setIsPremiumRemovalEnabled(false));
  }, []);

  const isFirstPageLoad = useRef(true);
  useEffect(() => {
    if (isFirstPageLoad.current && settingsAndOptions && settingsUIPolicy) {
      isFirstPageLoad.current = false; // Only send page load events on the first page load.

      if (settingsUIPolicy?.renamePaymentsToSpendingTab) {
        sendLoadSpendingEvent(
          settingsAndOptions.enablePurchases
            ? EVENT_CONSTANTS.state.spendingDisplayAllowPurchases
            : EVENT_CONSTANTS.state.spendingHideAllowPurchases
        );
      }
    }
  }, [settingsUIPolicy, settingsAndOptions]);

  let spendingNotificationDescription = null;
  switch (settingsUIPolicy?.spendingNotificationDescription) {
    case SpendingNotificationDescription.GlobalTeen:
      // For global 13-17 year old users
      spendingNotificationDescription = (
        <div
          className='text-description text-new-line'
          dangerouslySetInnerHTML={{
            __html: translate(TRANSLATION_KEYS.SpendingPaymentMethodsDesc, {
              linkStart:
                '<a href="https://help.roblox.com/hc/categories/200213820" class="text-link" target="_blank">',
              linkEnd: '</a>'
            })
          }}
        />
      );
      break;
    case SpendingNotificationDescription.U13:
      // For TX/KR teens, and users under 13
      spendingNotificationDescription = (
        <div className='text-description text-new-line'>
          {translate(TRANSLATION_KEYS.ChildSideSpendingDesc)}
        </div>
      );
      break;
    case SpendingNotificationDescription.O18:
    default:
  }
  return (
    <div className='setting-container'>
      <h2>
        {settingsUIPolicy?.renamePaymentsToSpendingTab
          ? translate(TRANSLATION_KEYS.SpendingHeading)
          : translate(TRANSLATION_KEYS.PaymentsHeading)}
      </h2>
      {spendingNotificationDescription}
      {settingsAndOptions?.enablePurchases !== undefined && (
        <EnablePurchase
          enablePurchaseSettings={settingsAndOptions.enablePurchases}
          refetchEnablePurchaseSettings={fetchSettingsAndOptions}
          translate={translate}
          systemFeedbackService={systemFeedbackService}
        />
      )}
      {settingsMetadata?.displaySpendLimitSettings && (
        <MonthlySpendingLimit
          enablePurchaseSettings={settingsAndOptions?.enablePurchases}
          translate={translate}
          systemFeedbackService={systemFeedbackService}
        />
      )}
      {/* Spend notifications widget – U18 users with linked parents only */}
      {userUnder18 && hasLinkedParent && (
        <SpendNotifications translate={translate} systemFeedbackService={systemFeedbackService} />
      )}

      {userUnder18 && !isPremiumRemovalEnabled ? ( // If we haven't turned on the new subscriptions tab, continue showing the old view.
        <U18View translate={translate} systemFeedbackService={systemFeedbackService} />
      ) : (
        <PaymentMethods
          translate={translate}
          systemFeedbackService={systemFeedbackService}
          hideAddCardButton={userUnder18 || !stripeEnabledForUser} // user under 18 or user not in Stripe enabled countries.
          shouldDisplaySavedPaymentMethods={stripeEnabledForUser && isUserVpcApproved}
          hideSavedPaymentMethodsIfNoSavedCards={userUnder18}
        />
      )}
      <GiftCardInformation systemFeedbackService={systemFeedbackService} translate={translate} />
      {/* If premium removal flag is not turned on, show Subscriptions */}
      {!isPremiumRemovalEnabled && (
        <Subscriptions translate={translate} systemFeedbackService={systemFeedbackService} />
      )}
    </div>
  );
};

export default SettingContainer;
