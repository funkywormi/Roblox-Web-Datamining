import React from "react";
import { useTranslation } from "react-utilities";
import { accountSettingsTitle } from "../constants/baseContants";

export const AccountHeaderContainer = (): JSX.Element => {
  const { translate } = useTranslation();
  return <h1>{translate(accountSettingsTitle)}</h1>;
};

export default AccountHeaderContainer;
