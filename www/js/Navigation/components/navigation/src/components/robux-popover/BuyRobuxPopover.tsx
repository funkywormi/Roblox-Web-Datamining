import { useRef, useState } from "react";
import classNames from "classnames";
import { ValueOf } from "@rbx/core-lib";
import { useTranslations } from "@rbx/www-common/i18n";
import {
  PURCHASE_EVENT_TYPE,
  TRIGGERING_CONTEXT,
  VIEW_MESSAGE,
  VIEW_NAME,
  type ViewMessage,
} from "@rbx/payments/payments-flow-analytics";
import { sendUserPurchaseFlowEvent } from "../../util/purchaseFlowUtil";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Popover as FoundationPopover, PopoverContent, PopoverTrigger } from "@rbx/foundation-ui";
import BuyRobuxIcon from "./BuyRobuxIcon";
import RobuxMenu from "./RobuxMenu";
import CreditIcon from "../CreditIcon";
import links from "../../constants/linkConstants";
import layoutConstants from "../../constants/layoutConstants";
import LeaveRobloxPopupDisclaimer from "./LeaveRobloxPopupDisclaimer";
import { getNavCapability } from "../../util/navCapabilities";
import RobuxBadgeType from "../../constants/robuxBadgeConstants";
import { popoverDismissGuard } from "../../util/popoverDismissGuard";
import useNumberLocale from "../../hooks/useNumberLocale";

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
  const t = useTranslations("CommonUI.Features");

  const { buyRobuxUrl } = links;
  const { buyRobuxOnVng } = buyRobuxUrl;
  const containerRef = useRef<HTMLLIElement>(null);

  // vng buy robux pop up a disclaimer before redirecting
  const [isLeaveRobloxDisclaimerModalOpen, setIsLeaveRobloxDisclaimerModalOpen] = useState(false);

  const sendAnalyticsEvent = (viewMessage: ViewMessage) => {
    sendUserPurchaseFlowEvent({
      triggerContext: TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      isMidPurchaseStep: false,
      viewName: VIEW_NAME.NAVIGATION_DROPDOWN_MENU,
      purchaseEventType: PURCHASE_EVENT_TYPE.USER_INPUT,
      viewMessage,
    });
  };

  const onBuyRobuxExternalClick = () => {
    sendAnalyticsEvent(VIEW_MESSAGE.EXTERNAL_LINK_MODAL);

    setIsLeaveRobloxDisclaimerModalOpen(true);
  };

  const onBuyRobuxExternalClose = () => {
    setIsLeaveRobloxDisclaimerModalOpen(false);
  };

  const onBuyRobuxExternalContinue = () => {
    sendAnalyticsEvent(VIEW_MESSAGE.CONTINUE_TO_VNG);

    const getVngShopUrl =
      getNavCapability("getVngShopSignedRedirectionUrl") ??
      (() => Promise.resolve<{ vngShopRedirectUrl?: string }>({}));
    getVngShopUrl().then(
      ({ vngShopRedirectUrl }) => {
        window.open(vngShopRedirectUrl ?? buyRobuxOnVng.url, "_blank")?.focus();
      },
      () => {
        window.open(buyRobuxOnVng.url, "_blank")?.focus();
      },
    );

    setIsLeaveRobloxDisclaimerModalOpen(false);
  };

  const locale = useNumberLocale();
  // Wallet credit balance only shown on showCreditAndRobux variant
  const triggerLabel =
    robuxAmount > 0
      ? t.has("Label.sRobuxBalance")
        ? t("Label.sRobuxBalance", { robuxAmount: formatNumber(robuxAmount, locale) })
        : `Robux: ${formatNumber(robuxAmount, locale)}`
      : t("Label.sRobux");

  const trigger = (
    <button
      type="button"
      className="btn-navigation-nav-robux-md"
      aria-label={triggerLabel}
      aria-haspopup="true"
    >
      <BuyRobuxIcon
        robuxAmount={robuxAmount}
        isGetCurrencyCallDone={isGetCurrencyCallDone}
        robuxError={robuxError}
        creditDisplayConfig={creditDisplayConfig}
        robuxBadgeType={robuxBadgeType}
      />
      {creditDisplayConfig === layoutConstants.creditDisplayConfigVariants.showCreditAndRobux && (
        <CreditIcon
          creditAmount={creditAmount}
          currencyCode={currencyCode}
          creditError={creditError}
        />
      )}
    </button>
  );

  const robuxMenu = (
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
  );

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
        <FoundationPopover>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            ariaLabel={triggerLabel}
            {...popoverDismissGuard(containerRef)}
          >
            {robuxMenu}
          </PopoverContent>
        </FoundationPopover>
      )}
    </li>
  );
}
