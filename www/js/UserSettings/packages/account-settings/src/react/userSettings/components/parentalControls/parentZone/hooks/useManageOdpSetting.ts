import { useRef, useState } from "react";
import { userId } from "@rbx/core-scripts/meta/user";
import { getChildSettingsCacheTag } from "../../../../../apis/parentalControlsApi";
import { UserSetting } from "@rbx/user-settings";
import { useAppDispatch } from "../../../../../redux/hooks";
import baseApi from "../../../../../apis/common/baseApi";
import ApiCacheTag from "../../../../../apis/common/cacheTagEnum";
import useStartOdpWizard from "../../../../hooks/useStartOdpWizard";
import { TSettingUpdateRequest } from "../../../../../../types/settingUpdateTypes";

const useManageOdpSetting = () => {
  const dispatch = useAppDispatch();
  const isWizardActiveRef = useRef(false);
  const [isManaging, setIsManaging] = useState(false);
  const [revision, setRevision] = useState(0);
  const startOdpWizard = useStartOdpWizard();

  const manageSetting = async ({
    setting,
    value,
    currencyCode,
  }: TSettingUpdateRequest): Promise<void> => {
    if (isWizardActiveRef.current || value === undefined) {
      return;
    }
    isWizardActiveRef.current = true;
    setIsManaging(true);
    try {
      await startOdpWizard({
        flow: {
          name: "ODP",
          props: {
            requestType: "UpdateUserSetting",
            requestDetails: {
              [setting]:
                value === null
                  ? null
                  : typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value),
              ...(setting === UserSetting.monthlySpendLimit && currencyCode
                ? { monthlySpendLimitCurrencyCode: currencyCode }
                : {}),
            },
            isOdpInitiated: true,
          },
        },
        surface: "ParentalControlsSettings",
      });
    } finally {
      // Wizard exit does not indicate whether a setting was saved.
      const childUserId = userId();
      dispatch(
        baseApi.util.invalidateTags([
          ...(childUserId !== null ? [getChildSettingsCacheTag(childUserId)] : []),
          ApiCacheTag.UserSettings,
          ApiCacheTag.UserSettingsAndOptions,
          ApiCacheTag.OdpChildContext,
          { type: ApiCacheTag.SpendControls, id: "currentUser" },
        ]),
      );
      isWizardActiveRef.current = false;
      setIsManaging(false);
      setRevision(previous => previous + 1);
    }
  };

  return { manageSetting, isManaging, revision };
};

export default useManageOdpSetting;
