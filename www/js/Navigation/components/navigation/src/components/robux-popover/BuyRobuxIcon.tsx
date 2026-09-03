import classNames from "classnames";
import { Fragment } from "react";
import { ValueOf } from "@rbx/core-types";
import { Tooltip } from "@rbx/core-ui";
import { truncNumber } from "@rbx/core-scripts/format/number";
import layoutConstant from "../../constants/layoutConstants";
import RobuxBadgeType from "../../constants/robuxBadgeConstants";

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
      <span className="icon-robux-28x28 roblox-popover-close" id="nav-robux" />
      {creditDisplayConfig !== layoutConstant.creditDisplayConfigVariants.hideCreditAndRobux && (
        <span className="rbx-text-navbar-right text-header" id="nav-robux-amount">
          {isGetCurrencyCallDone && robuxAmountValue}
        </span>
      )}
    </Fragment>
  );

  return (
    <span id="nav-robux-icon" className="nav-robux-icon rbx-menu-item">
      {robuxError ? (
        <Tooltip
          id="current-error"
          content={robuxError}
          placement="bottom"
          containerClassName="nav-buy-robux-icon-tooltip-container"
        >
          {icon}
        </Tooltip>
      ) : (
        icon
      )}
      <span className={robuxBadgeClass} />
    </span>
  );
}
