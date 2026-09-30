import React, { useCallback, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button } from "@rbx/foundation-ui";
import type { TChildInfo } from "../../../../../types/childrenInfoTypes";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import { useAppSelector } from "../../../../redux/hooks";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { trackError } from "../../../giftRobux/observability";
import RobuxBalanceCard from "../shared/RobuxBalanceCard";
import GiftRobuxErrorBoundary from "./GiftRobuxErrorBoundary";
import GiftRobuxSheet from "./GiftRobuxSheet";

const tryAgainTranslationKey = "Action.TryAgain";

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
    <RobuxBalanceCard
      robuxBalance={child.robuxBalance}
      linkText={
        robuxSettingsPath === undefined ? undefined : translate(commonTranslationConstants.manage)
      }
      linkPath={robuxSettingsPath}
      action={
        canAddRobux && (
          <div className="shrink-0">
            <GiftRobuxErrorBoundary
              key={giftActionKey}
              fallback={<GiftRobuxActionFallback onRetry={resetGiftAction} />}
              onError={handleGiftActionError}
            >
              <GiftRobuxSheet child={child} />
            </GiftRobuxErrorBoundary>
          </div>
        )
      }
    />
  );
};

export default RobuxBalanceSection;
