import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-utilities";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Icon } from "@rbx/foundation-ui";
import {
  RobuxTransferApprovalMode,
  toEffectiveRobuxTransferLimits,
  toRobuxTransferLimitsInputFromSetting,
  TSettingsPage,
} from "@rbx/user-settings";
import RobuxSettingName from "../../../../../enums/RobuxSettingName";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";
import { useGetCurrentUserTransferLimitCeilingsQuery } from "../../../../apis/transferLimitsApi";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
import SettingsList from "../../../../common/components/routing/SettingsList";
import { parentZonePages } from "../../../constants/parentalControls/parentZonePages";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import { trackCounter } from "./observability";
import { ParentZoneCounter } from "./observability/eventConstants";

const { robuxTransferApprovals } = parentalControlsTranslationConstants;

const approvalModeLabels: Record<RobuxTransferApprovalMode, string> = {
  [RobuxTransferApprovalMode.AlwaysAsk]: robuxTransferApprovals.alwaysAsk,
  [RobuxTransferApprovalMode.TrustedFriendsAutoApproved]:
    robuxTransferApprovals.alwaysAllowForTrustedFriends,
};

// Robux settings viewed by an on-device parent. Either permission opens this page, so each row
// checks its own. Approvals also needs that setting.
export const OdpRobuxPage = (): React.JSX.Element => {
  const { translate } = useTranslation();
  const { robuxTransferLimits } = parentalControlsTranslationConstants;
  const { robuxApprovalsPage, robuxTransferLimitsPage } = parentZonePages;

  useEffect(() => {
    trackCounter(ParentZoneCounter.PageShown, { page: SettingCategoryPageName.Robux });
  }, []);

  // An on-device parent is signed in on the child's account, so these reads are self-reads.
  const { data: odpChildContext } = useGetOdpChildContextQuery();
  const { data: ceilings } = useGetCurrentUserTransferLimitCeilingsQuery();
  const [childSettings] = useGetSettingsAndOptionsV2();

  const showTransferLimits = odpChildContext?.canParentManageChildRobuxTransferLimits === true;
  const showApprovals =
    odpChildContext?.canParentManageChildRobuxTransferSettings === true &&
    childSettings?.robuxTransferApprovalMode !== undefined;

  const pagesWithCurrentValues: Record<string, TSettingsPage> = useMemo(() => {
    const pages: Record<string, TSettingsPage> = {};

    if (showTransferLimits) {
      const effectiveLimits = toEffectiveRobuxTransferLimits(
        toRobuxTransferLimitsInputFromSetting(childSettings?.robuxTransferLimits),
        ceilings,
      );
      pages[RobuxSettingName.TransferLimits] = {
        ...robuxTransferLimitsPage,
        currentValueComponent:
          effectiveLimits !== undefined ? (
            <span className="flex items-center gap-xsmall">
              <Icon name="icon-filled-robux" size="Small" />
              <span>
                {translate(robuxTransferLimits.dailyLimitValue, {
                  limit: formatNumber(effectiveLimits.daily),
                })}
              </span>
              <span>•</span>
              <Icon name="icon-filled-robux" size="Small" />
              <span>
                {translate(robuxTransferLimits.monthlyLimitValue, {
                  limit: formatNumber(effectiveLimits.monthly),
                })}
              </span>
            </span>
          ) : undefined,
      };
    }

    if (showApprovals) {
      const approvalMode = childSettings?.robuxTransferApprovalMode?.currentValue;
      const approvalLabel = approvalMode != null ? approvalModeLabels[approvalMode] : undefined;
      pages[RobuxSettingName.Approvals] = {
        ...robuxApprovalsPage,
        currentValueComponent:
          approvalLabel != null ? <span>{translate(approvalLabel)}</span> : undefined,
      };
    }

    return pages;
  }, [
    showTransferLimits,
    showApprovals,
    childSettings,
    ceilings,
    robuxTransferLimitsPage,
    robuxApprovalsPage,
    translate,
    robuxTransferLimits,
  ]);

  return <SettingsList subPages={pagesWithCurrentValues} />;
};

export default OdpRobuxPage;
