import React from "react";
import { securityTabEntryPointId } from "../constants/browserConstants";
import { renderSecurityTab } from "../userSettingsEntry";

export const SecuritySettingsContainer = (): JSX.Element => {
  renderSecurityTab();
  return <div id={securityTabEntryPointId} />;
};

export default SecuritySettingsContainer;
