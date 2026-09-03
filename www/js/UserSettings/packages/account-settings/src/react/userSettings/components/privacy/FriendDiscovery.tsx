import React from "react";
import { LegallySensitiveContentService } from "Roblox";
import { UserSetting } from "@rbx/user-settings";
import useGetSettingsAndOptions from "../../../apis/hooks/useGetSettingsAndOptions";
import InlineSettingComponent from "../../../common/components/InlineSettingComponent";
import ToggleWithParentalConsent from "../../../common/components/ToggleWithParentalConsent";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import { useWrappedTranslation } from "../../hooks/useWrappedTranslation";
import {
  friendDiscoveryConsentName,
  friendDiscoveryParentSideConsentName,
  friendDiscoverySurface,
} from "../../constants/privacy/privacyConstants";

// Phone number discoverability and contact import settings
const FriendDiscovery = ({ child }: { child?: TChildInfo }): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const [settingsAndOptions] = useGetSettingsAndOptions(child?.userId);
  const [legallySensitiveContent, legallySensitiveActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      friendDiscoveryConsentName,
      friendDiscoverySurface,
    );

  const [parentSideLegallySensitiveContent, parentSideLegallySensitiveActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      friendDiscoveryParentSideConsentName,
      friendDiscoverySurface,
    );

  const content = child ? parentSideLegallySensitiveContent : legallySensitiveContent;
  const actions = child ? parentSideLegallySensitiveActions : legallySensitiveActions;
  const auditHeader = actions.getBase64EncodedAuditHeader();

  return (
    <React.Fragment>
      {/* Phone number discoverability */}
      {settingsAndOptions?.[UserSetting.phoneNumberDiscoverability] && (
        <ToggleWithParentalConsent
          label={content.wordsOfConsent.title ?? ""}
          description={content.wordsOfConsent.consent ?? ""}
          childUserId={child?.userId}
          inputId="phone-number-discoverability-toggle"
          settingName={UserSetting.phoneNumberDiscoverability}
          auditHeader={auditHeader}
        />
      )}

      {/* Only parent side has a disclaimer regarding device contact access */}
      {child && child.canParentViewChildDeviceContactAccessDisclaimer && (
        <InlineSettingComponent
          label={translate(privacyTranslationConstants.deviceContactAccessLabel)}
          description={
            <span>
              {translate(privacyTranslationConstants.deviceContactAccessParentSideDescription)}
            </span>
          }
        />
      )}
    </React.Fragment>
  );
};

FriendDiscovery.defaultProps = {
  child: undefined,
};

export default FriendDiscovery;
