import classNames from "classnames";
import { Fragment, ReactNode } from "react";
import { ValueOf } from "@rbx/core-lib";
import { Tooltip as FoundationTooltip, TooltipTrigger } from "@rbx/foundation-ui";
import { formatNumber, truncNumber } from "@rbx/core-scripts/format/number";
import layoutConstant from "../../constants/layoutConstants";
import RobuxBadgeType from "../../constants/robuxBadgeConstants";
import NavIcon from "../NavIcon";
import useNumberLocale from "../../hooks/useNumberLocale";

const robuxTruncThreshold = 10000;

const renderErrorTooltip = (robuxError: string, icon: ReactNode) => (
  <FoundationTooltip position="bottom-center" title={robuxError}>
    <TooltipTrigger asChild>
      <span>{icon}</span>
    </TooltipTrigger>
  </FoundationTooltip>
);

export default function BuyRobuxIcon({
  robuxAmount,
  isGetCurrencyCallDone,
  robuxError,
  creditDisplayConfig,
  robuxBadgeType,
}: {
  robuxAmount: number;
  robuxError?: string;
  isGetCurrencyCallDone: boolean;
  creditDisplayConfig: string;
  robuxBadgeType?: ValueOf<typeof RobuxBadgeType>;
}) {
  const locale = useNumberLocale();
  const robuxAmountValue = robuxError
    ? layoutConstant.robuxOnEconomySystemOutage
    : robuxAmount < robuxTruncThreshold
      ? formatNumber(robuxAmount, locale)
      : truncNumber(robuxAmount, robuxTruncThreshold);

  // Robux value not shown for experiment variant hideRobuxAndCredit
  const robuxBadgeClass = classNames("notification-red robux-badge", {
    hidden: !robuxBadgeType,
  });
  const icon = (
    <Fragment>
      <NavIcon name="icon-regular-robux" size="XLarge" id="nav-robux" />
      {creditDisplayConfig !== layoutConstant.creditDisplayConfigVariants.hideCreditAndRobux && (
        <span className="rbx-text-navbar-right text-header" id="nav-robux-amount">
          {isGetCurrencyCallDone && robuxAmountValue}
        </span>
      )}
    </Fragment>
  );

  return (
    <span id="nav-robux-icon" className="nav-robux-icon rbx-menu-item">
      {robuxError ? renderErrorTooltip(robuxError, icon) : icon}
      <span className={robuxBadgeClass} />
    </span>
  );
}
