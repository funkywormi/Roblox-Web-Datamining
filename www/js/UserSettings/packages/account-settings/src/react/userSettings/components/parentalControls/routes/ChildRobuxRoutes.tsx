import React, { useMemo } from "react";
import { Route } from "react-router-dom";
import { useTranslation } from "react-utilities";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Icon } from "@rbx/foundation-ui";
import {
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
import ChildRobuxTransferLimits from "../parentDashboard/ChildRobuxTransferLimits";

export const ChildRobuxRoutes = ({ child }: { child: TChildInfo }): JSX.Element | null => {
  const { translate } = useTranslation();
  const { robuxTransferLimits } = parentalControlsTranslationConstants;
  const childPages = useAppSelector(selectChildPagesForChildUserId(child.userId));
  const { data: transferLimits } = useGetChildTransferLimitQuery(child.userId);
  const [childSettings] = useGetSettingsAndOptionsV2(child.userId);

  const robuxPage = childPages?.childSettingCategoryPages[SettingCategoryPageName.Robux];
  const subpages = useMemo(() => ({ ...childPages?.robuxPages }), [childPages]);

  // The row reports the caps in force, so a parent who has set nothing still
  // sees what applies rather than a blank. The icons sit between the two values,
  // so this is two parameterized keys rather than one summary string.
  const pagesWithCurrentValues: Record<string, TSettingsPage> = useMemo(() => {
    const effectiveLimits = toEffectiveRobuxTransferLimits(
      toRobuxTransferLimitsInputFromSetting(childSettings?.robuxTransferLimits),
      transferLimits,
    );
    const transferLimitsPage = subpages[RobuxSettingName.TransferLimits];
    if (transferLimitsPage === undefined || effectiveLimits === undefined) {
      return subpages;
    }

    return {
      ...subpages,
      [RobuxSettingName.TransferLimits]: {
        ...transferLimitsPage,
        currentValueComponent: (
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
        ),
      },
    };
  }, [subpages, childSettings, transferLimits, translate, robuxTransferLimits]);

  const transferLimitsPath = subpages[RobuxSettingName.TransferLimits]?.path;
  // A route with no path matches everything, and an unrouted SettingsList renders
  // unconditionally, so both would leak onto sibling pages before the store fills.
  if (robuxPage === undefined || transferLimitsPath === undefined) {
    return null;
  }

  return (
    <React.Fragment>
      <SettingsList subPages={pagesWithCurrentValues} routingPath={robuxPage.path} />

      <Route path={transferLimitsPath}>
        <ChildRobuxTransferLimits child={child} />
      </Route>
    </React.Fragment>
  );
};

export default ChildRobuxRoutes;
