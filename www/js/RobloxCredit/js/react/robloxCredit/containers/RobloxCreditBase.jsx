/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, createModal, createSystemFeedback } from 'react-style-guide';
import { deviceMeta as DeviceMeta } from 'header-scripts';
import { fireEvent } from 'roblox-event-tracker';
import { getConversionMetadata, processPayment } from '../services/robloxCreditService';
import { COUNTER_METRICS } from '../constants/robloxCreditUrlConstants';

const [Modal, modalService] = createModal();
const [SystemFeedback, systemFeedbackService] = createSystemFeedback();
const deviceMetaData = DeviceMeta.getDeviceMeta();
const { deviceType, isWin32App, isUWPApp, isInApp } = deviceMetaData;
const showButton =
  deviceType === DeviceMeta.DeviceTypes.computer || isWin32App || isUWPApp || !isInApp;

function RobloxCreditBase({ translate }) {
  const [balance, setBalance] = useState(null);
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [robuxAmount, setRobuxAmount] = useState(null);
  const [canRedeemCreditForRobux, setCanRedeemCreditForRobux] = useState(null);
  const [conversionDisabled, setConversionDisabled] = useState(false);

  const triggerPriceTagRendering = () => {
    window.dispatchEvent(
      new CustomEvent('price-tag:render', {
        detail: {
          targetSelector: '.fiat-credit-balance-in-setting'
        }
      })
    );
  };

  const confirmationBody = (
    <div
      dangerouslySetInnerHTML={{
        __html: translate('Description.ConfirmRobloxCreditToRobuxRedemption', {
          balance: `<span class='fiat-credit-balance-in-setting ml-1' data-amount=${balance} data-currency-code=${currencyCode}></span>`,
          iconRobux: '<span class="icon-robux-16x16"></span>',
          robuxAmount
        })
      }}
      ref={() => triggerPriceTagRendering()}
    />
  );

  const getCreditConversionMetadata = async () => {
    const result = await getConversionMetadata();
    if (result.status !== 200) {
      fireEvent(COUNTER_METRICS.GET_CONVERSION_METADATA_FAILED_PREFIX);
      fireEvent(`${COUNTER_METRICS.GET_CONVERSION_METADATA_FAILED_PREFIX}${result.status}`);
      return;
    }

    const metadata = result.data;
    setRobuxAmount(metadata.robuxConversionAmount);
    setCurrencyCode(metadata.currencyCode);
    setBalance(metadata.creditBalance);
    if (metadata.robuxConversionAmount === 0) {
      setCanRedeemCreditForRobux(false);
    } else {
      setCanRedeemCreditForRobux(true);
    }
  };

  const processConvertCredit = async () => {
    const result = await processPayment();
    if (result.status !== 200) {
      fireEvent(COUNTER_METRICS.PROCESS_PAYMENT_FAILED_STATUS_CODE_PREFIX);
      fireEvent(`${COUNTER_METRICS.PROCESS_PAYMENT_FAILED_STATUS_CODE_PREFIX}${result.status}`);
      systemFeedbackService.warning(translate('Message.FailedDebitRobloxCredit'));
      return;
    }

    const processedResult = result.data;
    if (processedResult.isSuccess && processedResult.providerPayload?.IsSuccessful) {
      systemFeedbackService.success(
        translate('Message.RobloxCreditToRobuxRedemptionConfirmation', {
          robuxAmount
        })
      );
      void getCreditConversionMetadata();
    } else {
      systemFeedbackService.warning(translate('Message.FailedDebitRobloxCredit'));
      setConversionDisabled(false);
      fireEvent(COUNTER_METRICS.PROCESS_PAYMENT_NOT_SUCCESSFUL_PREFIX);
    }
    fireEvent(
      COUNTER_METRICS.PROCESS_PAYMENT_RESPONSE_MESSAGE_PREFIX +
        processedResult.providerPayload.ResponseMessage
    );
  };

  const processConvertCreditNoException = async () => {
    try {
      await processConvertCredit();
    } catch (e) {
      systemFeedbackService.warning(translate('Message.FailedDebitRobloxCredit'));
      fireEvent(COUNTER_METRICS.PROCESS_PAYMENT_UNEXPECTED_EXCEPTION);
    }
  };

  const handleOnClick = () => {
    modalService.open().then(() => {
      setConversionDisabled(true);
      void processConvertCreditNoException();
    });
  };

  useEffect(() => {
    triggerPriceTagRendering();
  }, [balance, currencyCode]);

  useEffect(() => {
    void getCreditConversionMetadata();
  }, []);

  const renderButton = () => {
    if (!showButton || !canRedeemCreditForRobux) {
      return null;
    }

    return (
      <Button
        id='redeem-robux-button'
        className='redeem-robux-button'
        variant={Button.variants.secondary}
        size={Button.sizes.medium}
        width={Button.widths.min}
        isDisabled={conversionDisabled}
        onClick={handleOnClick}>
        {translate('Action.ConvertToRobux')}
      </Button>
    );
  };

  if (!balance) {
    return null;
  }

  return (
    <div>
      <span className='text-label account-settings-label'>{translate('Heading.RobloxCredit')}</span>
      <p>
        {translate('Label.LocalizedCurrentBalance') || 'Current Balance:'}
        <span
          className='fiat-credit-balance-in-setting ml-1'
          data-amount={balance}
          data-currency-code={currencyCode}
        />
      </p>
      {renderButton()}
      <Modal
        title={translate('Heading.GetRobux')}
        body={confirmationBody}
        actionButtonText={translate('Action.Redeem')}
        neutralButtonText={translate('Action.Cancel')}
        actionButtonShow
      />
      <SystemFeedback />
    </div>
  );
}

RobloxCreditBase.propTypes = {
  translate: PropTypes.func.isRequired
};

export default RobloxCreditBase;
