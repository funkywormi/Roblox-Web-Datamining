import React, { useEffect, useState } from "react";
// eslint-disable-next-line import-x/no-extraneous-dependencies -- react-dom is provided transitively via the host component's React 17 runtime; we only need the unmount helper here.
import { unmountComponentAtNode } from "react-dom";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import LogoutUpsellModal from "../components/LogoutUpsellModal";
import PasskeyUpsellContent, {
  PasskeyUpsellTranslations,
} from "../components/PasskeyUpsellContent";
import AddEmailContent, { AddEmailTranslations } from "../components/AddEmailContent";
import VerifyEmailContent, { VerifyEmailTranslations } from "../components/VerifyEmailContent";
import { AddEmailOrigin, AddEmailOriginName, sendDismissClick } from "./logoutUpsellEvents";
import { LogoutUpsellScreen, LogoutUpsellScreenName } from "../constants/logoutUpsellScreens";

/**
 * Imperative entry point for the passkey logout upsell. Dispatchers in
 * `logoutUpsellService` invoke this without needing to know how the modal is
 * mounted; the React tree owns its own DOM lifecycle (container creation +
 * unmount on close, successful registration, or "sign out anyway") and its own
 * page state (passkey -> add email -> verify email).
 *
 * Screen state lives inside this file rather than in callers because the
 * transitions are pure UI affordances. Callers only supply the strings and
 * lifecycle callbacks.
 *
 * Lifecycle:
 *   - "Sign out anyway" → unmount, then call `onLogout` (page reloads).
 *   - Successful passkey registration → unmount only (user stays signed in).
 *   - Close affordance / Escape → unmount only (user cancelled).
 *   - "Add email" (when offered) → swap to the add-email page in place.
 *   - Successful email submission → stash the email, swap to the
 *     verify-email page ("Check your email").
 *   - "Continue to sign out" on the verify-email page → same as
 *     "Sign out anyway" above.
 *   - "Change email" on the verify-email page → swap back to the add-email
 *     page with a fresh remount so the input is blank.
 */

const CONTAINER_ID = "logout-upsell-container";

// Loaded so `AddEmailContent` can resolve `Message.Error.Email.InvalidEmail`
// and `VerifyEmailContent` can resolve `Message.Error.Email.*` resend errors
// via `useTranslation()`. Other modal copy comes from prompts service via the
// `translations` props.
const EMAIL_TRANSLATION_NAMESPACES = ["Feature.AccountSettings"] as const;

export type ShowPasskeyUpsellModalOptions = {
  translations: PasskeyUpsellTranslations;
  /**
   * When `true`, opt into the passkey + email variant: render the secondary
   * "Add email" CTA and swap to the add-email page on click. Caller must
   * also provide `translations.addEmailLabel`, `addEmailTranslations`, and
   * `verifyEmailTranslations`.
   */
  showAddEmail: boolean;
  /** Required when `showAddEmail` is `true`; ignored otherwise. */
  addEmailTranslations?: AddEmailTranslations;
  /** Required when `showAddEmail` is `true`; ignored otherwise. */
  verifyEmailTranslations?: VerifyEmailTranslations;
  onLogout: () => void;
};

type LogoutUpsellRootProps = {
  passkeyTranslations: PasskeyUpsellTranslations;
  addEmailTranslations: AddEmailTranslations | undefined;
  verifyEmailTranslations: VerifyEmailTranslations | undefined;
  showAddEmail: boolean;
  onSignOut: () => void;
  onPasskeyRegistered: () => void;
  /** Reports the active screen so the modal shell can attribute the dismiss event. */
  onScreenChange: (screen: LogoutUpsellScreenName) => void;
};

const LogoutUpsellRoot: React.FC<LogoutUpsellRootProps> = ({
  passkeyTranslations,
  addEmailTranslations,
  verifyEmailTranslations,
  showAddEmail,
  onSignOut,
  onPasskeyRegistered,
  onScreenChange,
}) => {
  const [screen, setScreen] = useState<LogoutUpsellScreenName>(LogoutUpsellScreen.PasskeyUpsell);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [addEmailOrigin, setAddEmailOrigin] = useState<AddEmailOriginName>(AddEmailOrigin.Passkey);

  useEffect(() => {
    onScreenChange(screen);
  }, [screen, onScreenChange]);

  if (screen === LogoutUpsellScreen.AddEmail && addEmailTranslations) {
    return (
      <AddEmailContent
        translations={addEmailTranslations}
        origin={addEmailOrigin}
        onContinue={email => {
          setSubmittedEmail(email);
          setScreen(LogoutUpsellScreen.VerifyEmail);
        }}
      />
    );
  }

  if (screen === LogoutUpsellScreen.VerifyEmail && verifyEmailTranslations) {
    return (
      <VerifyEmailContent
        translations={verifyEmailTranslations}
        email={submittedEmail}
        onContinueToSignOut={onSignOut}
        onChangeEmail={() => {
          setAddEmailOrigin(AddEmailOrigin.ChangeEmail);
          setScreen(LogoutUpsellScreen.AddEmail);
        }}
      />
    );
  }

  return (
    <PasskeyUpsellContent
      translations={passkeyTranslations}
      showAddEmail={showAddEmail}
      onSignOut={onSignOut}
      onPasskeyRegistered={onPasskeyRegistered}
      onAddEmail={
        showAddEmail && addEmailTranslations
          ? () => {
              setAddEmailOrigin(AddEmailOrigin.Passkey);
              setScreen(LogoutUpsellScreen.AddEmail);
            }
          : undefined
      }
    />
  );
};

export const showPasskeyUpsellModal = ({
  translations,
  showAddEmail,
  addEmailTranslations,
  verifyEmailTranslations,
  onLogout,
}: ShowPasskeyUpsellModalOptions): void => {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = CONTAINER_ID;
    document.body.appendChild(container);
  }

  const cleanup = () => {
    if (container) {
      unmountComponentAtNode(container);
      container.remove();
    }
  };

  let currentScreen: LogoutUpsellScreenName = LogoutUpsellScreen.PasskeyUpsell;

  renderWithErrorBoundary(
    <LogoutUpsellModal
      closeLabel={translations.closeLabel}
      onClose={() => {
        sendDismissClick(currentScreen);
        cleanup();
      }}
    >
      <TranslationProvider config={[...EMAIL_TRANSLATION_NAMESPACES]}>
        <LogoutUpsellRoot
          passkeyTranslations={translations}
          addEmailTranslations={addEmailTranslations}
          verifyEmailTranslations={verifyEmailTranslations}
          showAddEmail={showAddEmail}
          onSignOut={() => {
            cleanup();
            onLogout();
          }}
          onPasskeyRegistered={cleanup}
          onScreenChange={screen => {
            currentScreen = screen;
          }}
        />
      </TranslationProvider>
    </LogoutUpsellModal>,
    container,
  );
};
