import React from "react";
import { Toggle } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { LegallySensitiveContentService } from "Roblox";
import hybrid from "@rbx/core-scripts/hybrid";
import {
  EnabledStatusValue,
  TUpdateUserSettingValueRequest,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import InlineSettingComponent from "../../../common/components/InlineSettingComponent";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import {
  useGetUserSettingsQuery,
  useUpdateUserSettingValueMutation,
} from "../../../apis/userSettingsApi";
import { useGetVerifiedAgeQuery } from "../../../apis/ageVerificationApi";
import { useGetBirthdateQuery } from "../../../apis/usersApi";
import birthdayUtils from "../../utils/birthdayUtils";
import {
  personalizedAdsConsentName,
  personalizedAdsSurface,
  sellShareDataConsentName,
  sellShareDataSurface,
} from "../../constants/privacy/privacyConstants";

export const AdPreferences = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const { data: userSettings } = useGetUserSettingsQuery();
  const [updateUserSettings] = useUpdateUserSettingValueMutation();
  const verifiedAgeQuery = useGetVerifiedAgeQuery();
  const birthdateQuery = useGetBirthdateQuery();

  const [personalizedAdsLegallySensitiveData, personalizedAdsLegallySensitiveActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      personalizedAdsConsentName,
      personalizedAdsSurface,
    );
  const personalizedAdsAuditHeader =
    personalizedAdsLegallySensitiveActions.getBase64EncodedAuditHeader();

  const [sellShareDataLegallySensitiveData, sellShareDataLegallySensitiveActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      sellShareDataConsentName,
      sellShareDataSurface,
    );
  const sellShareDataAuditHeader =
    sellShareDataLegallySensitiveActions.getBase64EncodedAuditHeader();

  const currentAllowSellShareDataValue = userSettings?.allowSellShareData;
  const currentAllowPersonalizedAdvertisingValue = userSettings?.allowPersonalizedAdvertising;

  const toggleSellShareSettingHandler = async () => {
    const newSellShareSetting =
      currentAllowSellShareDataValue === EnabledStatusValue.Enabled
        ? EnabledStatusValue.Disabled
        : EnabledStatusValue.Enabled;
    const updateBody: TUpdateUserSettingValueRequest = {
      setting: UserSetting.allowSellShareData,
      value: newSellShareSetting,
      auditHeader: sellShareDataAuditHeader,
    };
    try {
      await updateUserSettings(updateBody).unwrap();
      // Resolve age before deciding U18 so a slow/failed load can't mislabel an adult (cached when present).
      const verifiedAge =
        verifiedAgeQuery.data ??
        (await verifiedAgeQuery
          .refetch()
          .unwrap()
          .catch(() => undefined));
      const dob =
        birthdateQuery.data ??
        (await birthdateQuery
          .refetch()
          .unwrap()
          .catch(() => undefined));
      const effectiveAge = verifiedAge?.isVerified
        ? verifiedAge.verifiedAge
        : birthdayUtils.calculateAge(dob);
      const isUnder18 = effectiveAge > 0 ? effectiveAge < 18 : true; // fail closed to U18 only when age is absent
      // U18 always gets the sharing filter (AMP IncludeSharingFilter age < 18). Live-update the native
      // AppsFlyer sharing filter this session; isUnder18 forces it on. No-op off-app.
      hybrid.adConsentChanged({ allowSellShareData: newSellShareSetting, isUnder18 });
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
    } catch {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  };

  const togglePersonalizedAdsSettingHandler = async () => {
    const newPersonalizedAdvertisingSetting =
      currentAllowPersonalizedAdvertisingValue === EnabledStatusValue.Enabled
        ? EnabledStatusValue.Disabled
        : EnabledStatusValue.Enabled;
    const updateBody: TUpdateUserSettingValueRequest = {
      setting: UserSetting.allowPersonalizedAdvertising,
      value: newPersonalizedAdvertisingSetting,
      auditHeader: personalizedAdsAuditHeader,
    };
    try {
      await updateUserSettings(updateBody).unwrap();
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
    } catch {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  };

  return (
    <React.Fragment>
      <InlineSettingComponent
        id="personalized-ads-setting"
        label={personalizedAdsLegallySensitiveData.wordsOfConsent.title ?? ""}
        inputId="ads-personalized-ads-toggle"
        description={
          <span
            className="small text"
            dangerouslySetInnerHTML={{
              __html: personalizedAdsLegallySensitiveData.wordsOfConsent.consent ?? "",
            }}
          />
        }
      >
        <Toggle
          isOn={currentAllowPersonalizedAdvertisingValue === EnabledStatusValue.Enabled}
          onToggle={togglePersonalizedAdsSettingHandler}
        />
      </InlineSettingComponent>

      <InlineSettingComponent
        id="data-sell-share-setting"
        label={sellShareDataLegallySensitiveData.wordsOfConsent.title ?? ""}
        inputId="ads-sell-share-toggle"
        description={
          <span
            className="small text"
            dangerouslySetInnerHTML={{
              __html: sellShareDataLegallySensitiveData.wordsOfConsent.consent ?? "",
            }}
          />
        }
      >
        <Toggle
          isOn={currentAllowSellShareDataValue === EnabledStatusValue.Enabled}
          onToggle={toggleSellShareSettingHandler}
        />
      </InlineSettingComponent>
    </React.Fragment>
  );
};

export default AdPreferences;
