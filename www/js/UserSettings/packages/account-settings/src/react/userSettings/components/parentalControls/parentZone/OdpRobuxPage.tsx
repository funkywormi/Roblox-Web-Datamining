import React, { useMemo } from "react";
import { useTranslation } from "react-utilities";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Icon } from "@rbx/foundation-ui";
import {
  toEffectiveRobuxTransferLimits,
  toRobuxTransferLimitsInputFromSetting,
  TSettingsPage,
} from "@rbx/user-settings";
import RobuxSettingName from "../../../../../enums/RobuxSettingName";
import { useGetCurrentUserTransferLimitCeilingsQuery } from "../../../../apis/transferLimitsApi";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
import SettingsList from "../../../../common/components/routing/SettingsList";
import { parentZonePages } from "../../../constants/parentalControls/parentZonePages";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

// Robux settings viewed by an on-device parent
export const OdpRobuxPage = (): React.JSX.Element => {
  const { translate } = useTranslation();
  const { robuxTransferLimits } = parentalControlsTranslationConstants;
  const { robuxTransferLimitsPage } = parentZonePages;

  // An on-device parent is signed in on the child's account, so both reads are self-reads.
  const { data: ceilings } = useGetCurrentUserTransferLimitCeilingsQuery();
  const [childSettings] = useGetSettingsAndOptionsV2();

  const subpages = useMemo(
    () => ({ [RobuxSettingName.TransferLimits]: robuxTransferLimitsPage }),
    [robuxTransferLimitsPage],
  );

  const pagesWithCurrentValues: Record<string, TSettingsPage> = useMemo(() => {
    const effectiveLimits = toEffectiveRobuxTransferLimits(
      toRobuxTransferLimitsInputFromSetting(childSettings?.robuxTransferLimits),
      ceilings,
    );
    if (effectiveLimits === undefined) {
      return subpages;
    }

    return {
      ...subpages,
      [RobuxSettingName.TransferLimits]: {
        ...subpages[RobuxSettingName.TransferLimits],
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
  }, [subpages, childSettings, ceilings, translate, robuxTransferLimits]);

  return <SettingsList subPages={pagesWithCurrentValues} />;
};

export default OdpRobuxPage;
