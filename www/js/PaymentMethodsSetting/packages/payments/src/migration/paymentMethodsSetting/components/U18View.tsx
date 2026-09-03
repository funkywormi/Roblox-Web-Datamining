/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { useEffect, useRef, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { TSystemFeedbackService } from 'react-style-guide';
import { DeviceMeta } from 'Roblox';
import RobloxCredit from './RobloxCredit';
import { fetchCreditBalance } from '../services/paymentMethodsSettingService';
import { TRANSLATION_KEYS } from '../constants/translationConstants';

type TU18ViewProps = {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
};

export const U18View = ({
  translate,
  systemFeedbackService
}: TU18ViewProps): JSX.Element | null => {
  const isMobile = DeviceMeta ? DeviceMeta().isAndroidApp || DeviceMeta().isIosApp : false;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hideCreditSection, setHideCreditSection] = useState<boolean>(true);
  const [showConvertButton, setShowConvertButton] = useState<boolean>(false);
  const [robuxAmount, setRobuxAmount] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [currencyCode, setCurrencyCode] = useState<string>('USD');

  const paymentsHeader = translate(TRANSLATION_KEYS.PaymentsHeading);

  const getCreditBalance = async () => {
    setIsLoading(true);
    try {
      const [hideCredit, showConvert, robux, credit, currency] = await fetchCreditBalance();
      setHideCreditSection(hideCredit);
      setShowConvertButton(showConvert);
      setRobuxAmount(robux);
      setBalance(credit);
      setCurrencyCode(currency);
    } catch (e) {
      systemFeedbackService.warning(TRANSLATION_KEYS.GenericSomethingWentWrongResponse);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void getCreditBalance();
  }, [balance]);

  if (isMobile || hideCreditSection) return <div />;

  return (
    <div>
      <h2>{paymentsHeader}</h2>
      {isLoading ? (
        <span className='spinner spinner-default' />
      ) : (
        <RobloxCredit
          translate={translate}
          systemFeedbackService={systemFeedbackService}
          showConvertButton={showConvertButton}
          robuxAmount={robuxAmount}
          balance={balance}
          currencyCode={currencyCode}
          setZeroBalance={() => setBalance(0)}
        />
      )}
    </div>
  );
};

export default U18View;
