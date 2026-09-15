import { useTranslation } from "react-utilities";
import { UserSetting } from "@rbx/user-settings";
import { ToggleWithParentalConsentV2 } from "../../../common/components/ToggleWithParentalConsentV2";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";

export const ThirdPartyFriendAccess = ({ childUserId }: { childUserId?: number }) => {
  const { translate } = useTranslation();

  return (
    <ToggleWithParentalConsentV2
      label={translate(privacyTranslationConstants.thirdPartyFriendAccessLabel)}
      inputId="third-party-friend-access-toggle"
      settingName={UserSetting.allowThirdPartyFriendAccess}
      childUserId={childUserId}
      description={translate(privacyTranslationConstants.thirdPartyFriendAccessDescription)}
    />
  );
};

ThirdPartyFriendAccess.defaultProps = {
  childUserId: undefined,
};

export default ThirdPartyFriendAccess;
