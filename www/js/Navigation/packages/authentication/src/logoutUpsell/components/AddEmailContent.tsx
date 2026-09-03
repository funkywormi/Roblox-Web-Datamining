import React, { useEffect, useState } from "react";
import { Button, DialogBody, DialogFooter, DialogTitle, TextInput } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { validateEmailAddress } from "@rbx/authentication-common/utils/emailValidation";
import { getEmailSubmissionErrorKey, submitEmailAddress } from "../services/emailService";
import {
  AddEmailError,
  addEmailServerError,
  AddEmailOriginName,
  sendAddEmailContinueClick,
  sendAddEmailError,
  sendAddEmailShown,
  sendEmailFieldInteraction,
} from "../services/logoutUpsellEvents";

export type AddEmailTranslations = {
  title: string;
  body: string;
  /** Placeholder text shown inside the email field. */
  placeholder: string;
  /** Primary action label (e.g. "Continue"). */
  continueLabel: string;
};

export type AddEmailContentProps = {
  translations: AddEmailTranslations;
  /** Called with the user-entered email after the server accepts it. */
  onContinue: (email: string) => void;
  /** How the user reached this screen; reported on the "modal shown" event. */
  origin: AddEmailOriginName;
};

const INVALID_EMAIL_KEY = "Message.Error.Email.InvalidEmail";
const INVALID_EMAIL_FALLBACK = "Please enter a valid email address.";
const GENERIC_ERROR_FALLBACK = "Something went wrong. Please try again.";

const AddEmailContent: React.FC<AddEmailContentProps> = ({ translations, onContinue, origin }) => {
  const { translate } = useTranslation();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    sendAddEmailShown(origin);
  }, [origin]);

  const handleContinue = () => {
    sendAddEmailContinueClick(origin);
    if (isSubmitting) {
      return;
    }
    if (!validateEmailAddress(email)) {
      setErrorMessage(translate(INVALID_EMAIL_KEY, undefined, INVALID_EMAIL_FALLBACK));
      sendAddEmailError(origin, AddEmailError.InvalidFormat);
      return;
    }
    setErrorMessage(undefined);
    setIsSubmitting(true);
    submitEmailAddress(email)
      .then(result => {
        if (result.ok) {
          // Leave isSubmitting=true on success so the button stays disabled
          // until the parent swaps the page away. Prevents a double-tap from
          // re-submitting against a freshly mounted component.
          onContinue(email);
          return;
        }
        const key = getEmailSubmissionErrorKey(result.errorCode);
        setErrorMessage(translate(key, undefined, GENERIC_ERROR_FALLBACK));
        sendAddEmailError(origin, addEmailServerError(result.errorCode));
        setIsSubmitting(false);
      })
      .catch(() => {
        // submitEmailAddress is documented to never throw, but this can't hurt
        setErrorMessage(translate(INVALID_EMAIL_KEY, undefined, GENERIC_ERROR_FALLBACK));
        sendAddEmailError(origin, AddEmailError.Threw);
        setIsSubmitting(false);
      });
  };

  return (
    <React.Fragment>
      <DialogBody>
        <div className="flex flex-col">
          <DialogTitle className="text-heading-small">{translations.title}</DialogTitle>
          <p className="text-body-medium margin-bottom-medium">{translations.body}</p>
          <TextInput
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-label={translations.placeholder}
            placeholder={translations.placeholder}
            value={email}
            isDisabled={isSubmitting}
            // Fired on every focus-gain (matching the canonical auth field-focus
            // pattern), not deduped.
            onFocus={() => sendEmailFieldInteraction(origin)}
            onChange={event => {
              setEmail(event.target.value);
              if (errorMessage) {
                setErrorMessage(undefined);
              }
            }}
            error={errorMessage}
            hasError={errorMessage !== undefined}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          className="width-full"
          variant="Emphasis"
          size="Medium"
          isDisabled={email.length === 0 || isSubmitting}
          isLoading={isSubmitting}
          onClick={handleContinue}
        >
          {translations.continueLabel}
        </Button>
      </DialogFooter>
    </React.Fragment>
  );
};

export default AddEmailContent;
