import React, { useEffect, useState } from "react";
import { Button, DialogBody, DialogFooter, DialogTitle } from "@rbx/foundation-ui";
import { useTranslations } from "@rbx/www-common/i18n";
import { redactEmailAddress } from "@rbx/authentication-common/utils/emailRedaction";
import { getEmailSubmissionErrorKey, resendVerificationEmail } from "../services/emailService";
import {
  sendChangeEmailClick,
  sendContinueToSignOutClick,
  sendResendClick,
  sendVerifyEmailShown,
} from "../services/logoutUpsellEvents";

/**
 * Third page of the logout passkey upsell: shown after a successful
 * `submitEmailAddress` from `AddEmailContent`. Tells the user a verification
 * link is on its way and offers three actions:
 *
 *   - Resend the verification email. Disabled after one successful resend
 *     (the `/v1/email/verify` endpoint is rate-limited server-side; the
 *     client-side disable just avoids burning a user-facing rate-limit
 *     error on accidental double-taps).
 *   - Continue to sign out. Mirrors the "Sign out anyway" affordance on the
 *     passkey page: triggers the host page's logout callback.
 *   - Change email. Returns to `AddEmailContent` with the input cleared.
 *
 * Translation strategy: copy is passed in via `translations`, sourced
 * entirely from the prompts service in `logoutUpsellService`. Existing
 * `EmailErrorCode`-keyed strings (e.g. `Message.Error.Email.TooManyVerify`)
 * are reused without re-shipping them through prompts service.
 */

export type VerifyEmailTranslations = {
  title: string;
  /**
   * Body copy with an `{email}` placeholder, e.g. "...we sent to {email}.".
   * This component puts the redacted address (e.g. `a*****@example.com`) in
   * place of the token. A string without the token renders as is.
   */
  body: string;
  /** Primary CTA, e.g. "Resend email". */
  resendLabel: string;
  /** Secondary action, e.g. "Continue to sign out". */
  continueLabel: string;
  /** Tertiary CTA, e.g. "Change email". */
  changeEmailLabel: string;
};

export type VerifyEmailContentProps = {
  translations: VerifyEmailTranslations;
  /** Email the user just submitted via `AddEmailContent`. Displayed redacted. */
  email: string;
  /** Called when the user clicks "Continue to sign out". */
  onContinueToSignOut: () => void;
  /** Called when the user clicks "Change email". */
  onChangeEmail: () => void;
};

const GENERIC_ERROR_FALLBACK = "Something went wrong. Please try again.";

const VerifyEmailContent: React.FC<VerifyEmailContentProps> = ({
  translations,
  email,
  onContinueToSignOut,
  onChangeEmail,
}) => {
  const translate = useTranslations("Feature.AccountSettings");
  const [hasResent, setHasResent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendErrorMessage, setResendErrorMessage] = useState<string | undefined>(undefined);

  const redactedEmail = redactEmailAddress(email);
  // The body comes from the prompts service, not the translation catalogue, so it is filled in here.
  const body = translations.body.split("{email}").join(redactedEmail);

  useEffect(() => {
    sendVerifyEmailShown();
  }, []);

  const handleResend = () => {
    sendResendClick();
    if (hasResent || isResending) {
      return;
    }
    setResendErrorMessage(undefined);
    setIsResending(true);
    resendVerificationEmail()
      .then(result => {
        setIsResending(false);
        if (result.ok) {
          setHasResent(true);
          return;
        }
        const key = getEmailSubmissionErrorKey(result.errorCode);
        setResendErrorMessage(translate.dynamic(key, undefined, GENERIC_ERROR_FALLBACK));
      })
      .catch(() => {
        // resendVerificationEmail is documented to never throw, this should
        // never run but can't hurt to have.
        setIsResending(false);
        setResendErrorMessage(
          translate("Message.Error.Email.Unknown", undefined, GENERIC_ERROR_FALLBACK),
        );
      });
  };

  return (
    <React.Fragment>
      <DialogBody>
        <div className="flex flex-col">
          <DialogTitle className="text-heading-small">{translations.title}</DialogTitle>
          <p className="text-body-medium margin-bottom-none">{body}</p>
          {resendErrorMessage && (
            <p className="text-body-small content-system-alert margin-bottom-none">
              {resendErrorMessage}
            </p>
          )}
        </div>
      </DialogBody>
      <DialogFooter>
        <div className="flex flex-col gap-small width-full">
          <Button
            className="width-full"
            variant="Emphasis"
            size="Medium"
            isDisabled={hasResent || isResending}
            isLoading={isResending}
            onClick={handleResend}
          >
            {translations.resendLabel}
          </Button>
          <Button
            className="width-full"
            variant="Standard"
            size="Medium"
            onClick={() => {
              sendContinueToSignOutClick();
              onContinueToSignOut();
            }}
          >
            {translations.continueLabel}
          </Button>
          <Button
            className="width-full"
            variant="Utility"
            size="Medium"
            onClick={() => {
              sendChangeEmailClick();
              onChangeEmail();
            }}
          >
            {translations.changeEmailLabel}
          </Button>
        </div>
      </DialogFooter>
    </React.Fragment>
  );
};

export default VerifyEmailContent;
