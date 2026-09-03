import React from "react";
import { subscriptionManagementEntryPointId } from "../constants/browserConstants";
import { renderSubscriptionsTab } from "../userSettingsEntry";

export const SubscriptionsSettingsContainer = (): JSX.Element => {
  renderSubscriptionsTab();
  return <div id={subscriptionManagementEntryPointId} />;
};

export default SubscriptionsSettingsContainer;
