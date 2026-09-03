import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { TextInput, ProgressCircle, IconButton } from "@rbx/foundation-ui";
import { currentUserHasVerifiedBadge, fetchTranslations } from "@rbx/roblox-badges";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { useTranslation } from "@rbx/core-scripts/legacy/react-utilities";
import { UserProfileField, useUserProfiles } from "@rbx/user-profiles";
import { useSettingsModal, IModalService } from "./useSettingsModal";
import {
  validateDisplayName,
  updateDisplayName,
  TDisplayNameParams,
} from "../services/displayNameService";
import {
  closeTranslationKey,
  displayNameSettleDelayMs,
  maxDisplayNameCharacters,
  unknownErrorTranslationKey,
  nameTooShortTranslationKey,
} from "../constants/displayNameConstants";

export type TChangeDisplayNameModalProps = {
  showAgedUpDisplayName?: boolean;
  translatedTitle: string;
  translatedDescription: string;
  translatedSaveButtonText: string;
  /** Callback when display name is successfully changed */
  onSuccess?: (oldDisplayName: string, newDisplayName: string) => void | Promise<void>;
  /** Callback when modal is dismissed/cancelled */
  onCancel?: (currentDisplayName: string) => void;
  /** Optional callback for IXP layer exposure logging on first text change */
  onTextChanged?: () => void;
  translatedClearButtonAriaLabel: string;
};

/**
 * A hook that creates a Foundation UI Dialog-based modal for changing display name.
 * Handles validation and submission internally using the display name API.
 */
export function useChangeDisplayNameModal({
  showAgedUpDisplayName = false,
  translatedTitle,
  translatedDescription,
  translatedSaveButtonText,
  onSuccess,
  onCancel,
  onTextChanged,
  translatedClearButtonAriaLabel,
}: TChangeDisplayNameModalProps): [React.JSX.Element, IModalService] {
  const { translate } = useTranslation();
  const displayVerifiedBadgeWarning = currentUserHasVerifiedBadge();
  const verifiedBadgeDisplayNameChangeWarning =
    fetchTranslations().translatedVerifiedBadgeDisplayNameChangeText;

  const userId = authenticatedUser.id ?? 0;
  const { data, client } = useUserProfiles(userId ? [userId] : [], [
    UserProfileField.Names.DisplayName,
  ]);

  const profileBackedDisplayName = useMemo(
    () => data?.[userId]?.names.displayName ?? authenticatedUser.displayName ?? "",
    [data, userId],
  );

  const savedDisplayNameRef = useRef(profileBackedDisplayName);
  const [newDisplayName, setNewDisplayName] = useState(profileBackedDisplayName);
  const [errorMessage, setErrorMessage] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [hasExceededMaxLength, setHasExceededMaxLength] = useState(false);
  const loggedTextChangedRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceDelay = 200;

  useEffect(() => {
    savedDisplayNameRef.current = profileBackedDisplayName;
  }, [profileBackedDisplayName]);

  const clearState = useCallback(() => {
    const latest = data?.[userId]?.names.displayName ?? authenticatedUser.displayName ?? "";
    savedDisplayNameRef.current = latest;
    setNewDisplayName(latest);
    setIsValidating(false);
    setHasExceededMaxLength(false);
    loggedTextChangedRef.current = false;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, [data, userId]);

  const clearStateToLatestProfile = useCallback(() => {
    setErrorMessage("");
    clearState();
  }, [clearState]);

  const handleValidateDisplayName = useCallback(
    (name: string) => {
      const uid = authenticatedUser.id;
      if (!uid) {
        return;
      }

      if (!loggedTextChangedRef.current) {
        loggedTextChangedRef.current = true;
        onTextChanged?.();
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (!name) {
        setIsValidating(false);
        setErrorMessage(translate(nameTooShortTranslationKey));
        return;
      }

      setIsValidating(true);
      setErrorMessage("");

      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        const params: TDisplayNameParams = {
          userId: uid,
          newDisplayName: name,
          showAgedUpDisplayName,
        };
        validateDisplayName(params)
          .then(() => {
            setErrorMessage("");
          })
          .catch((error: unknown) => {
            const translationKey =
              error instanceof Error ? error.message : unknownErrorTranslationKey;
            const translationValue =
              translate(translationKey) || translate(unknownErrorTranslationKey);
            setErrorMessage(translationValue);
          })
          .finally(() => {
            setIsValidating(false);
          });
      }, debounceDelay);
    },
    [onTextChanged, showAgedUpDisplayName, translate],
  );

  const submitChangeDisplayName = async () => {
    if (!authenticatedUser.id) return;

    const oldName = savedDisplayNameRef.current;

    try {
      const params: TDisplayNameParams = {
        userId: authenticatedUser.id,
        newDisplayName,
        showAgedUpDisplayName,
      };
      await updateDisplayName(params);
      savedDisplayNameRef.current = newDisplayName;
      await new Promise(resolve => {
        setTimeout(resolve, displayNameSettleDelayMs);
      });
      await client.refetchQueries({ include: ["UserProfiles"] });
      await onSuccess?.(oldName, newDisplayName);
      clearStateToLatestProfile();
    } catch (error) {
      const translationKey = error instanceof Error ? error.message : unknownErrorTranslationKey;
      setErrorMessage(translate(translationKey));
      clearState();
    }
  };

  const countdown = `${newDisplayName.length}/${maxDisplayNameCharacters}`;

  const getTrailingIconNode = (): React.ReactNode => {
    if (isValidating) {
      return (
        <div className="padding-right-small padding-top-xsmall">
          <ProgressCircle ariaLabel="Progress" size="Small" variant="Indeterminate" />
        </div>
      );
    }
    if (newDisplayName.length > 0) {
      return (
        <IconButton
          icon="icon-regular-circle-x"
          size="Small"
          variant="Utility"
          ariaLabel={translatedClearButtonAriaLabel}
          onClick={() => {
            setNewDisplayName("");
            setErrorMessage(translate(nameTooShortTranslationKey));
            setIsValidating(false);
            setHasExceededMaxLength(false);
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
              debounceTimerRef.current = null;
            }
          }}
        />
      );
    }
    return undefined;
  };

  const modalBody = (
    <div className="flex flex-col gap-medium">
      <p className="text-body-medium content-sub">
        {displayVerifiedBadgeWarning
          ? verifiedBadgeDisplayNameChangeWarning
          : translatedDescription}
      </p>
      <div>
        <TextInput
          placeholder={savedDisplayNameRef.current}
          value={newDisplayName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            if (value.length > maxDisplayNameCharacters) {
              setHasExceededMaxLength(true);
              const truncated = value.slice(0, maxDisplayNameCharacters);
              setNewDisplayName(truncated);
              handleValidateDisplayName(truncated);
            } else {
              if (value.length < maxDisplayNameCharacters) {
                setHasExceededMaxLength(false);
              }
              setNewDisplayName(value);
              handleValidateDisplayName(value);
            }
          }}
          hasError={errorMessage !== "" || hasExceededMaxLength}
          size="Medium"
          trailingIconNode={getTrailingIconNode()}
        />
        <div className="text-caption-small flex justify-between items-start padding-top-small">
          <span className="text-alert">{errorMessage}</span>
          <span
            className={`text-caption-small padding-left-small ${errorMessage || hasExceededMaxLength ? "text-alert" : "content-sub"}`}
          >
            {countdown}
          </span>
        </div>
      </div>
    </div>
  );

  const [modal, baseModalService] = useSettingsModal({
    translatedTitle,
    translatedBody: modalBody,
    translatedActionButtonText: translatedSaveButtonText,
    translatedCloseLabel: translate(closeTranslationKey),
    disableActionButton:
      !authenticatedUser.id || errorMessage !== "" || newDisplayName === "" || isValidating,
    onAction: () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      submitChangeDisplayName();
    },
    onDismiss: () => {
      clearStateToLatestProfile();
      onCancel?.(profileBackedDisplayName);
    },
    size: "Medium",
  });

  const modalService: IModalService = useMemo(
    () => ({
      open: () => {
        clearStateToLatestProfile();
        baseModalService.open();
      },
      close: baseModalService.close,
    }),
    [baseModalService, clearStateToLatestProfile],
  );

  return [modal, modalService];
}
