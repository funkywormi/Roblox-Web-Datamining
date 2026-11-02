import React, { useEffect, useState } from "react";
import { CrossDeviceLoginDisplayCodeService } from "Roblox";
import { Button } from "@rbx/foundation-ui";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import type { TLoginWithAuthTokenRenderEvent } from "@rbx/authentication-common/types/crossDeviceLoginTypes";
import SsoProviderButtons from "../../shared/components/SsoProviderButtons";
import type { SsoProviderButtonConfig } from "../../shared/components/SsoProviderButtons";
import {
  sendLoginOtherSignInOptionsClickEvent,
  sendLoginOtherSignInOptionsDismissedEvent,
  sendLoginOtherSignInOptionsShownEvent,
  sendLoginSsoButtonClickEvent,
  sendLoginSsoButtonShownEvent,
  sendXdlButtonClickEvent,
} from "../services/eventService";
import {
  redirectToSsoProvider,
  type SsoIdentityProviderIds,
} from "../../shared/services/ssoRedirectService";
import { loginFormStrings } from "../constants/loginConstants";
import type { LoginControllerViewModel } from "../types/loginControllerTypes";
import type { LoginSsoPlacement } from "../utils/loginExperimentUtils";
import { legacyLoginTelemetry } from "../utils/loginTelemetry";
import { ssoProviderLabels } from "../../shared/constants/ssoConstants";
import { getAvailableSsoProviders } from "../../shared/utils/ssoProviderUtils";
import FoundationLoginAlternativeMethods from "./FoundationLoginAlternativeMethods";
import FoundationLoginOtherSignInOptionsDialog from "./FoundationLoginOtherSignInOptionsDialog";
import FoundationLoginSsoMethods from "./FoundationLoginSsoMethods";

type ReadyViewModel = Extract<LoginControllerViewModel, { status: "ready" }>;
type LoginAlternativeProps = NonNullable<ReadyViewModel["loginForm"]>["alternativeProps"];

export type FoundationLoginControlMethodsProps = LoginAlternativeProps & {
  ssoPlacement: LoginSsoPlacement;
  identityProviderIds: Readonly<SsoIdentityProviderIds>;
};

const FoundationLoginControlMethods = ({
  onCrossDeviceLoginCodeValidated,
  isOtpLoginEnabled,
  openOtpLoginModal,
  showPasskeyLoginButton,
  openPasskeyLoginFlow,
  translate,
  ssoPlacement,
  identityProviderIds,
}: FoundationLoginControlMethodsProps): React.JSX.Element => {
  const [isOtherSignInOptionsOpen, setIsOtherSignInOptionsOpen] = useState(false);

  useEffect(() => {
    const onCrossDeviceCodeValidated = (event: TLoginWithAuthTokenRenderEvent): void => {
      if (event.detail) {
        onCrossDeviceLoginCodeValidated(event.detail);
      }
    };

    window.addEventListener(
      "OnCrossDeviceCodeValidated",
      onCrossDeviceCodeValidated as EventListener,
    );
    return () => {
      window.removeEventListener(
        "OnCrossDeviceCodeValidated",
        onCrossDeviceCodeValidated as EventListener,
      );
    };
  }, [onCrossDeviceLoginCodeValidated]);

  const handleCrossDeviceLogin = (): void => {
    sendXdlButtonClickEvent();
    CrossDeviceLoginDisplayCodeService.openModal().catch((error: unknown) => console.warn(error));
  };

  const handlePasskeyLogin = (): void => {
    openPasskeyLoginFlow("required");
  };

  const availableProviders = getAvailableSsoProviders(identityProviderIds);
  const placement: LoginSsoPlacement = availableProviders.length > 0 ? ssoPlacement : "hidden";
  const ssoProviders: SsoProviderButtonConfig[] = availableProviders.map(provider => ({
    provider,
    label: translate(ssoProviderLabels[provider]),
    onClick: () => {
      if (placement !== "hidden") {
        sendLoginSsoButtonClickEvent(provider, placement);
      }
      redirectToSsoProvider(
        provider,
        identityProviderIds,
        EVENT_CONSTANTS.context.schematizedLoginForm,
        legacyLoginTelemetry,
      );
    },
  }));
  const availableProvidersKey = availableProviders.join(",");

  useEffect(() => {
    if (placement !== "underDivider") {
      return;
    }
    availableProviders.forEach(provider => sendLoginSsoButtonShownEvent(provider, placement));
    // The provider list is rebuilt every render; its joined key is the stable dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placement, availableProvidersKey]);

  // The dialog closes first so the OTP, QR code, and passkey surfaces don't open beneath it.
  const closeOptionsThen = (action: () => void) => (): void => {
    setIsOtherSignInOptionsOpen(false);
    action();
  };

  const otherSignInOptionsLabel = translate(loginFormStrings.ActionOtherSignInOptions);
  const openOtherSignInOptions = (): void => {
    sendLoginOtherSignInOptionsClickEvent();
    sendLoginOtherSignInOptionsShownEvent();
    if (placement === "otherSignInOptions") {
      availableProviders.forEach(provider => sendLoginSsoButtonShownEvent(provider, placement));
    }
    setIsOtherSignInOptionsOpen(true);
  };

  // Only the dialog's own close controls call this; picking an option closes it directly.
  const onOtherSignInOptionsOpenChange = (isOpen: boolean): void => {
    if (!isOpen) {
      sendLoginOtherSignInOptionsDismissedEvent();
    }
    setIsOtherSignInOptionsOpen(isOpen);
  };

  const renderEmailCodeButton = (onClick: () => void): React.ReactNode =>
    isOtpLoginEnabled && (
      <Button
        className="width-full"
        id="otp-login-button"
        type="button"
        size="Medium"
        variant="Standard"
        icon="icon-regular-envelope"
        onClick={onClick}
      >
        {translate(loginFormStrings.ActionEmailACode)}
      </Button>
    );

  const renderQrCodeButton = (onClick: () => void): React.ReactNode => (
    <Button
      className="width-full"
      id="cross-device-login-button"
      type="button"
      size="Medium"
      variant="Standard"
      icon="icon-regular-squares-grid-qr"
      onClick={onClick}
    >
      {translate(loginFormStrings.ActionQrCode)}
    </Button>
  );

  const renderOtherSignInOptionsDialog = (children: React.ReactNode): React.JSX.Element => (
    <FoundationLoginOtherSignInOptionsDialog
      isOpen={isOtherSignInOptionsOpen}
      onOpenChange={onOtherSignInOptionsOpenChange}
      title={otherSignInOptionsLabel}
      closeLabel={translate(loginFormStrings.ActionClose)}
    >
      {children}
    </FoundationLoginOtherSignInOptionsDialog>
  );

  if (placement === "underDivider") {
    return (
      <React.Fragment>
        <FoundationLoginSsoMethods
          providers={ssoProviders}
          otherSignInOptionsLabel={otherSignInOptionsLabel}
          onOtherSignInOptions={openOtherSignInOptions}
        />
        {renderOtherSignInOptionsDialog(
          <React.Fragment>
            {showPasskeyLoginButton && (
              <Button
                className="width-full"
                id="passkey-login-button"
                type="button"
                size="Medium"
                variant="Standard"
                icon="icon-regular-key"
                onClick={closeOptionsThen(handlePasskeyLogin)}
              >
                {translate(loginFormStrings.ActionUsePasskey)}
              </Button>
            )}
            {renderQrCodeButton(closeOptionsThen(handleCrossDeviceLogin))}
            {renderEmailCodeButton(closeOptionsThen(openOtpLoginModal))}
          </React.Fragment>,
        )}
      </React.Fragment>
    );
  }

  const hasSsoInOtherSignInOptions = placement === "otherSignInOptions";
  const getOtherSignInOptionsHandler = (): (() => void) | undefined => {
    if (hasSsoInOtherSignInOptions) {
      return openOtherSignInOptions;
    }
    return showPasskeyLoginButton
      ? () => {
          sendLoginOtherSignInOptionsClickEvent();
          handlePasskeyLogin();
        }
      : undefined;
  };

  return (
    <React.Fragment>
      <FoundationLoginAlternativeMethods
        otherSignInOptionsLabel={otherSignInOptionsLabel}
        onOtherSignInOptions={getOtherSignInOptionsHandler()}
      >
        {renderEmailCodeButton(openOtpLoginModal)}
        {renderQrCodeButton(handleCrossDeviceLogin)}
      </FoundationLoginAlternativeMethods>
      {/* The refreshSsoDialog design has no passkey entry, so passkey stays unreachable in this
          arm until the design adds one. */}
      {hasSsoInOtherSignInOptions &&
        renderOtherSignInOptionsDialog(
          <SsoProviderButtons providers={ssoProviders} layout="column" />,
        )}
    </React.Fragment>
  );
};

export default FoundationLoginControlMethods;
