import { useEffect, useState, Fragment } from "react";
import { ValueOf } from "@rbx/core-types";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { useTranslation } from "@rbx/core-scripts/react";
import { Icon, Menu, MenuItem, MenuLabel, MenuSection, MenuSeparator } from "@rbx/foundation-ui";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";

import links from "../../constants/linkConstants";
import layoutConstants from "../../constants/layoutConstants";
import RobuxBadgeType from "../../constants/robuxBadgeConstants";
import { mapRobuxBadgeTypeToStr, setRobuxBadgeLocalStorage } from "../../util/robuxBadgeUtil";
import Link from "../NavLink";
import { useIsTopNavFoundation } from "../../util/topNavFoundationIxp";

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
  onBuyRobuxExternalClick: () => void;
}) {
  const { translate } = useTranslation();
  const isFoundation = useIsTopNavFoundation();
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

  // Rendered even when hidden: .wallet-hidden is display:none above 992px but reverts below it,
  // where the header itself stops showing the balance.
  const walletClassName = isWalletDisplayed ? undefined : "wallet-hidden";

  if (isFoundation) {
    return (
      <Menu size="Large" className="nav-foundation-menu">
        <Fragment>
          <MenuLabel
            className={walletClassName}
            title={robuxAmountValue}
            leading={<Icon name="icon-regular-robux" id="nav-robux" />}
          />
          {creditDisplayConfig !== layoutConstants.creditDisplayConfigVariants.control && (
            <MenuLabel
              className={walletClassName}
              title=""
              leading={
                <Fragment>
                  <Icon name="icon-regular-wallet" />
                  {creditError ? (
                    layoutConstants.robuxOnEconomySystemOutage
                  ) : (
                    // PriceTag mounts onto this selector via the price-tag:render event.
                    <span
                      className="dropdown-credit-balance"
                      data-amount={creditAmount}
                      data-currency-code={currencyCode}
                    />
                  )}
                </Fragment>
              }
            />
          )}
          <MenuSeparator className={walletClassName} />
        </Fragment>
        <MenuSection>
          {isEligibleForVng ? (
            <MenuItem
              value="buyRobuxExternal"
              title={translate(buyRobuxUrl.buyRobux.label)}
              onSelect={onBuyRobuxExternalClick}
            />
          ) : (
            <MenuItem
              value="buyRobux"
              as="a"
              href={buyRobuxUrl.buyRobux.url}
              title={translate(buyRobuxUrl.buyRobux.label)}
              trailing={robuxBadgeStr ? translate(robuxBadgeStr) : undefined}
              onClick={onBuyRobuxClicked}
            />
          )}
          <MenuItem
            value="myTransactions"
            as="a"
            href={buyRobuxUrl.myTransactions.url}
            title={translate(buyRobuxUrl.myTransactions.label)}
          />
          <MenuItem value="redeem" as="a" href={redeemUrl.url} title={translate(redeemUrl.label)} />
        </MenuSection>
      </Menu>
    );
  }

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
