import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Icon } from "@rbx/foundation-ui";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

type RobuxBalanceCardProps = {
  // Undefined when the balance read failed; the number renders blank.
  robuxBalance: number | undefined;
  linkText?: string;
  linkPath?: string;
  action?: React.ReactNode;
};

export const RobuxBalanceCard = ({
  robuxBalance,
  linkText,
  linkPath,
  action,
}: RobuxBalanceCardProps): React.JSX.Element => {
  const { translate } = useTranslation();
  const { giftRobux } = parentalControlsTranslationConstants;

  return (
    <PreviewCard title={translate(giftRobux.heading)} linkText={linkText} linkPath={linkPath}>
      <div className="robux-balance-card padding-large flex items-center justify-between gap-medium">
        <div className="flex flex-col gap-xsmall">
          <div className="flex items-center gap-xsmall">
            <Icon name="icon-filled-robux" size="Medium" />
            <span className="text-heading-small content-emphasis">
              {robuxBalance === undefined ? "" : formatNumber(robuxBalance)}
            </span>
          </div>
          <span className="text-label-medium content-muted">
            {translate(giftRobux.balanceLabel)}
          </span>
        </div>
        {action}
      </div>
    </PreviewCard>
  );
};

export default RobuxBalanceCard;
