import React from "react";
import { useTranslation } from "react-utilities";
import { UserSetting } from "@rbx/user-settings";
import useGetSettingsAndOptions from "../../../apis/hooks/useGetSettingsAndOptions";
import ToggleWithParentalConsent from "../../../common/components/ToggleWithParentalConsent";
import appPermissionsTranslationConstants from "../../constants/contentConstants/appPermissionsTranslationConstants";
import SettingsSection from "../../../common/components/SettingsSection";

const AllowThirdPartyAppsSetting = ({ childUserId }: { childUserId?: number }): JSX.Element => {
  const { translate } = useTranslation();
  const [settingsAndOptions] = useGetSettingsAndOptions(childUserId);

  return (
    <React.Fragment>
      {settingsAndOptions?.[UserSetting.allowThirdPartyAppPermissions] && (
        <SettingsSection
          description={
            childUserId ? translate(appPermissionsTranslationConstants.parentSideDescription) : ""
          }
        >
          <ToggleWithParentalConsent
            label={translate(appPermissionsTranslationConstants.thirdPartyApplications)}
            childUserId={childUserId}
            inputId="third-party-applications-toggle"
            settingName={UserSetting.allowThirdPartyAppPermissions}
          />
        </SettingsSection>
      )}
    </React.Fragment>
  );
};

AllowThirdPartyAppsSetting.defaultProps = {
  childUserId: undefined,
};

export default AllowThirdPartyAppsSetting;
