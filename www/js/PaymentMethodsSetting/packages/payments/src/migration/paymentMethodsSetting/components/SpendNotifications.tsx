/* eslint-disable no-void */
import React, { useEffect, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { TSystemFeedbackService } from 'react-style-guide';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import {
  getParentalSpendControlsSettings,
  TParentalSpendControlsSettings
} from '../services/paymentMethodsSettingService';
import SpendingSettingListItem from './SpendingSettingListItem';

export type TSpendNotificationsProps = {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
};

export const SpendNotifications = ({
  translate,
  systemFeedbackService
}: TSpendNotificationsProps): JSX.Element | null => {
  const [settings, setSettings] = useState<TParentalSpendControlsSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const response = await getParentalSpendControlsSettings();
      setSettings(response);
    } catch (error) {
      systemFeedbackService.warning(translate(TRANSLATION_KEYS.GenericSomethingWentWrongResponse));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  if (isLoading) {
    return (
      <div className='section-content spending-setting-container'>
        <span className='spinner spinner-default' />
      </div>
    );
  }

  if (!settings?.isSpendNotificationSettingEnabledForUser) {
    // Feature not enabled for the current user – render nothing.
    return null;
  }

  const { spendNotificationSetting } = settings;

  let description: string | undefined;
  switch (spendNotificationSetting) {
    case 'NotificationsEveryAmountSpent':
      description = translate(TRANSLATION_KEYS.AllTransactionsNotificationsDesc);
      break;
    case 'NotificationsOnlyOnThresholdPassed':
      description = translate(TRANSLATION_KEYS.HighSpendNotificationsDesc);
      break;
    default:
      // "NotificationsOff" or any unknown value – no description necessary.
      description = undefined;
      break;
  }

  // If we have no copy to display, do not render the section at all.
  if (!description) {
    return null;
  }

  return (
    <div className='section-content spending-setting-container'>
      <SpendingSettingListItem
        title={translate(TRANSLATION_KEYS.SpendNotificationsHeading)}
        description={description}
      />
    </div>
  );
};

export default SpendNotifications;
