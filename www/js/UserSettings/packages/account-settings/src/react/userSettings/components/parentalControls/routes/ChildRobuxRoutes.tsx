import React, { useMemo } from "react";
import { Route } from "react-router-dom";
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
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import { useGetChildTransferLimitQuery } from "../../../../apis/transferLimitsApi";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
import { useAppSelector } from "../../../../redux/hooks";
import SettingsList from "../../../../common/components/routing/SettingsList";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import ChildRobuxApprovals from "../parentDashboard/ChildRobuxApprovals";
import ChildRobuxTransferLimits from "../parentDashboard/ChildRobuxTransferLimits";

export const ChildRobuxRoutes = ({ child }: { child: TChildInfo }): JSX.Element | null => {
  const { translate } = useTranslation();
  const { robuxTransferApprovals, robuxTransferLimits } = parentalControlsTranslationConstants;
  const childPages = useAppSelector(selectChildPagesForChildUserId(child.userId));
  const { data: transferLimits } = useGetChildTransferLimitQuery(child.userId);
  const [childSettings] = useGetSettingsAndOptionsV2(child.userId);

  const robuxPage = childPages?.childSettingCategoryPages[SettingCategoryPageName.Robux];
  const subpages = useMemo(() => ({ ...childPages?.robuxPages }), [childPages]);

  // Either permission opens this page, so each row checks its own. Transfer
  // limits stays listed whether or not that setting came back. Approvals also
  // needs that setting. An empty approval value still means Always ask.
  const showTransferLimits = child.canParentManageChildRobuxTransferLimits === true;
  const showApprovals =
    child.canParentManageChildRobuxTransferSettings === true &&
    childSettings?.robuxTransferApprovalMode !== undefined;

  const pagesWithCurrentValues: Record<string, TSettingsPage> = useMemo(() => {
    const pages: Record<string, TSettingsPage> = {};

    const transferLimitsPage = subpages[RobuxSettingName.TransferLimits];
    if (showTransferLimits && transferLimitsPage !== undefined) {
      const effectiveLimits = toEffectiveRobuxTransferLimits(
        toRobuxTransferLimitsInputFromSetting(childSettings?.robuxTransferLimits),
        transferLimits,
      );
      // The row reports the caps in force, so a parent who has set nothing still
      // sees what applies rather than a blank. The icons sit between the two values,
      // so this is two parameterized keys rather than one summary string.
      pages[RobuxSettingName.TransferLimits] = {
        ...transferLimitsPage,
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

    const approvalsPage = subpages[RobuxSettingName.Approvals];
    if (showApprovals && approvalsPage !== undefined) {
      const approvalMode =
        childSettings?.robuxTransferApprovalMode?.currentValue ??
        RobuxTransferApprovalMode.AlwaysAsk;
      const approvalLabel =
        approvalMode === RobuxTransferApprovalMode.TrustedFriendsAutoApproved
          ? robuxTransferApprovals.alwaysAllowForTrustedFriends
          : robuxTransferApprovals.alwaysAsk;
      pages[RobuxSettingName.Approvals] = {
        ...approvalsPage,
        currentValueComponent: <span>{translate(approvalLabel)}</span>,
      };
    }

    return pages;
  }, [
    subpages,
    showTransferLimits,
    showApprovals,
    childSettings,
    transferLimits,
    translate,
    robuxTransferLimits,
    robuxTransferApprovals,
  ]);

  const transferLimitsPath = pagesWithCurrentValues[RobuxSettingName.TransferLimits]?.path;
  const approvalsPath = pagesWithCurrentValues[RobuxSettingName.Approvals]?.path;
  // A route with no path matches everything, and an unrouted SettingsList renders
  // unconditionally, so both would leak onto sibling pages before the store fills.
  // One subpage is enough. Neither leaves nothing to show.
  if (
    robuxPage === undefined ||
    (transferLimitsPath === undefined && approvalsPath === undefined)
  ) {
    return null;
  }

  return (
    <React.Fragment>
      <SettingsList subPages={pagesWithCurrentValues} routingPath={robuxPage.path} />

      {transferLimitsPath !== undefined && (
        <Route path={transferLimitsPath}>
          <ChildRobuxTransferLimits child={child} />
        </Route>
      )}

      {approvalsPath !== undefined && (
        <Route path={approvalsPath}>
          <ChildRobuxApprovals child={child} />
        </Route>
      )}
    </React.Fragment>
  );
};

export default ChildRobuxRoutes;
