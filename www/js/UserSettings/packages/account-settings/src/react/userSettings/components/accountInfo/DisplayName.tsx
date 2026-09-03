import React from "react";
import { useTranslation } from "react-utilities";
import SettingsTextField from "../../../common/components/SettingsTextField";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import useChangeDisplayNameModal from "../../../common/hooks/modals/useChangeDisplayNameModal";
import { useGetAccountInfoQuery } from "../../../apis/legacyAccountSettingsApi";
import { useGetDisplayAgedUpDisplayNameQuery } from "../../../apis/experimentApi";
import { useGetDisplayNamesPolicyQuery } from "../../../apis/universalAppConfigurationApi";

export const DisplayName = (): JSX.Element => {
  const { data: accountInfo } = useGetAccountInfoQuery();
  const { data: displayAgedUpDisplayNameFromIXP } = useGetDisplayAgedUpDisplayNameQuery();
  const { data: displayNamesPolicy } = useGetDisplayNamesPolicyQuery();
  const displayAgedUpDisplayName =
    (displayAgedUpDisplayNameFromIXP || displayNamesPolicy?.RealNamesInDisplayNamesEnabled) ??
    false;
  const { translate } = useTranslation();

  const { displayName } = accountInfoTranslationConstants;

  const [displayNameModal, displayNameModalService] = useChangeDisplayNameModal();

  return (
    <React.Fragment>
      {displayNameModal}
      <SettingsTextField
        primaryEditLabel={
          displayAgedUpDisplayName
            ? translate(displayName.agedUp.modalTitle)
            : translate(displayName.modalTitle)
        }
        label={
          displayAgedUpDisplayName
            ? translate(displayName.agedUp.label)
            : translate(displayName.label)
        }
        valueSet
        lines={[{ value: accountInfo?.DisplayName ?? "" }]}
        primaryOnEdit={displayNameModalService.open}
      />
    </React.Fragment>
  );
};

export default DisplayName;
