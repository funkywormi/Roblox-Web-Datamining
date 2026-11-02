import React, { useState, useCallback, useMemo } from "react";
import { LegallySensitiveContentService } from "@rbx/legacy-webapp-types/Roblox";
import { useTranslation } from "@rbx/core-scripts/legacy/react-utilities";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { TextInput, Checkbox } from "@rbx/foundation-ui";
import { useSettingsModal, IModalService } from "./useSettingsModal";
import { optIntoPromotionalOffersEmails, updateEmailAddress } from "../services/emailService";
import { ChallengeAbandonedError } from "../enums/errorCodes";
import {
  closeTranslationKey,
  emailMarketingConsentName,
  emailMarketingConsentSurface,
  emailRegex,
  emailSettleDelayMs,
  enterEmailTranslationKey,
  invalidEmailTranslationKey,
  unknownErrorTranslationKey,
} from "../constants/emailConstants";

export type TPromotionalOffersConsentResult = {
  isConsentCheckboxShown: boolean;
  isConsentCheckboxChecked: boolean;
  isConsentSaved: boolean;
};

export type TSetEmailModalProps = {
  translatedTitle: string;
  translatedDescription: React.ReactNode;
  translatedSaveButtonText: string;
  translatedSuccessDescription: string;
  translatedSuccessButtonText: string;
  /** Whether the user may see the promotional offers consent checkbox, e.g. not already opted in */
  enableConsentCheckbox?: boolean;
  /** Callback when the email is successfully set, with the promotional offers consent outcome */
  onSuccess?: (consent: TPromotionalOffersConsentResult) => void | Promise<void>;
  /** Callback when setting the email fails */
  onError?: () => void;
  /** Callback when modal is dismissed/cancelled before the email is set */
  onCancel?: () => void;
  /** Callback when the modal opens with the promotional offers consent checkbox shown */
  onConsentShown?: () => void;
};

/**
 * A hook that creates a Foundation UI Dialog-based modal for adding or changing the user's email.
 * Handles validation and submission internally using the account settings email API.
 */
export function useSetEmailModal({
  translatedTitle,
  translatedDescription,
  translatedSaveButtonText,
  translatedSuccessDescription,
  translatedSuccessButtonText,
  enableConsentCheckbox = false,
  onSuccess,
  onError,
  onCancel,
  onConsentShown,
}: TSetEmailModalProps): [React.JSX.Element, IModalService] {
  const { translate } = useTranslation();
  const [emailConsentContent, emailConsentActions] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      emailMarketingConsentName,
      emailMarketingConsentSurface,
    );
  const showConsentCheckbox = enableConsentCheckbox && !authenticatedUser.isUnder13;

  const [emailAddress, setEmailAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSet, setIsEmailSet] = useState(false);

  const clearState = useCallback(() => {
    setEmailAddress("");
    setErrorMessage("");
    setIsConsentChecked(false);
    setIsSubmitting(false);
    setIsEmailSet(false);
  }, []);

  const isValidEmailAddress = emailRegex.test(emailAddress);
  const inputErrorMessage =
    emailAddress && !isValidEmailAddress ? translate(invalidEmailTranslationKey) : errorMessage;

  const submitEmailAddress = async () => {
    if (!isValidEmailAddress || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await updateEmailAddress(emailAddress);
      await new Promise(resolve => {
        setTimeout(resolve, emailSettleDelayMs);
      });

      // We try to save the email preference, but if it fails do not error out
      let isConsentSaved = false;
      if (showConsentCheckbox && isConsentChecked) {
        try {
          await optIntoPromotionalOffersEmails(emailConsentActions.getBase64EncodedAuditHeader());
          isConsentSaved = true;
          // eslint-disable-next-line no-empty
        } catch {}
      }

      await onSuccess?.({
        isConsentCheckboxShown: showConsentCheckbox,
        isConsentCheckboxChecked: isConsentChecked,
        isConsentSaved,
      });
      setIsEmailSet(true);
    } catch (error) {
      const translationKey = error instanceof Error ? error.message : unknownErrorTranslationKey;
      // Ignore challenge abandons for errors.
      if (translationKey === ChallengeAbandonedError) {
        return;
      }
      setErrorMessage(translate(translationKey));
      onError?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalBody = isEmailSet ? (
    translatedSuccessDescription
  ) : (
    <div className="flex flex-col gap-medium">
      <p className="text-body-medium content-sub">{translatedDescription}</p>
      <TextInput
        type="email"
        placeholder={translate(enterEmailTranslationKey)}
        autoComplete="off"
        value={emailAddress}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setEmailAddress(e.target.value);
          setErrorMessage("");
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            e.preventDefault();
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            submitEmailAddress();
          }
        }}
        hasError={inputErrorMessage !== ""}
        error={inputErrorMessage}
        size="Medium"
      />
      {showConsentCheckbox && (
        <Checkbox
          label={emailConsentContent.wordsOfConsent.consent ?? ""}
          isChecked={isConsentChecked}
          onCheckedChange={checked => {
            setIsConsentChecked(checked === true);
          }}
          size="Medium"
          placement="Start"
        />
      )}
    </div>
  );

  const [modal, baseModalService] = useSettingsModal({
    translatedTitle,
    translatedBody: modalBody,
    translatedActionButtonText: isEmailSet ? translatedSuccessButtonText : translatedSaveButtonText,
    translatedCloseLabel: translate(closeTranslationKey),
    disableActionButton: !isEmailSet && (!isValidEmailAddress || isSubmitting),
    shouldCloseModalOnActionButton: isEmailSet,
    onAction: () => {
      if (isEmailSet) {
        clearState();
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      submitEmailAddress();
    },
    onDismiss: () => {
      if (!isEmailSet) {
        onCancel?.();
      }
      clearState();
    },
    size: "Medium",
  });

  const modalService: IModalService = useMemo(
    () => ({
      open: () => {
        clearState();
        baseModalService.open();
        if (showConsentCheckbox) {
          onConsentShown?.();
        }
      },
      close: baseModalService.close,
    }),
    [baseModalService, clearState, showConsentCheckbox, onConsentShown],
  );

  return [modal, modalService];
}
