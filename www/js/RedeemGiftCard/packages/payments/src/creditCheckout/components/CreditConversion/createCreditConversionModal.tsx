import { createModal, IModalService, Button } from "react-style-guide";
import React from "react";
import { TranslateFunction } from "react-utilities";
import { TRANSLATION_KEYS, giftCardTermsURL } from "../../constants/redeemConstants";
import { trackCounter } from "../../observability";
import PriceTag from "../../../priceTag/components/PriceTag";

type TCreditConversionModalProps = {
  cardValue: number;
  cardCurrencyCode: string;
  convertedValue: number;
  convertedCurrencyCode: string;
  exchangeRate: number;
  loading: boolean;
  onContinue: () => void;
  onCancel: () => void;
  translate: TranslateFunction;
};
export default function createCreditConversionModal(): [
  ({
    cardValue,
    cardCurrencyCode,
    convertedValue,
    convertedCurrencyCode,
    exchangeRate,
    loading,
    onContinue,
    onCancel,
    translate,
  }: TCreditConversionModalProps) => JSX.Element,
  IModalService,
] {
  const [Modal, modalService] = createModal();

  function CreditConversionModal({
    cardValue,
    cardCurrencyCode,
    convertedValue,
    convertedCurrencyCode,
    exchangeRate,
    loading,
    onContinue,
    onCancel,
    translate,
  }: TCreditConversionModalProps): JSX.Element {
    const exchangeRateMessage = `(1 ${cardCurrencyCode} = ${exchangeRate} ${convertedCurrencyCode})`;

    const handleContinue = () => {
      trackCounter("CreditConversion_ContinueClicked");
      onContinue();
    };

    const handleCancel = () => {
      trackCounter("CreditConversion_CancelClicked");
      onCancel();
    };

    const creditConversionConfirmation = {
      __html: translate(TRANSLATION_KEYS.CreditConversionConfirmation, {
        termsAndConditionsLinkStart: `<a href='${giftCardTermsURL}' class='text-link'>`,
        termsAndConditionsLinkEnd: "</a>",
      }),
    };

    const body = (
      <div className="gift-card-currency-conversion">
        <div
          className="conversion-message text-description text-left"
          dangerouslySetInnerHTML={creditConversionConfirmation}
        />
        <div className="conversion-info text-left">
          <div className="conversion-row text-description">
            <span className="conversion-label">{translate(TRANSLATION_KEYS.CodeValueLabel)}</span>
            <span className="conversion-value">
              <PriceTag
                amount={cardValue}
                currencyCode={cardCurrencyCode}
                tagClassName="text-description"
              />
            </span>
          </div>
          <div className="exchange-rate-row text-description">
            <span className="exchange-rate-message">{exchangeRateMessage}</span>
          </div>
          <div className="rbx-divider" />
          <div className="conversion-row conversion-result text-description">
            <span className="conversion-label">{translate(TRANSLATION_KEYS.ConversionLabel)}</span>
            <span className="conversion-value">
              <PriceTag
                amount={convertedValue}
                currencyCode={convertedCurrencyCode}
                tagClassName="text-description"
              />
            </span>
          </div>
        </div>
        <div className="modal-footer-buttons d-flex justify-content-between mt-4">
          <Button
            variant={Button.variants.growth}
            size={Button.sizes.medium}
            width={Button.widths.full}
            onClick={handleContinue}
            isDisabled={loading}
            className="mr-2"
          >
            {translate(TRANSLATION_KEYS.ContinueAction)}
          </Button>
          <Button
            variant={Button.variants.control}
            size={Button.sizes.medium}
            width={Button.widths.full}
            onClick={handleCancel}
            className="ml-2"
          >
            {translate(TRANSLATION_KEYS.CancelAction)}
          </Button>
        </div>
      </div>
    );

    return (
      <Modal
        id="credit-conversion-modal"
        title={translate(TRANSLATION_KEYS.CreditConversionHeading)}
        body={body}
        loading={loading}
        size="md"
      />
    );
  }

  return [CreditConversionModal, modalService];
}
