import { useRef, useState } from "react";
import classNames from "classnames";
import { ValueOf } from "@rbx/core-types";
import { useTranslation, TranslationProvider } from "@rbx/core-scripts/react";
import analytics from "@rbx/core-scripts/payments-flow";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Popover } from "@rbx/core-ui";
import BuyRobuxIcon from "./BuyRobuxIcon";
import RobuxMenu from "./RobuxMenu";
import CreditIcon from "../CreditIcon";
import links from "../../constants/linkConstants";
import layoutConstants from "../../constants/layoutConstants";
import LeaveRobloxPopupDisclaimer from "./LeaveRobloxPopupDisclaimer";
import { getVngShopSignedRedirectionUrl } from "../../services/navigationService";
import RobuxBadgeType from "../../constants/robuxBadgeConstants";
import { translations } from "../../../component.json";

export default function BuyRobuxPopover({
  creditAmount,
  creditDisplayConfig,
  creditError = "",
  currencyCode,
  isEligibleForVng = false,
  isExperimentCallDone = false,
  isGetCurrencyCallDone,
  robuxBadgeType,
  robuxAmount,
  robuxError = "",
}: {
  robuxAmount: number;
  robuxError?: string;
  isGetCurrencyCallDone: boolean;
  creditAmount: number;
  currencyCode: string;
  creditError?: string;
  creditDisplayConfig: ValueOf<typeof layoutConstants.creditDisplayConfigVariants>;
  isExperimentCallDone?: boolean;
  isEligibleForVng?: boolean;
  robuxBadgeType?: ValueOf<typeof RobuxBadgeType>;
}) {
  const { translate } = useTranslation();

  const { buyRobuxUrl } = links;
  const { buyRobuxOnVng } = buyRobuxUrl;
  const { ENUM_TRIGGERING_CONTEXT, ENUM_VIEW_NAME, ENUM_VIEW_MESSAGE, ENUM_PURCHASE_EVENT_TYPE } =
    analytics;
  const containerRef = useRef<HTMLLIElement>(null);

  // vng buy robux pop up a disclaimer before redirecting
  const [isLeaveRobloxDisclaimerModalOpen, setIsLeaveRobloxDisclaimerModalOpen] = useState(false);

  const sendAnalyticsEvent = (viewMessage: ValueOf<typeof ENUM_VIEW_MESSAGE>) => {
    analytics.sendUserPurchaseFlowEvent(
      ENUM_TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      false,
      ENUM_VIEW_NAME.NAVIGATION_DROPDOWN_MENU,
      ENUM_PURCHASE_EVENT_TYPE.USER_INPUT,
      viewMessage,
    );
  };

  const onBuyRobuxExternalClick = () => {
    sendAnalyticsEvent(ENUM_VIEW_MESSAGE.EXTERNAL_LINK_MODAL);

    setIsLeaveRobloxDisclaimerModalOpen(true);
  };

  const onBuyRobuxExternalClose = () => {
    setIsLeaveRobloxDisclaimerModalOpen(false);
  };

  const onBuyRobuxExternalContinue = () => {
    sendAnalyticsEvent(ENUM_VIEW_MESSAGE.CONTINUE_TO_VNG);

    getVngShopSignedRedirectionUrl().then(
      ({ data: { vngShopRedirectUrl } }) => {
        window.open(vngShopRedirectUrl ?? buyRobuxOnVng.url, "_blank")?.focus();
      },
      () => {
        window.open(buyRobuxOnVng.url, "_blank")?.focus();
      },
    );

    setIsLeaveRobloxDisclaimerModalOpen(false);
  };

  // Wallet credit balance only shown on showCreditAndRobux variant
  return (
    <li
      id="navbar-robux"
      ref={containerRef}
      className={classNames("navbar-icon-item", {
        "robux-popover-margins":
          creditDisplayConfig === layoutConstants.creditDisplayConfigVariants.hideCreditAndRobux,
      })}
    >
      {isEligibleForVng && (
        <LeaveRobloxPopupDisclaimer
          isOpen={isLeaveRobloxDisclaimerModalOpen}
          onClose={onBuyRobuxExternalClose}
          onContinue={onBuyRobuxExternalContinue}
        />
      )}
      {isExperimentCallDone && (
        <Popover
          id="buy-robux-popover"
          trigger="click"
          placement="bottom"
          button={
            <button
              type="button"
              className="btn-navigation-nav-robux-md"
              aria-label={
                robuxAmount > 0
                  ? translate("Label.sRobuxBalance", {
                      robuxAmount: formatNumber(robuxAmount),
                    }) || `Robux: ${formatNumber(robuxAmount)}`
                  : translate("Label.sRobux")
              }
              aria-haspopup="true"
            >
              <BuyRobuxIcon
                robuxAmount={robuxAmount}
                isGetCurrencyCallDone={isGetCurrencyCallDone}
                robuxError={robuxError}
                creditDisplayConfig={creditDisplayConfig}
                robuxBadgeType={robuxBadgeType}
              />
              {
                // Wallet credit balance only shown on showCreditAndRobux variant
                creditDisplayConfig ===
                  layoutConstants.creditDisplayConfigVariants.showCreditAndRobux && (
                  <CreditIcon
                    creditAmount={creditAmount}
                    currencyCode={currencyCode}
                    creditError={creditError}
                  />
                )
              }
            </button>
          }
          role="menu"
          container={containerRef.current}
        >
          <TranslationProvider config={translations}>
            <div>
              <ul id="buy-robux-popover-menu" className="dropdown-menu">
                <RobuxMenu
                  isEligibleForVng={isEligibleForVng}
                  robuxAmount={robuxAmount}
                  robuxError={robuxError}
                  creditAmount={creditAmount}
                  currencyCode={currencyCode}
                  creditError={creditError}
                  creditDisplayConfig={creditDisplayConfig}
                  onBuyRobuxExternalClick={onBuyRobuxExternalClick}
                  robuxBadgeType={robuxBadgeType}
                />
              </ul>
            </div>
          </TranslationProvider>
        </Popover>
      )}
    </li>
  );
}
