import React, { useEffect, useState } from "react";
import { useTheme } from "@rbx/core-scripts/react";
import { Button, DialogBody, DialogFooter, DialogTitle } from "@rbx/foundation-ui";
import passkeyIconLight from "@rbx/foundation-images/pictograms/passkey_light.svg";
import passkeyIconDark from "@rbx/foundation-images/pictograms/passkey_dark.svg";
import { registerPasskey } from "../services/passkeyRegistrationService";
import {
  sendAddEmailClick,
  sendAddPasskeyClick,
  sendPasskeyUpsellShown,
  sendSignOutClick,
} from "../services/logoutUpsellEvents";

/**
 * Body + footer for the "stay signed in with a passkey" logout upsell.
 *
 * Translation strategy:
 *   Strings are passed in via `translations` rather than fetched in-component
 *   via the translation system. The dispatcher in `logoutUpsellService` is
 *   responsible for sourcing the strings from prompts service via
 *   `LogoutPrompt.translations`. Keeping this component pure of localization
 *   machinery means it can be tested without a `TranslationProvider` and
 *   reused inside a prompts-service-driven render pipeline that already has
 *   translations in hand.
 *
 * Variant selection:
 *   The "passkey + email" variant is opted into via the explicit
 *   `showAddEmail` boolean. When `true`, the dispatcher must also provide
 *   `translations.addEmailLabel` and `onAddEmail`; when `false`, the
 *   secondary "Add email" button is not rendered.
 */

export type PasskeyUpsellTranslations = {
  title: string;
  body: string;
  addPasskeyLabel: string;
  signOutLabel: string;
  /** Localized label for the dialog close affordance (used by the modal shell). */
  closeLabel: string;
  /** Required when the parent passes `showAddEmail`; ignored otherwise. */
  addEmailLabel?: string;
};

export type PasskeyUpsellContentProps = {
  translations: PasskeyUpsellTranslations;
  /**
   * When `true`, render the secondary "Add email" CTA. Caller must also
   * provide `translations.addEmailLabel` and `onAddEmail`.
   */
  showAddEmail: boolean;
  /** Called when the user clicks the sign-out (tertiary) action. */
  onSignOut: () => void;
  /** Called after a successful passkey registration; typically dismisses the modal. */
  onPasskeyRegistered: () => void;
  /** Called when the user clicks the "Add email" CTA. Required when `showAddEmail` is `true`. */
  onAddEmail?: () => void;
};

const PasskeyUpsellContent: React.FC<PasskeyUpsellContentProps> = ({
  translations,
  showAddEmail,
  onSignOut,
  onPasskeyRegistered,
  onAddEmail,
}) => {
  const theme = useTheme();
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);

  useEffect(() => {
    sendPasskeyUpsellShown();
  }, []);

  // The Button onClick prop is `() => void`, but registration is async.
  // Wrap so we don't return a Promise to the click handler.
  const handleAddPasskeyClick = () => {
    sendAddPasskeyClick();
    setIsPasskeyLoading(true);
    registerPasskey()
      .then(success => {
        setIsPasskeyLoading(false);
        if (success) {
          onPasskeyRegistered();
        }
      })
      .catch(() => {
        // registerPasskey is documented to never throw, this should never run
        // but can't hurt to have
        setIsPasskeyLoading(false);
      });
  };

  return (
    <React.Fragment>
      <DialogBody>
        <div className="flex flex-col">
          <div className="flex items-center justify-center width-full overflow-hidden aspect-2-1">
            <img
              src={theme === "dark" ? passkeyIconDark : passkeyIconLight}
              alt=""
              aria-hidden="true"
            />
          </div>
          <DialogTitle className="text-heading-small">{translations.title}</DialogTitle>
          <p className="text-body-medium margin-bottom-none">{translations.body}</p>
        </div>
      </DialogBody>
      <DialogFooter>
        <div className="flex flex-col gap-small width-full">
          <Button
            className="width-full"
            variant="Emphasis"
            size="Medium"
            isDisabled={isPasskeyLoading}
            isLoading={isPasskeyLoading}
            onClick={handleAddPasskeyClick}
          >
            {translations.addPasskeyLabel}
          </Button>
          {showAddEmail && (
            <Button
              className="width-full"
              variant="Standard"
              size="Medium"
              onClick={() => {
                sendAddEmailClick();
                onAddEmail?.();
              }}
            >
              {translations.addEmailLabel}
            </Button>
          )}
          <Button
            className="width-full"
            variant="Utility"
            size="Medium"
            onClick={() => {
              sendSignOutClick();
              onSignOut();
            }}
          >
            {translations.signOutLabel}
          </Button>
        </div>
      </DialogFooter>
    </React.Fragment>
  );
};

export default PasskeyUpsellContent;
