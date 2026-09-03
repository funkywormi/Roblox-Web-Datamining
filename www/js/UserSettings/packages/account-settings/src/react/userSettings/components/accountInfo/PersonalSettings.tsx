import { useTranslation } from "react-utilities";
import React, { useEffect } from "react";
import { Loading } from "react-style-guide";
import AgeVerification from "./AgeVerification";
import AgeVerificationV2 from "./AgeVerificationV2";
import SettingsSection from "../../../common/components/SettingsSection";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import LanguageSetting from "./LanguageSetting";
import GenderSetting from "./GenderSetting";
import { useGetAccountInfoQuery } from "../../../apis/legacyAccountSettingsApi";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import InlineBirthday from "./InlineBirthday";
import AccountCountrySubdivision from "./Personal/AccountCountrySubdivision";
import ShowRobloxTranslationsSetting from "./ShowRobloxTranslationsSetting";
import AgeGroup from "./Personal/AgeGroup";
import getExperienceTranslationsElement from "../../utils/translationUtils";
import {
  experienceTranslationsId,
  delayInMs,
} from "../../constants/translations/translationSettingsConstants";
import { useGetSettingsMetadataQuery } from "../../../apis/userSettingsApi";

export const PersonalSettings = (): JSX.Element => {
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const { data: accountInfo, isLoading } = useGetAccountInfoQuery();
  const { data: settingsMetadata } = useGetSettingsMetadataQuery();
  const { translate } = useTranslation();

  useEffect(() => {
    // time delay is needed to ensure that automatic translations dropdown is rendered before scrolling
    setTimeout(() => {
      const experienceTranslationsDoc = getExperienceTranslationsElement();
      if (
        experienceTranslationsDoc &&
        window.location.hash.includes(`#${experienceTranslationsId}`)
      ) {
        experienceTranslationsDoc?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }, delayInMs);
  }, []);

  return (
    <SettingsSection title={translate(accountInfoTranslationConstants.headings.personal)}>
      {isLoading ? (
        <Loading />
      ) : (
        <React.Fragment>
          {uiPolicy?.displayAgeGroup && <AgeGroup />}
          {uiPolicy?.displayBirthdayPicker && <InlineBirthday />}
          {uiPolicy?.displayAgeVerification &&
            accountInfo?.IsAgeDownEnabled &&
            (uiPolicy?.displayFAEAccountInfoEntrypoint ? (
              <AgeVerificationV2 />
            ) : (
              <AgeVerification />
            ))}
          <GenderSetting />
          {uiPolicy?.displayLanguageList && <LanguageSetting />}
          {settingsMetadata?.isShowRobloxTranslationsEnabled && (
            <div id={experienceTranslationsId}>
              <ShowRobloxTranslationsSetting />
            </div>
          )}
          {uiPolicy?.accountCountryPickerEnabled && <AccountCountrySubdivision />}
        </React.Fragment>
      )}
    </SettingsSection>
  );
};

export default PersonalSettings;
