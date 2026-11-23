import "./src/main.css";
import Roblox from "Roblox";
import React from "react";
import { unmountComponentAtNode } from "react-dom";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import type { Namespace } from "@rbx/www-common/i18n";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import AccountSwitcherContainer from "@rbx/authentication/accountSwitcher/containers/AccountSwitcherContainer";
import { ThumbnailsAvatarHeadshot } from "@rbx/authentication/accountSwitcher/components/ThumbnailsAvatarHeadshot";
import ConfirmationModalContainer from "@rbx/authentication/accountSwitcher/containers/ConfirmationModalContainer";
import useIsAccountSwitcherAvailableForBrowser from "@rbx/authentication/accountSwitcher/hooks/useIsAccountSwitcherAvailableForBrowser";
import {
  getStoredAccountSwitcherBlob,
  storeAccountSwitcherBlob,
  parseLoggedInUsers,
  isAccountSwitchingEnabled,
  isAccountSwitcherAvailable,
  syncAccountSwitcherBlobIfNeeded,
} from "@rbx/authentication/accountSwitcher/utils/accountSwitcherUtils";
import {
  TRenderAccountSwitcher,
  TRenderBaseConfirmationModal,
} from "@rbx/authentication-common/types/accountSwitcherTypes";
import "@rbx/authentication/accountSwitcher/css/accountSwitcher.css";
import { translations } from "./component.json";

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
const namespaces = translations as unknown as readonly Namespace[];

export const renderAccountSwitcher: TRenderAccountSwitcher = async ({
  containerId,
  titleText,
  helpText,
  onAccountSwitched,
  handleAddAccount,
  suppressAddAccountRow,
  removeInvalidActiveUser,
  isModal = true,
  loggedInUsers,
}): Promise<boolean> => {
  const container = document.getElementById(containerId);

  if ((await isAccountSwitcherAvailable()) && container != null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(container);

    renderWithErrorBoundary(
      <TranslationProviderSCC namespaces={namespaces}>
        <AccountSwitcherContainer
          AvatarHeadshot={ThumbnailsAvatarHeadshot}
          titleText={titleText}
          helpText={helpText}
          onAccountSwitched={onAccountSwitched}
          handleAddAccount={handleAddAccount}
          suppressAddAccountRow={suppressAddAccountRow}
          removeInvalidActiveUser={removeInvalidActiveUser}
          isModal={isModal}
          loggedInUsers={loggedInUsers}
        />
      </TranslationProviderSCC>,
      container,
    );
    return true;
  }
  return false;
};

export const renderBaseConfirmationModal: TRenderBaseConfirmationModal = ({
  containerId,
  origin,
  localizedTitleText,
  localizedBodyText,
  primaryButtonCallback,
  localizedPrimaryButtonText,
  secondaryButtonCallback,
  localizedSecondaryButtonText,
  isModalDismissable = true,
}): boolean => {
  const container = document.getElementById(containerId);

  if (isAccountSwitchingEnabled() && container != null) {
    // Remove any existing instances of the app.
    unmountComponentAtNode(container);

    renderWithErrorBoundary(
      <ConfirmationModalContainer
        origin={origin}
        localizedTitleText={localizedTitleText}
        localizedBodyText={localizedBodyText}
        primaryButtonCallback={primaryButtonCallback}
        localizedPrimaryButtonText={localizedPrimaryButtonText}
        secondaryButtonCallback={secondaryButtonCallback}
        localizedSecondaryButtonText={localizedSecondaryButtonText}
        isModalDismissable={isModalDismissable}
      />,
      container,
    );
    return true;
  }
  return false;
};

const AccountSwitcherService = {
  isAccountSwitcherAvailable,
  renderAccountSwitcher,
  renderBaseConfirmationModal,
  getStoredAccountSwitcherBlob,
  storeAccountSwitcherBlob,
  useIsAccountSwitcherAvailableForBrowser,
  parseLoggedInUsers,
  syncAccountSwitcherBlobIfNeeded,
};

Object.assign(Roblox, {
  AccountSwitcherService,
});

export default {
  renderAccountSwitcher,
  renderBaseConfirmationModal,
  getStoredAccountSwitcherBlob,
  storeAccountSwitcherBlob,
  parseLoggedInUsers,
  syncAccountSwitcherBlobIfNeeded,
};
