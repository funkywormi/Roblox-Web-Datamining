// eslint-disable-next-line import-x/no-extraneous-dependencies -- react-dom is provided transitively via the host component's React 17 runtime; we only need the unmount helper here.
import { unmountComponentAtNode } from "react-dom";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import LogoutUpsellFlow, { type PasskeyLogoutUpsellOptions } from "../components/LogoutUpsellFlow";

/**
 * .NET entry point for the passkey logout upsell. The .NET nav passes it to
 * `handleLogoutUpsell`, so shared code never imports this .NET-only mount; the React tree owns its own DOM lifecycle (container creation +
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
// via `useTranslations()`. Other modal copy comes from prompts service via the
// `translations` props.
const EMAIL_TRANSLATION_NAMESPACES = ["Feature.AccountSettings"] as const;

export type ShowPasskeyUpsellModalOptions = Omit<PasskeyLogoutUpsellOptions, "kind">;

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

  renderWithErrorBoundary(
    <TranslationProviderSCC namespaces={EMAIL_TRANSLATION_NAMESPACES}>
      <LogoutUpsellFlow
        options={{
          kind: "passkey",
          translations,
          addEmailTranslations,
          verifyEmailTranslations,
          showAddEmail,
          onLogout,
        }}
        onClose={cleanup}
      />
    </TranslationProviderSCC>,
    container,
  );
};
