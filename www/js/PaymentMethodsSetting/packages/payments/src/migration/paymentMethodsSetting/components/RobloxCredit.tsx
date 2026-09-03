/* eslint no-void: ["error", { "allowAsStatement": true }] */
import React from 'react';
import { TranslateFunction } from 'react-utilities';
import { Button, TSystemFeedbackService } from 'react-style-guide';
import { fireEvent } from 'roblox-event-tracker';
import { COUNTER_METRICS, getPaymentMethodClassNameMapping } from '../constants/constants';
import useHeuristicCreditConversionModal from '../../redeemGiftCard/hooks/useHeuristicCreditConversionModal';
import PriceTag from '../../../priceTag/components/PriceTag';
import { TRANSLATION_KEYS } from '../constants/translationConstants';
import '../../css/redeemGiftCard/redeemGiftCard.scss';
import '../../css/redeemGiftCard/convertCredit.scss';
import useCreditConvertAllModal from '../../redeemGiftCard/hooks/useCreditConvertAllModal';

type TRobloxCreditProps = {
  translate: TranslateFunction;
  systemFeedbackService: TSystemFeedbackService;
  showConvertButton: boolean;
  robuxAmount: number;
  balance: number;
  currencyCode: string;
  isConvertAllFlowEnabled?: boolean;
  setZeroBalance: () => void;
};

export const RobloxCredit = ({
  translate,
  systemFeedbackService,
  showConvertButton,
  robuxAmount,
  balance,
  currencyCode,
  isConvertAllFlowEnabled,
  setZeroBalance
}: TRobloxCreditProps): JSX.Element => {
  const robloxCredit = translate(TRANSLATION_KEYS.RobloxCreditHeading);
  const balancePrefix = translate(TRANSLATION_KEYS.BalanceLabel);

  const [
    HeuristicCreditConversionModal,
    startCreditConversionFlow
  ] = useHeuristicCreditConversionModal({
    systemFeedbackService,
    translate,
    onSuccess: (isCreditConversion: boolean) => {
      setZeroBalance();
    }
  });

  const [CreditConvertAllModal, creditConvertAllModalService] = useCreditConvertAllModal();

  return (
    <div className='roblox-credit-container'>
      <HeuristicCreditConversionModal />
      {isConvertAllFlowEnabled && (
        <CreditConvertAllModal
          systemFeedbackService={systemFeedbackService}
          translate={translate}
          onSuccess={() => {
            setZeroBalance();
          }}
        />
      )}
      <div className='roblox-credit-header-container'>
        <span
          className={`payment-method-image cardIcon ${getPaymentMethodClassNameMapping(
            'robloxCredit'
          )}`}
        />
        <div className='roblox-credit-header text-emphasis'>{robloxCredit}</div>
      </div>
      <div className='roblox-credit-balance'>
        <div className='balance-prefix'>{balancePrefix}</div>
        <PriceTag amount={balance} currencyCode={currencyCode} />
      </div>
      {showConvertButton ? (
        <Button
          className='convert-to-robux-button btn-secondary-md'
          onClick={() => {
            fireEvent(COUNTER_METRICS.ROBLOX_CREDIT.CONVERT_CREDIT_CLICKED);
            if (isConvertAllFlowEnabled) {
              void creditConvertAllModalService.open();
            } else {
              startCreditConversionFlow();
            }
          }}>
          {translate(TRANSLATION_KEYS.ConvertToRobuxHeading)}
        </Button>
      ) : null}
    </div>
  );
};

export default RobloxCredit;
