import { useState, useRef, useCallback, Fragment, useContext } from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import { TrackingContext } from "../../contexts/TrackingContext";
import { Card, PaymentProfile, PayPal } from "../../services/paymentsGatewayService";
import { isPayPalProviderPayload } from "../../utils/paymentProfile";

type SelectCardDropdownProps = {
  error?: string;
  onSelectPaymentProfile: (paymentProfile: PaymentProfile) => void;
  paymentProfiles: PaymentProfile[];
  selectedPaymentProfile: PaymentProfile | undefined;
};

export function QuickPaySelectCardDropdown({
  error,
  onSelectPaymentProfile,
  paymentProfiles,
  selectedPaymentProfile,
}: SelectCardDropdownProps) {
  const { trackQuickPayClickPaymentMethodDropdown } = useContext(TrackingContext);

  const { translate } = useTranslation();

  const [showSelectionDropdown, setShowSelectionDropdown] = useState<boolean>(false);
  const selectDropdownList = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => {
    if (selectDropdownList.current?.scrollTop) {
      selectDropdownList.current.scrollTop = 0;
    }

    setShowSelectionDropdown(false);
  }, [selectDropdownList]);

  const handleCardChange = useCallback(
    (paymentProfile: PaymentProfile) => {
      onSelectPaymentProfile(paymentProfile);
      closeDropdown();
    },
    [onSelectPaymentProfile, closeDropdown],
  );

  const handleDropdownButtonClick = useCallback(() => {
    // Only show dropdown if there are multiple payment profiles
    if (paymentProfiles.length === 1) {
      return;
    }

    trackQuickPayClickPaymentMethodDropdown();
    setShowSelectionDropdown(prev => !prev);
  }, [paymentProfiles.length, trackQuickPayClickPaymentMethodDropdown]);

  const getCardNetworkIcon = useCallback((cardNetwork: string): string => {
    switch (cardNetwork.toLowerCase()) {
      case "amex":
      case "americanexpress":
        return "icon-amex";
      case "discover":
        return "icon-discover";
      case "mastercard":
        return "icon-mastercard";
      case "visa":
        return "icon-visa";
      case "debit":
        return "icon-debit";
      default:
        return "icon-generic-card";
    }
  }, []);

  const renderCard = useCallback(
    ({ CardNetwork, Last4Digits, ExpMonth, ExpYear }: Card) => {
      const ASTERISK_MASK = "****";
      const expirationDate = new Intl.DateTimeFormat("default", {
        month: "2-digit",
        year: "2-digit",
      }).format(new Date(ExpYear, ExpMonth - 1));

      return (
        <div className="payment-method-container">
          <span className={`payment-method-image card-icon ${getCardNetworkIcon(CardNetwork)}`} />
          <span className="card-number">
            <span className="card-asterisk-mask">{ASTERISK_MASK}</span>
            <span className="payment-profile-label">{Last4Digits}</span>
          </span>
          <span className="card-exp-key">{translate("QuickPay.Expiration")}</span>
          <span className="card-exp-value">{expirationDate}</span>
        </div>
      );
    },
    [getCardNetworkIcon, translate],
  );

  const renderPayPal = useCallback(
    ({ Email }: PayPal) => (
      <div className="payment-method-container">
        <span className="payment-method-image card-icon icon-paypal" />
        <span className="paypal-email">{Email}</span>
      </div>
    ),
    [],
  );

  const renderPaymentMethod = useCallback(
    (providerPayload: Card | PayPal) => {
      if (isPayPalProviderPayload(providerPayload)) {
        return renderPayPal(providerPayload);
      }
      return renderCard(providerPayload);
    },
    [renderPayPal, renderCard],
  );

  return (
    <div className="custom-select">
      {selectedPaymentProfile?.providerPayload && (
        <Fragment>
          <button
            id="select-card-dropdown-button"
            type="button"
            role="combobox"
            className={classNames("select-button", {
              active: showSelectionDropdown,
              error: Boolean(error),
            })}
            aria-labelledby="select-card-dropdown-button"
            aria-haspopup="listbox"
            aria-expanded={showSelectionDropdown}
            aria-controls="select-card-dropdown"
            onClick={handleDropdownButtonClick}
          >
            {renderPaymentMethod(selectedPaymentProfile.providerPayload)}
            <span className={showSelectionDropdown ? "icon-up" : "icon-down"} />
          </button>
          <div
            id="select-card-dropdown"
            role="listbox"
            ref={selectDropdownList}
            className={classNames("select-dropdown", { active: showSelectionDropdown })}
          >
            {paymentProfiles
              .filter(paymentProfile => paymentProfile.id !== selectedPaymentProfile.id)
              .map(paymentProfile => (
                <button
                  type="button"
                  className="dropdown-selection-button"
                  key={paymentProfile.id}
                  onClick={() => {
                    handleCardChange(paymentProfile);
                  }}
                >
                  {renderPaymentMethod(paymentProfile.providerPayload)}
                </button>
              ))}
          </div>
          {error && <div className="error-message">{translate(error)}</div>}
        </Fragment>
      )}
    </div>
  );
}
