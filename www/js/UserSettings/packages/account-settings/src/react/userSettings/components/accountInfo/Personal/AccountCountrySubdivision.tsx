import React from "react";
import { useTranslation } from "react-utilities";
import { useGetAccountCountryQuery } from "../../../../apis/accountSettingsApi";
import SettingsTextField from "../../../../common/components/SettingsTextField";
import accountInfoTranslationConstants from "../../../constants/contentConstants/accountInfoTranslationConstants";

const accountCountryTranslationConstants = accountInfoTranslationConstants.accountCountry;

const AccountCountrySubdivision = (): JSX.Element => {
  const { translate } = useTranslation();
  const { data: accountCountry } = useGetAccountCountryQuery();

  // If no subdivision data, use account country, otherwise show unknown
  const accountCountryValue =
    accountCountry?.value?.localizedSubdivision ??
    accountCountry?.value?.localizedName ??
    translate(accountCountryTranslationConstants.unknownLocation);

  return (
    <SettingsTextField
      id="account-country-id"
      label={translate(accountCountryTranslationConstants.accountLocationTitle)}
      lines={[{ value: accountCountryValue }]}
      valueSet={Boolean(accountCountry)}
      primaryEditLabel="" // there is no edit button for this setting
      primaryOnEdit={() => {
        // There is no edit functionality for this setting
      }}
      displayEditButton={false}
    />
  );
};

export default AccountCountrySubdivision;
