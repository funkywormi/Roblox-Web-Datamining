import React from "react";
import { useTranslation } from "react-utilities";
import { UserSetting } from "@rbx/user-settings";
import ToggleWithParentalConsent from "../../../../common/components/ToggleWithParentalConsent";
import SettingsSection from "../../../../common/components/SettingsSection";
import { TChildSettingsInfo } from "../../../../../types/childrenInfoTypes";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { premiumHelpUrl, subscriptionsHelpUrl } from "../../../constants/urlConstants";
import { TSettingUpdateProps } from "../../../../../types/settingUpdateTypes";

const ChildAllowPurchases = ({
  child,
  onUpdateSetting,
}: { child: TChildSettingsInfo } & TSettingUpdateProps): JSX.Element => {
  const { translate } = useTranslation();
  const { spendControls } = parentalControlsTranslationConstants;

  const description = (
    <span
      dangerouslySetInnerHTML={{
        __html: translate(spendControls.allowPurchasesDescription, {
          premiumLinkStart: `<a class="text-link" target="_blank" rel="noreferrer" href=${premiumHelpUrl}>`,
          subscriptionsLinkStart: `<a class="text-link" target="_blank" rel="noreferrer" href=${subscriptionsHelpUrl}>`,
          linkEnd: "</a>",
          lineBreak: "<br><br>",
        }),
      }}
    />
  );
  return (
    <SettingsSection description={description}>
      <ToggleWithParentalConsent
        onUpdateSetting={onUpdateSetting}
        label={translate(spendControls.allowPurchasesHeading)}
        inputId="allow-purchases-toggle"
        settingName={UserSetting.enablePurchases}
        childUserId={child?.userId}
      />
    </SettingsSection>
  );
};

export default ChildAllowPurchases;
