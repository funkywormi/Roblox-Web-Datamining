import { Fragment } from "react";
import { PriceTag } from "@rbx/payments/priceTag";
// Keep legacy payment pages styled while they still rely on Navigation's CSS.
import "@rbx/price-tag/legacy.css";
import layoutConstants from "../constants/layoutConstants";
import NavIcon from "./NavIcon";

export default function CreditIcon({
  creditAmount = 0,
  currencyCode = "USD",
  creditError,
}: {
  creditAmount?: number;
  currencyCode?: string;
  creditError?: string;
}) {
  const icon = (
    <Fragment>
      <NavIcon name="icon-regular-wallet" size="XLarge" id="nav-credit-icon" />
      <span className="rbx-text-navbar-right text-header" id="nav-robux-amount">
        {!creditError ? (
          <div className="credit-balance">
            <PriceTag
              amount={creditAmount}
              currencyCode={currencyCode}
              tagClassName="navbar-compact nav-credit-text"
            />
          </div>
        ) : (
          <div className="nav-credit-text">{layoutConstants.robuxOnEconomySystemOutage}</div>
        )}
      </span>
    </Fragment>
  );

  return (
    <span id="nav-robux-icon" className="nav-robux-icon rbx-menu-item nav-credit">
      {icon}
    </span>
  );
}
