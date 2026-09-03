import { Fragment, useEffect } from "react";
import layoutConstants from "../constants/layoutConstants";

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
      <span className="icon-menu-wallet roblox-popover-close" id="nav-credit-icon" />
      <span className="rbx-text-navbar-right text-header" id="nav-robux-amount">
        {!creditError ? (
          <div
            className="credit-balance"
            data-amount={creditAmount}
            data-currency-code={currencyCode}
          />
        ) : (
          <div className="nav-credit-text">{layoutConstants.robuxOnEconomySystemOutage}</div>
        )}
      </span>
    </Fragment>
  );

  useEffect(() => {
    // Render PriceTag component
    window.dispatchEvent(
      new CustomEvent("price-tag:render", {
        detail: {
          targetSelector: ".credit-balance",
          tagClassName: "navbar-compact nav-credit-text",
        },
      }),
    );
  }, [creditAmount, currencyCode]);

  return (
    <span id="nav-robux-icon" className="nav-robux-icon rbx-menu-item nav-credit">
      {icon}
    </span>
  );
}
