import { useEffect, useState, Fragment, MouseEventHandler } from "react";
import { ValueOf } from "@rbx/core-types";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { useTranslation } from "@rbx/core-scripts/react";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import { Link } from "@rbx/core-ui";
import links from "../../constants/linkConstants";
import layoutConstants from "../../constants/layoutConstants";
import RobuxBadgeType from "../../constants/robuxBadgeConstants";
import { mapRobuxBadgeTypeToStr, setRobuxBadgeLocalStorage } from "../../util/robuxBadgeUtil";

const { buyRobuxUrl, redeemUrl } = links;

export default function RobuxMenu({
  creditAmount,
  creditDisplayConfig,
  creditError = "",
  currencyCode,
  isEligibleForVng = false,
  robuxAmount,
  robuxError = "",
  onBuyRobuxExternalClick,
  robuxBadgeType,
}: {
  isEligibleForVng?: boolean;
  robuxAmount: number;
  robuxError?: string;
  creditAmount: number;
  currencyCode: string;
  creditError?: string;
  robuxBadgeType?: ValueOf<typeof RobuxBadgeType>;
  creditDisplayConfig: ValueOf<typeof layoutConstants.creditDisplayConfigVariants>;
  onBuyRobuxExternalClick: MouseEventHandler;
}) {
  const { translate } = useTranslation();
  const [isWalletDisplayed, setIsWalletDisplayed] = useState(true);

  const robuxAmountValue = robuxError
    ? layoutConstants.robuxOnEconomySystemOutage
    : formatNumber(robuxAmount);

  const sendViewMessageEvent = (
    viewMessage: ValueOf<typeof paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE>,
  ) => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      false,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.NAVIGATION_DROPDOWN_MENU,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      viewMessage,
    );
  };

  const onBuyRobuxClicked = () => {
    sendViewMessageEvent(paymentFlowAnalyticsService.ENUM_VIEW_MESSAGE.BUY_ROBUX);
    if (robuxBadgeType != null) {
      setRobuxBadgeLocalStorage(robuxBadgeType);
    }
  };

  const robuxBadgeStr = robuxBadgeType == null ? "" : mapRobuxBadgeTypeToStr(robuxBadgeType);

  useEffect(() => {
    // if none of creditAmount or robuxAmount is truncated, then don't display wallet balance
    // must display wallet if variant hideCreditAndRobux
    if (
      robuxAmount < layoutConstants.truncateThreshold.robuxTruncateThreshold &&
      creditAmount < layoutConstants.truncateThreshold.creditTruncateThreshold &&
      creditDisplayConfig !== layoutConstants.creditDisplayConfigVariants.hideCreditAndRobux
    ) {
      setIsWalletDisplayed(false);
    }
  }, [robuxAmount, creditAmount, creditDisplayConfig]);

  useEffect(() => {
    // Render PriceTag component
    window.dispatchEvent(
      new CustomEvent("price-tag:render", {
        detail: {
          targetSelector: ".dropdown-credit-balance",
        },
      }),
    );
  }, [creditDisplayConfig]);

  return (
    <Fragment>
      <div className={isWalletDisplayed ? "" : "wallet-hidden"}>
        <li className="dropdown-wallet">
          <Link className="dropdown-wallet-section">
            <span className="icon-robux-28x28" id="nav-robux" />
            <span id="nav-robux-balance">{robuxAmountValue}</span>
          </Link>
        </li>
        {/* credit balance not displayed in control variant */}
        {creditDisplayConfig !== layoutConstants.creditDisplayConfigVariants.control && (
          <li className="dropdown-wallet">
            <Link className="dropdown-wallet-section">
              <span className="icon-menu-wallet" />
              {!creditError ? (
                <span
                  className="dropdown-credit-balance"
                  data-amount={creditAmount}
                  data-currency-code={currencyCode}
                />
              ) : (
                layoutConstants.robuxOnEconomySystemOutage
              )}
            </Link>
          </li>
        )}
        <li className="rbx-divider" />
      </div>
      {isEligibleForVng ? (
        <li>
          <button type="button" className="rbx-menu-item" onClick={onBuyRobuxExternalClick}>
            {translate(buyRobuxUrl.buyRobux.label)}
          </button>
        </li>
      ) : (
        <li className="rbx-menu-item-container">
          <Link
            cssClasses="rbx-menu-item buy-robux-button"
            url={buyRobuxUrl.buyRobux.url}
            onClick={onBuyRobuxClicked}
          >
            <span className="buy-robux-link-container">
              {translate(buyRobuxUrl.buyRobux.label)}
              {robuxBadgeStr && (
                <div className="new-item-pill small">
                  <span className="new-item-pill-text">{translate(robuxBadgeStr)}</span>
                </div>
              )}
            </span>
          </Link>
        </li>
      )}

      <li>
        <Link cssClasses="rbx-menu-item" url={buyRobuxUrl.myTransactions.url}>
          {translate(buyRobuxUrl.myTransactions.label)}
        </Link>
      </li>

      <li>
        <Link cssClasses="rbx-menu-item" url={redeemUrl.url}>
          {translate(redeemUrl.label)}
        </Link>
      </li>
    </Fragment>
  );
}
