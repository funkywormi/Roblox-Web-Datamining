import classNames from "classnames";
import { Fragment, ReactNode } from "react";
import { ValueOf } from "@rbx/core-types";
import { Tooltip as FoundationTooltip, TooltipTrigger } from "@rbx/foundation-ui";
import { truncNumber } from "@rbx/core-scripts/format/number";
import layoutConstant from "../../constants/layoutConstants";
import RobuxBadgeType from "../../constants/robuxBadgeConstants";
import NavIcon from "../NavIcon";

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
  const robuxAmountValue = robuxError
    ? layoutConstant.robuxOnEconomySystemOutage
    : truncNumber(robuxAmount);

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
