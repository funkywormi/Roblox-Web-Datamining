import React, { Fragment, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loading, Modal } from "react-style-guide";
import {
  Button,
  Checkbox,
  Icon,
  IconButton,
  Tooltip,
  TooltipTrigger,
  type TIconProps,
} from "@rbx/foundation-ui";
import useAccountRecoveryContext from "../../hooks/useAccountRecoveryContext";
import ModalState from "../../store/modalState";
import { AccountRecoveryActionType } from "../../store/action";
import {
  AccountRecoveryResources,
  mapAccountRecoveryErrorToResource,
} from "../../constants/resources";
import {
  CredentialCategory,
  CredentialCategoryGroup,
} from "../../../../common/request/types/accountRecovery";

type IconName = TIconProps["name"];

/**
 * The service returns this literal English string in place of an address when
 * the account's email was altered by an age change. It is a sentinel, not a
 * value the user should ever see, so it is matched case-insensitively and
 * swapped for a localized label before rendering.
 */
const EMAIL_UNAVAILABLE_SENTINEL = "email unavailable";

const VALUE_DATE_SEPARATOR = " • ";

const isEmailUnavailable = (value: string): boolean =>
  value.toLowerCase() === EMAIL_UNAVAILABLE_SENTINEL;

/**
 * Formats a credential's `timeAdded` (a Unix timestamp in milliseconds) as a
 * locale-aware medium date (e.g. Oct 3, 2025 in en-us), or an empty string when
 * the timestamp is missing or unusable.
 */
const formatDate = (timeAdded: number | undefined): string => {
  if (typeof timeAdded !== "number" || !Number.isFinite(timeAdded)) {
    return "";
  }
  const date = new Date(timeAdded);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDetailLine = (value: string, date: string): string => {
  if (value !== "" && date !== "") {
    return `${value}${VALUE_DATE_SEPARATOR}${date}`;
  }
  return date !== "" ? date : value;
};

const getTwoStepMethodText = (
  resources: AccountRecoveryResources,
  twoStepMethod: string,
): string => {
  switch (twoStepMethod) {
    case "Email":
      return resources.Label.Email2svCapitalized;
    case "Authenticator":
      return resources.Label.Authenticator2svCapitalized;
    case "SecurityKey":
      return resources.Label.SecurityKey2svCapitalized;
    default:
      return twoStepMethod;
  }
};

/**
 * A category renders as either:
 *   * `grouped`: one row for the whole category, with a detail line per
 *     credential that is either "value • date" (`showValue`) or just the date.
 *   * `perCredential`: one row per credential (2SV), with the method name in the
 *     header and a single date as the body.
 *
 * `redactsUnavailableEmail` marks a category whose values the service may
 * replace with `EMAIL_UNAVAILABLE_SENTINEL`.
 */
type CategoryDisplay =
  | {
      kind: "grouped";
      icon: IconName;
      getHeader: (resources: AccountRecoveryResources) => string;
      showValue: boolean;
      redactsUnavailableEmail?: boolean;
    }
  | {
      kind: "perCredential";
      icon: IconName;
      getHeader: (resources: AccountRecoveryResources, value: string) => string;
    };

const CATEGORY_DISPLAY: Partial<Record<CredentialCategory, CategoryDisplay>> = {
  [CredentialCategory.Email]: {
    kind: "grouped",
    icon: "icon-regular-envelope",
    getHeader: resources => resources.Heading.EmailAdded,
    showValue: true,
    redactsUnavailableEmail: true,
  },
  [CredentialCategory.BillingEmail]: {
    kind: "grouped",
    icon: "icon-regular-envelope",
    getHeader: resources => resources.Heading.BillingEmailAdded,
    showValue: true,
  },
  [CredentialCategory.PhoneNumber]: {
    kind: "grouped",
    icon: "icon-regular-phone",
    getHeader: resources => resources.Heading.PhoneNumberAdded,
    showValue: true,
  },
  [CredentialCategory.TwoStepVerification]: {
    kind: "perCredential",
    icon: "icon-regular-shield-lock",
    getHeader: (resources, value) =>
      resources.Heading.TwoStepMethodAdded(getTwoStepMethodText(resources, value)),
  },
  [CredentialCategory.Passkey]: {
    kind: "grouped",
    icon: "icon-regular-key",
    // The value is the passkey's nickname, which the service may omit.
    getHeader: resources => resources.Heading.PasskeyAdded,
    showValue: true,
  },
  [CredentialCategory.EnhancedProtectionProgram]: {
    kind: "grouped",
    icon: "icon-regular-shield-check",
    getHeader: resources => resources.Heading.EnrolledInEnhancedProtection,
    showValue: false,
  },
  [CredentialCategory.BackupCodes]: {
    kind: "grouped",
    icon: "icon-regular-hashtag",
    getHeader: resources => resources.Heading.BackupCodesGenerated,
    showValue: false,
  },
};

type ChangeRowLine = {
  key: string;
  text: string;
};

type ChangeRow = {
  key: string;
  header: string;
  lines: ChangeRowLine[];
  icon: IconName;
  /**
   * Set when at least one credential in this row came back as the
   * unavailable-email sentinel, which makes the header carry an explanatory
   * info affordance.
   */
  hasUnavailableEmail: boolean;
};

/**
 * The heading and intro are worded differently when there is a single change to
 * review, so they need a count of credentials rather than of rows: a grouped
 * category can stack several credentials under one row. Every rendered
 * credential is exactly one line, so counting lines keeps the copy — and the
 * decision to offer deletion at all — in step with what the rows actually show.
 */
const countRenderedCredentials = (rows: ChangeRow[]): number =>
  rows.reduce((total, row) => total + row.lines.length, 0);

const buildChangeRows = (
  categories: CredentialCategoryGroup[],
  resources: AccountRecoveryResources,
): ChangeRow[] => {
  const rows: ChangeRow[] = [];

  categories.forEach((group, groupIndex) => {
    const display = CATEGORY_DISPLAY[group.category];
    if (!display) {
      return;
    }

    if (display.kind === "perCredential") {
      group.credentials.forEach((credential, credentialIndex) => {
        const date = formatDate(credential.timeAdded);
        if (date === "") {
          return;
        }
        const key = `${group.category}-${groupIndex}-${credentialIndex}`;
        rows.push({
          key,
          header: display.getHeader(resources, credential.value),
          lines: [{ key: `${key}-date`, text: date }],
          icon: display.icon,
          hasUnavailableEmail: false,
        });
      });
      return;
    }

    const lines: ChangeRowLine[] = [];
    let hasUnavailableEmail = false;

    group.credentials.forEach((credential, credentialIndex) => {
      // The service may omit `value` (e.g. a passkey with no nickname). Treat
      // missing/null the same as empty so we never stringify it, and so the
      // unavailable-email check is not called on a non-string.
      let value = credential.value ?? "";
      if (display.redactsUnavailableEmail && isEmailUnavailable(value)) {
        hasUnavailableEmail = true;
        value = resources.Label.EmailUnavailable;
      }
      const text = formatDetailLine(
        display.showValue ? value : "",
        formatDate(credential.timeAdded),
      );
      if (text !== "") {
        lines.push({ key: `${group.category}-${groupIndex}-${credentialIndex}`, text });
      }
    });

    if (lines.length > 0) {
      rows.push({
        key: `${group.category}-${groupIndex}`,
        header: display.getHeader(resources),
        lines,
        icon: display.icon,
        hasUnavailableEmail,
      });
    }
  });

  return rows;
};

/**
 * Explains the "email unavailable" placeholder beside the row header. Hover and
 * keyboard focus still open the tooltip; an onClick toggle makes it reachable
 * on touch, where Radix suppresses pointer-open tooltips.
 */
const UnavailableEmailInfo: React.FC<{ text: string }> = ({ text }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <Tooltip
      position="bottom-start"
      title=""
      ariaLabel={text}
      description={text}
      open={tooltipOpen}
      onOpenChange={setTooltipOpen}
    >
      <TooltipTrigger asChild>
        <IconButton
          icon="icon-regular-circle-i"
          size="XSmall"
          variant="Utility"
          ariaLabel={text}
          onClick={() => setTooltipOpen(prev => !prev)}
        />
      </TooltipTrigger>
    </Tooltip>
  );
};

const ModalInvalidateCredentials: React.FC = () => {
  const {
    state: { modalStateAndProps, recoverySessionId, requestService, resources },
    dispatch,
  } = useAccountRecoveryContext();

  const [warningAcknowledged, setWarningAcknowledged] = useState(false);

  // The body stays gated behind `initializing` until this settles, so the
  // decision is never offered against a list that hasn't loaded.
  const {
    data: credentialCategories = [],
    isLoading: initializing,
    error: fetchError,
  } = useQuery<CredentialCategoryGroup[], Error>({
    queryKey: ["credentialsToInvalidate", recoverySessionId],
    queryFn: async () => {
      const result =
        await requestService.accountRecoveryApi.getCredentialsToInvalidate(recoverySessionId);
      if (result.isError) {
        throw new Error(mapAccountRecoveryErrorToResource(resources, result.error));
      }
      return result.value.credentialsToInvalidate;
    },
    retry: false,
  });

  /**
   * Deleting ends the flow, so its confirmation needs nothing but the way out.
   */
  const handleCredentialsDeleted = () => {
    if (modalStateAndProps.modalState !== ModalState.INVALIDATE_CREDENTIALS) return;
    const { onPasswordResetSuccess } = modalStateAndProps.additionalModalProps;

    dispatch({
      type: AccountRecoveryActionType.SET_MODAL_STATE,
      modalState: ModalState.ACCOUNT_SECURED,
      additionalModalProps: { onPasswordResetSuccess },
    });
  };

  /**
   * Keeping the changes leaves the post-recovery prompts pending, so its
   * confirmation carries them through and owns the rest of the chain.
   */
  const handleCredentialsKept = () => {
    if (modalStateAndProps.modalState !== ModalState.INVALIDATE_CREDENTIALS) return;
    const {
      shouldPromptPasskeyAddition,
      shouldPrompt2svRemoval,
      shouldUpdateEmail,
      updatedEmail,
      onPasswordResetSuccess,
    } = modalStateAndProps.additionalModalProps;

    dispatch({
      type: AccountRecoveryActionType.SET_MODAL_STATE,
      modalState: ModalState.NO_CHANGES_MADE,
      additionalModalProps: {
        shouldPromptPasskeyAddition,
        shouldPrompt2svRemoval,
        shouldUpdateEmail,
        updatedEmail,
        onPasswordResetSuccess,
      },
    });
  };

  const {
    mutate: deleteAll,
    isPending: requestInFlight,
    error: deleteError,
  } = useMutation<undefined, Error>(
    async () => {
      const result = await requestService.accountRecoveryApi.invalidateCredentials(
        recoverySessionId,
        true,
      );
      if (result.isError) {
        throw new Error(mapAccountRecoveryErrorToResource(resources, result.error));
      }
    },
    { onSuccess: handleCredentialsDeleted },
  );

  if (modalStateAndProps.modalState !== ModalState.INVALIDATE_CREDENTIALS) {
    return <Fragment />;
  }

  const changeRows = buildChangeRows(credentialCategories, resources);
  const credentialCount = countRenderedCredentials(changeRows);
  const hasSingleCredential = credentialCount === 1;

  const heading = hasSingleCredential
    ? resources.Heading.InvalidateCredential
    : resources.Heading.InvalidateCredentials;
  const intro = hasSingleCredential
    ? resources.Description.InvalidateCredentialInfo
    : resources.Description.InvalidateCredentialsIntro;
  const errorMessage = deleteError?.message ?? fetchError?.message;

  const handleKeepAll = () => {
    if (!warningAcknowledged || requestInFlight) return;
    // Best-effort: the user's decision is still worth recording, but nothing
    // here is destructive, so a failure must not block them from moving on.
    // eslint-disable-next-line no-void
    void requestService.accountRecoveryApi.invalidateCredentials(recoverySessionId, false);
    handleCredentialsKept();
  };

  return (
    <div data-testid="invalidate-credentials-modal">
      {initializing ? (
        <Loading />
      ) : (
        <React.Fragment>
          <Modal.Header useBaseBootstrapComponent className="invalidate-credentials-header">
            <div className="invalidate-credentials-heading text-align-x-left">
              <span className="text-heading-small content-emphasis">{heading}</span>
              <span className="text-body-medium content-muted">{intro}</span>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div
              data-testid="invalidate-credentials-changes"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                maxHeight: "40vh",
                overflowY: "auto",
              }}
            >
              {changeRows.map(row => (
                <div key={row.key} style={{ display: "flex", gap: "8px" }}>
                  <Icon name={row.icon} size="Medium" className="content-muted" />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span className="text-title-medium content-emphasis">{row.header}</span>
                      {row.hasUnavailableEmail && (
                        <UnavailableEmailInfo text={resources.Description.EmailUnavailableInfo} />
                      )}
                    </div>
                    {row.lines.map(line => (
                      <span key={line.key} className="text-body-medium content-muted">
                        {line.text}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div
              data-testid="invalidate-credentials-warning"
              className="modal-margin-bottom"
              style={{ marginTop: "16px" }}
            >
              <Checkbox
                size="Small"
                placement="Start"
                isChecked={warningAcknowledged}
                onCheckedChange={isChecked => setWarningAcknowledged(isChecked === true)}
                label={resources.Description.InvalidateCredentialsWarning}
              />
            </div>
            {errorMessage && <p className="text-error xsmall">{errorMessage}</p>}
          </Modal.Body>
          <Modal.Footer>
            <div className="modal-modern-footer-buttons">
              <Button
                variant="Emphasis"
                size="Medium"
                className="modal-modern-footer-button"
                // We don't disable on empty list because the user can still
                // click it to confirm the ATO.
                isDisabled={!warningAcknowledged || requestInFlight}
                isLoading={requestInFlight}
                onClick={() => deleteAll()}
              >
                {resources.Action.DeleteAll}
              </Button>
              <Button
                variant="Standard"
                size="Medium"
                className="modal-modern-footer-button"
                isDisabled={!warningAcknowledged || requestInFlight}
                onClick={handleKeepAll}
              >
                {resources.Action.DontDeleteCredentials}
              </Button>
            </div>
          </Modal.Footer>
        </React.Fragment>
      )}
    </div>
  );
};

export default ModalInvalidateCredentials;
