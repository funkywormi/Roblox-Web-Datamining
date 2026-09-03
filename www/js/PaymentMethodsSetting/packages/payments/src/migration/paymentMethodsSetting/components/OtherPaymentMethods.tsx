/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { useEffect, useState } from 'react';
import { TranslateFunction } from 'react-utilities';
import { TSystemFeedbackService } from 'react-style-guide';
import { fetchCreditBalance } from '../services/paymentMethodsSettingService';
import RobloxCredit from './RobloxCredit';
import { TRANSLATION_KEYS } from '../constants/translationConstants';

type TOtherPaymentMethodsProps = {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
};

export const OtherPaymentMethods = ({
  translate,
  systemFeedbackService
}: TOtherPaymentMethodsProps): JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hideCreditSection, setHideCreditSection] = useState<boolean>(false);
  const [showConvertButton, setShowConvertButton] = useState<boolean>(false);
  const [robuxAmount, setRobuxAmount] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  const [isConvertAllFlowEnabled, setIsConvertAllFlowEnabled] = useState<boolean>(false);
  const otherPaymentMethodsHeader = translate(TRANSLATION_KEYS.OtherPaymentMethodsHeading);

  const getCreditBalance = async () => {
    setIsLoading(true);
    try {
      const [
        hideCredit,
        showConvert,
        robux,
        credit,
        currency,
        convertAllFlowEnabled
      ] = await fetchCreditBalance();
      setHideCreditSection(hideCredit);
      setShowConvertButton(showConvert);
      setRobuxAmount(robux);
      setBalance(credit);
      setCurrencyCode(currency);
      setIsConvertAllFlowEnabled(convertAllFlowEnabled);
    } catch (e) {
      systemFeedbackService.warning(TRANSLATION_KEYS.GenericSomethingWentWrongResponse);
    }
    setIsLoading(false);
  };

  // This runs once initially, and everytime credit balance changes to get new credit value
  useEffect(() => {
    void getCreditBalance();
  }, [balance]);

  if (hideCreditSection) return <div className='other-payment-methods-container' />;

  return (
    <div className='other-payment-methods-container'>
      <h5>{otherPaymentMethodsHeader}</h5>
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
          isConvertAllFlowEnabled={isConvertAllFlowEnabled}
          setZeroBalance={() => setBalance(0)}
        />
      )}
    </div>
  );
};

export default OtherPaymentMethods;
