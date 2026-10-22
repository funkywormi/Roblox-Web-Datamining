import { useContext, type ReactNode } from "react";
import { Dropdown, Menu, MenuItem, MenuSection } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { TrackingContext } from "../../contexts/TrackingContext";
import { Card, PaymentProfile, PayPal } from "../../services/paymentsGatewayService";
import { isPayPalProviderPayload } from "../../utils/paymentProfile";

const ASTERISK_MASK = "****";

type SelectCardDropdownProps = {
  error?: string;
  onSelectPaymentProfile: (paymentProfile: PaymentProfile) => void;
  paymentProfiles: PaymentProfile[];
  selectedPaymentProfile: PaymentProfile | undefined;
};

function getCardNetworkIcon(cardNetwork: string): string {
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
}

function formatExpiration(expMonth: number, expYear: number): string {
  return new Intl.DateTimeFormat("default", {
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(expYear, expMonth - 1));
}

function paymentMethodText(payload: Card | PayPal, expirationLabel: string): string {
  if (isPayPalProviderPayload(payload)) {
    return payload.Email ?? "";
  }

  return `${ASTERISK_MASK}${payload.Last4Digits} ${expirationLabel} ${formatExpiration(payload.ExpMonth, payload.ExpYear)}`;
}

/**
 * Foundation types `MenuItem` `title` as a string, but renders it as React children and portals
 * that node into the closed trigger. The card row has to be the title so the brand mark stays
 * visible after the menu closes.
 */
function menuItemTitle(label: ReactNode): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see function comment
  return label as unknown as string;
}

function PaymentMethodRow({
  expirationLabel,
  payload,
}: {
  expirationLabel: string;
  payload: Card | PayPal;
}) {
  const containerClassName = "payment-method-container text-body-small medium:text-body-large";

  if (isPayPalProviderPayload(payload)) {
    return (
      <span className={containerClassName}>
        <span className="payment-method-image card-icon icon-paypal" />
        <span className="paypal-email">{payload.Email}</span>
      </span>
    );
  }

  return (
    <span className={containerClassName}>
      <span
        className={`payment-method-image card-icon ${getCardNetworkIcon(payload.CardNetwork)}`}
      />
      <span className="card-number">
        <span className="card-asterisk-mask">{ASTERISK_MASK}</span>
        <span className="payment-profile-label">{payload.Last4Digits}</span>
      </span>
      <span className="card-exp-key">{expirationLabel}</span>
      <span className="card-exp-value">{formatExpiration(payload.ExpMonth, payload.ExpYear)}</span>
    </span>
  );
}

export function QuickPaySelectCardDropdown({
  error,
  onSelectPaymentProfile,
  paymentProfiles,
  selectedPaymentProfile,
}: SelectCardDropdownProps) {
  const { trackQuickPayClickPaymentMethodDropdown } = useContext(TrackingContext);

  const { translate } = useTranslation();
  const canSwitchPaymentMethod = paymentProfiles.length > 1;

  if (!selectedPaymentProfile?.providerPayload) {
    return null;
  }

  return (
    <Dropdown
      size="Large"
      value={selectedPaymentProfile.id}
      placeholder={paymentMethodText(
        selectedPaymentProfile.providerPayload,
        translate("QuickPay.Expiration"),
      )}
      hasError={Boolean(error)}
      hint={error ? translate(error) : undefined}
      onOpenChange={open => {
        if (open && canSwitchPaymentMethod) {
          trackQuickPayClickPaymentMethodDropdown();
        }
      }}
      onValueChange={paymentProfileId => {
        if (paymentProfileId === selectedPaymentProfile.id) {
          return;
        }

        const paymentProfile = paymentProfiles.find(profile => profile.id === paymentProfileId);
        if (paymentProfile) {
          onSelectPaymentProfile(paymentProfile);
        }
      }}
    >
      <Menu>
        <MenuSection>
          {paymentProfiles.map(paymentProfile => (
            <MenuItem
              key={paymentProfile.id}
              value={paymentProfile.id}
              title={menuItemTitle(
                <PaymentMethodRow
                  expirationLabel={translate("QuickPay.Expiration")}
                  payload={paymentProfile.providerPayload}
                />,
              )}
            />
          ))}
        </MenuSection>
      </Menu>
    </Dropdown>
  );
}
