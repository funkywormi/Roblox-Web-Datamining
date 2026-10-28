import { useEffect, useState, Fragment } from "react";
import { ValueOf } from "@rbx/core-lib";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { useTranslations } from "@rbx/www-common/i18n";
import { Icon, Menu, MenuItem, MenuLabel, MenuSection, MenuSeparator } from "@rbx/foundation-ui";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import { PriceTag } from "@rbx/payments/priceTag";
import "@rbx/payments/src/priceTag/priceTag.css";

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
  onBuyRobuxExternalClick: () => void;
}) {
  const tAlerts = useTranslations("Common.AlertsAndOptions");
  const tFeatures = useTranslations("CommonUI.Features");
  const tRedeem = useTranslations("Purchasing.RedeemGameCard");
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

  // Rendered even when hidden: .wallet-hidden is display:none above 992px but reverts below it,
  // where the header itself stops showing the balance.
  const walletClassName = isWalletDisplayed ? undefined : "wallet-hidden";

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
                  <span className="dropdown-credit-balance">
                    <PriceTag amount={creditAmount} currencyCode={currencyCode} />
                  </span>
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
            title={tAlerts(buyRobuxUrl.buyRobux.label)}
            onSelect={onBuyRobuxExternalClick}
          />
        ) : (
          <MenuItem
            value="buyRobux"
            as="a"
            href={buyRobuxUrl.buyRobux.url}
            title={tAlerts(buyRobuxUrl.buyRobux.label)}
            trailing={tAlerts.has(robuxBadgeStr) ? tAlerts(robuxBadgeStr) : undefined}
            onSelect={onBuyRobuxClicked}
          />
        )}
        <MenuItem
          value="myTransactions"
          as="a"
          href={buyRobuxUrl.myTransactions.url}
          title={tFeatures(buyRobuxUrl.myTransactions.label)}
        />
        <MenuItem value="redeem" as="a" href={redeemUrl.url} title={tRedeem(redeemUrl.label)} />
      </MenuSection>
    </Menu>
  );
}
