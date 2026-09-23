import classNames from "classnames";
import { Fragment, ReactNode } from "react";
import { ValueOf } from "@rbx/core-types";
import { Tooltip as CoreUiTooltip } from "@rbx/core-ui";
import { Tooltip as FoundationTooltip, TooltipTrigger } from "@rbx/foundation-ui";
import { truncNumber } from "@rbx/core-scripts/format/number";
import layoutConstant from "../../constants/layoutConstants";
import RobuxBadgeType from "../../constants/robuxBadgeConstants";
import { useIsTopNavFoundation } from "../../util/topNavFoundationIxp";
import NavIcon from "../NavIcon";

const renderErrorTooltip = (isFoundation: boolean, robuxError: string, icon: ReactNode) => {
  if (isFoundation) {
    return (
      <FoundationTooltip position="bottom-center" title={robuxError}>
        <TooltipTrigger asChild>
          <span>{icon}</span>
        </TooltipTrigger>
      </FoundationTooltip>
    );
  }

  return (
    <CoreUiTooltip
      id="current-error"
      content={robuxError}
      placement="bottom"
      containerClassName="nav-buy-robux-icon-tooltip-container"
    >
      {icon}
    </CoreUiTooltip>
  );
};

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
  const isFoundation = useIsTopNavFoundation();
  const robuxAmountValue = robuxError
    ? layoutConstant.robuxOnEconomySystemOutage
    : truncNumber(robuxAmount);

  // Robux value not shown for experiment variant hideRobuxAndCredit
  const robuxBadgeClass = classNames("notification-red robux-badge", {
    hidden: !robuxBadgeType,
  });
  const icon = (
    <Fragment>
      <NavIcon
        legacyClass="icon-robux-28x28 roblox-popover-close"
        name="icon-regular-robux"
        size="XLarge"
        id="nav-robux"
      />
      {creditDisplayConfig !== layoutConstant.creditDisplayConfigVariants.hideCreditAndRobux && (
        <span className="rbx-text-navbar-right text-header" id="nav-robux-amount">
          {isGetCurrencyCallDone && robuxAmountValue}
        </span>
      )}
    </Fragment>
  );

  return (
    <span id="nav-robux-icon" className="nav-robux-icon rbx-menu-item">
      {robuxError ? renderErrorTooltip(isFoundation, robuxError, icon) : icon}
      <span className={robuxBadgeClass} />
    </span>
  );
}
