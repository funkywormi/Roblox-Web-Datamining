import { useEffect, useState, Fragment } from "react";
import { ValueOf } from "@rbx/core-lib";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { useTranslations } from "@rbx/www-common/i18n";
import { Icon, Menu, MenuItem, MenuLabel, MenuSection, MenuSeparator } from "@rbx/foundation-ui";
import {
  PURCHASE_EVENT_TYPE,
  TRIGGERING_CONTEXT,
  VIEW_MESSAGE,
  VIEW_NAME,
  type ViewMessage,
} from "@rbx/payments/payments-flow-analytics";
import { sendUserPurchaseFlowEvent } from "../../util/purchaseFlowUtil";
import { PriceTag } from "@rbx/payments/priceTag";
// Keep legacy payment pages styled while they still rely on Navigation's CSS.
import "@rbx/price-tag/legacy.css";

import links from "../../constants/linkConstants";
import layoutConstants from "../../constants/layoutConstants";
import RobuxBadgeType from "../../constants/robuxBadgeConstants";
import { mapRobuxBadgeTypeToStr, setRobuxBadgeLocalStorage } from "../../util/robuxBadgeUtil";
import { useNavHref } from "../../util/navHref";

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
  const toNavHref = useNavHref();
  const tAlerts = useTranslations("Common.AlertsAndOptions");
  const tFeatures = useTranslations("CommonUI.Features");
  const tRedeem = useTranslations("Purchasing.RedeemGameCard");
  const [isWalletDisplayed, setIsWalletDisplayed] = useState(true);

  const robuxAmountValue = robuxError
    ? layoutConstants.robuxOnEconomySystemOutage
    : formatNumber(robuxAmount);

  const sendViewMessageEvent = (viewMessage: ViewMessage) => {
    sendUserPurchaseFlowEvent({
      triggerContext: TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      isMidPurchaseStep: false,
      viewName: VIEW_NAME.NAVIGATION_DROPDOWN_MENU,
      purchaseEventType: PURCHASE_EVENT_TYPE.USER_INPUT,
      viewMessage,
    });
  };

  const onBuyRobuxClicked = () => {
    sendViewMessageEvent(VIEW_MESSAGE.BUY_ROBUX);
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
            href={toNavHref(buyRobuxUrl.buyRobux.url)}
            title={tAlerts(buyRobuxUrl.buyRobux.label)}
            trailing={tAlerts.has(robuxBadgeStr) ? tAlerts(robuxBadgeStr) : undefined}
            onSelect={onBuyRobuxClicked}
          />
        )}
        <MenuItem
          value="myTransactions"
          as="a"
          href={toNavHref(buyRobuxUrl.myTransactions.url)}
          title={tFeatures(buyRobuxUrl.myTransactions.label)}
        />
        <MenuItem
          value="redeem"
          as="a"
          href={toNavHref(redeemUrl.url)}
          title={tRedeem(redeemUrl.label)}
        />
      </MenuSection>
    </Menu>
  );
}
