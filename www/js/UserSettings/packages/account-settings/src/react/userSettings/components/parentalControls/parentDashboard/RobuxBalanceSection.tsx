import React, { useCallback, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button, Icon } from "@rbx/foundation-ui";
import { formatNumber } from "@rbx/core-scripts/format/number";
import PreviewCardComponent from "../../../../common/components/routing/PreviewCard";
import type { TChildInfo } from "../../../../../types/childrenInfoTypes";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import { useAppSelector } from "../../../../redux/hooks";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { trackError } from "../../../giftRobux/observability";
import GiftRobuxErrorBoundary from "./GiftRobuxErrorBoundary";
import GiftRobuxSheet from "./GiftRobuxSheet";

const tryAgainTranslationKey = "Action.TryAgain";

const formatRobuxBalance = (robuxBalance: TChildInfo["robuxBalance"]): string => {
  if (robuxBalance === undefined) {
    return "";
  }

  return formatNumber(robuxBalance);
};

type GiftRobuxActionFallbackProps = {
  onRetry: () => void;
};

const GiftRobuxActionFallback = ({ onRetry }: GiftRobuxActionFallbackProps): React.JSX.Element => {
  const { translate } = useTranslation();

  return (
    <div className="flex flex-col gap-xsmall items-end">
      <Button variant="Standard" size="Medium" className="shrink-0" onClick={onRetry}>
        {translate(tryAgainTranslationKey)}
      </Button>
      <span className="text-body-small content-system-alert" role="alert">
        {translate(commonTranslationConstants.unknownError)}
      </span>
    </div>
  );
};

const RobuxBalanceSection = ({ child }: { child: TChildInfo }): React.JSX.Element => {
  const [giftActionKey, setGiftActionKey] = useState(0);
  const { translate } = useTranslation();
  const robuxBalance = formatRobuxBalance(child.robuxBalance);
  const { giftRobux } = parentalControlsTranslationConstants;

  // An absent balance means the balance read failed, so the card renders it blank
  // rather than as a number. Offering a purchase against a balance we could not
  // read would be misleading, so the action is withheld in that case too.
  const canAddRobux = child.canParentGiftChildRobux === true && child.robuxBalance !== undefined;

  const childPages = useAppSelector(selectChildPagesForChildUserId(child.userId));
  const robuxSettingsPath = child.canParentManageChildRobuxTransferLimits
    ? childPages?.childSettingCategoryPages[SettingCategoryPageName.Robux]?.path
    : undefined;

  const handleGiftActionError = useCallback(() => {
    trackError("AddRobuxSheetRenderError");
  }, []);

  const resetGiftAction = useCallback(() => {
    setGiftActionKey(key => key + 1);
  }, []);

  return (
    <PreviewCardComponent
      title={translate(giftRobux.heading)}
      linkText={
        robuxSettingsPath === undefined ? undefined : translate(commonTranslationConstants.manage)
      }
      linkPath={robuxSettingsPath}
    >
      <div className="robux-balance-card padding-large flex items-center justify-between gap-medium">
        <div className="flex flex-col gap-xsmall">
          <div className="flex items-center gap-xsmall">
            <Icon name="icon-filled-robux" size="Medium" />
            <span className="text-heading-small content-emphasis">{robuxBalance}</span>
          </div>
          <span className="text-label-medium content-muted">
            {translate(giftRobux.balanceLabel)}
          </span>
        </div>
        {canAddRobux && (
          <div className="shrink-0">
            <GiftRobuxErrorBoundary
              key={giftActionKey}
              fallback={<GiftRobuxActionFallback onRetry={resetGiftAction} />}
              onError={handleGiftActionError}
            >
              <GiftRobuxSheet child={child} />
            </GiftRobuxErrorBoundary>
          </div>
        )}
      </div>
    </PreviewCardComponent>
  );
};

export default RobuxBalanceSection;
