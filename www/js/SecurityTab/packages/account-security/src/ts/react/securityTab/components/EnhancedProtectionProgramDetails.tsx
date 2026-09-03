import React, { useEffect, useState } from "react";
import { ListItem, Button, IconButton } from "@rbx/foundation-ui";
import "../../../../css/tailwind.css";
import { focusManager } from "@tanstack/react-query";
import { Fido2CredentialRegistrationService } from "Roblox";
import AUTH_EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import { GetMySettingsInfoReturnType } from "../../../common/request/types/myAccount";
import { EppEnrollmentStatus } from "../../../common/request/types/userSettings";
import useSecurityTabContext from "../hooks/useSecurityTabContext";
import EnhancedProtectionDisableWarning from "./modal/enhancedProtectionDisableWarning";
import { EmailUpdateModal, EmailSubmitPayload } from "./modal/emailUpdateModal";
import { ChecklistStatus, EppChecklistItem } from "./modal/eppChecklistItem";
import { authenticatedUser } from "header-scripts";
import { SecurityTabActionType } from "../store/action";
import ModalState from "../store/modalState";
import {
  mapEmailErrorToResource,
  mapPhoneErrorToResource,
  mapPhoneVerificationErrorToResource,
  mapResendCodeErrorToResource,
} from "../constants/resources";
import {
  PhoneSubmitPayload,
  PhoneUpdateModal,
  PhoneVerificationPayload,
  ResendCodePayload,
} from "./modal/phoneUpdateModal";
import { EmailError } from "../../../common/request/types/email";
import {
  ResendCodeError,
  UpdatePhoneError,
  VerifyCodeError,
} from "../../../common/request/types/phone";
import { CredentialPurpose } from "../../fido2CredentialRegistration/constants/types";

type EnhancedProtectionProgramDetailsProps = {
  onBackClick: () => void;
};

enum EnrollmentStatus {
  DISABLED = 0,
  ENABLED_TO_ENROLL = 1,
  ENABLED_TO_UNENROLL = 2,
}

type TextByEnum = {
  [key in ChecklistStatus]?: string;
};

type bindEmailVerificationRefreshHack = {
  verifiedEmailChecklistStatus: ChecklistStatus;
  refetchSettings: () => Promise<unknown>;
};

export const bindEmailVerificationRefreshHack = ({
  verifiedEmailChecklistStatus,
  refetchSettings,
}: bindEmailVerificationRefreshHack): void => {
  // Copy-pasted from https://tanstack.com/query/latest/docs/framework/react/guides/window-focus-refetching#custom-window-focus-event
  // Normally queries should auto-refetch on window focus but for some reason this version doesn't
  // do that for us by default.
  focusManager.setEventListener(handleFocus => {
    // Listen to visibilitychange
    if (
      typeof window !== "undefined" &&
      window.addEventListener &&
      // If email isn't pending there's no need to refresh settings.
      verifiedEmailChecklistStatus === ChecklistStatus.PENDING
    ) {
      const visibilitychangeHandler = () => {
        handleFocus(document.visibilityState === "visible");
        // eslint-disable-next-line no-void
        void refetchSettings();
      };
      window.addEventListener("visibilitychange", visibilitychangeHandler, false);
      return () => {
        // Cleanup.
        window.removeEventListener("visibilitychange", visibilitychangeHandler);
      };
    }
    // Here because hooks + Typescript don't like inconsistent branching.
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  });
};

const EnhancedProtectionProgramDetails: React.FC<EnhancedProtectionProgramDetailsProps> = ({
  onBackClick,
}) => {
  const {
    state: {
      resources,
      phoneConfiguration,
      mySettingsInfo,
      credentialsList,
      isPasskeySupported,
      userSettings,
      requestService,
      systemFeedbackService,
      refetchPhoneConfiguration,
      refetchSettings,
      refetchCredentials,
      twoStepVerificationMetadata,
      eventService,
      recoveryCodeStatus,
    },
    dispatch,
  } = useSecurityTabContext();

  /**
   * Component Constants
   */

  const isEppRecoveryCodesEnabled = twoStepVerificationMetadata?.isEppRecoveryCodesEnabled ?? false;

  const passkeyCount = credentialsList?.credentials?.length ?? 0;
  const passKeyTextMap: TextByEnum = {
    [ChecklistStatus.INCOMPLETE]: resources.Label.AddPasskeyEnsureAccess,
    [ChecklistStatus.COMPLETE]: resources.Label.PasskeysAddedEnsureAccess(passkeyCount),
  };
  const passKeyButtonTextMap: TextByEnum = {
    [ChecklistStatus.INCOMPLETE]: resources.Action.Add,
    [ChecklistStatus.COMPLETE]: resources.Action.Edit,
  };
  const verifiedEmailTextMap: TextByEnum = {
    [ChecklistStatus.COMPLETE]: mySettingsInfo?.UserEmail,
    [ChecklistStatus.PENDING]: resources.Action.Dialog.PendingEmailVerification,
  };
  const verifiedEmailButtonTextMap: TextByEnum = {
    [ChecklistStatus.INCOMPLETE]: resources.Action.Add,
    [ChecklistStatus.COMPLETE]: resources.Action.Edit,
    [ChecklistStatus.PENDING]: resources.Action.Edit,
  };
  const verifiedPhoneTextMap: TextByEnum = {
    [ChecklistStatus.COMPLETE]: phoneConfiguration?.phone,
  };
  const verifiedPhoneButtonTextMap: TextByEnum = {
    [ChecklistStatus.INCOMPLETE]: resources.Action.Add,
    [ChecklistStatus.COMPLETE]: resources.Action.Edit,
    // We would like to set this to verify to allow users to "pick-back-up" from the verification
    // state. But phone-numbers-service right now doesn't support non-atomic sets. This is how
    // the old UX was implemented in the account info page.
    [ChecklistStatus.PENDING]: resources.Action.Edit,
  };
  const backupCodesBodyText =
    (recoveryCodeStatus?.activeCount ?? 0) > 0
      ? `${resources.Label.UnusedRecoveryCodes(recoveryCodeStatus.activeCount)} ${resources.Label.DoNotShare}`
      : "";
  const backupCodesButtonTextMap: TextByEnum = {
    [ChecklistStatus.INCOMPLETE]: resources.Action.Create,
    [ChecklistStatus.COMPLETE]: resources.Action.CreateAgain,
  };
  const enrollmentButtonTextMap = {
    [EnrollmentStatus.DISABLED]: resources.Action.EnableEnhancedProtectionProgram,
    [EnrollmentStatus.ENABLED_TO_ENROLL]: resources.Action.EnableEnhancedProtectionProgram,
    [EnrollmentStatus.ENABLED_TO_UNENROLL]: resources.Action.TurnOffEnhancedProtectionProgram,
  };

  /**
   * Hooks
   */

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [clearCodesWarningOpen, setClearCodesWarningOpen] = useState<boolean>(false);
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState<boolean>(false);

  const [passkeyChecklistStatus, setPasskeyChecklistStatus] = useState<ChecklistStatus>(
    ChecklistStatus.LOADING,
  );
  const [verifiedEmailChecklistStatus, setVerifiedEmailChecklistStatus] = useState<ChecklistStatus>(
    ChecklistStatus.LOADING,
  );
  const [verifiedPhoneChecklistStatus, setVerifiedPhoneChecklistStatus] = useState<ChecklistStatus>(
    ChecklistStatus.LOADING,
  );
  const [backupCodesChecklistStatus, setBackupCodesChecklistStatus] = useState<ChecklistStatus>(
    ChecklistStatus.INCOMPLETE,
  );
  const [enrollmentButtonChecklistStatus, setEnrollmentButtonChecklistStatus] =
    useState<EnrollmentStatus>(EnrollmentStatus.DISABLED);

  /**
   * Effects.
   */

  // Fetch recovery codes status when the v2 flag is enabled so we can derive the backup codes
  // checklist state. This is intentionally separate from the seeding effect below.
  useEffect(() => {
    if (!isEppRecoveryCodesEnabled) {
      return;
    }
    const fetchRecoveryCodesStatus = async () => {
      const result = await requestService.twoStepVerification.getRecoveryCodesStatus(
        authenticatedUser.id!.toString(),
      );
      if (!result.isError) {
        dispatch({
          type: SecurityTabActionType.SET_RECOVERY_CODE_STATUS,
          recoveryCodeStatus: result.value,
        });
      }
    };
    fetchRecoveryCodesStatus().catch(() => {
      // Silently fail -- backup codes row will stay INCOMPLETE.
    });
  }, [isEppRecoveryCodesEnabled, requestService, dispatch]);

  // Seed component-local state with the eagerly-loaded values from the context provider. We opt
  // for this because we want to independently re-render just this view without triggering re-renders
  // of the parent components. Note this needs to be an effect because the context provider may race
  // with the rendering of the component if the user clicks fast enough.
  useEffect(() => {
    if (mySettingsInfo !== null) {
      const verifiedAndAvailable = mySettingsInfo?.IsEmailVerified && mySettingsInfo?.IsEmailOnFile;
      const maybeComplete = (verifiedAndAvailable && ChecklistStatus.COMPLETE) || null;
      const maybePending = (mySettingsInfo?.IsEmailOnFile && ChecklistStatus.PENDING) || null;
      const finalStatusElseIncomplete = maybeComplete || maybePending || ChecklistStatus.INCOMPLETE;
      setVerifiedEmailChecklistStatus(finalStatusElseIncomplete);
    }
    if (phoneConfiguration !== null) {
      // While we would like to have the same intermediate steps as email with pending states above,
      // the legacy phone endpoints does not have the concept of verification "sessions", like
      // recovery. So we settle for atomic setting only, with a slightly confusing pending state
      // if a user exits the flow pre-emptively.
      const phoneVerified = phoneConfiguration?.isVerified;
      setVerifiedPhoneChecklistStatus(
        phoneVerified ? ChecklistStatus.COMPLETE : ChecklistStatus.INCOMPLETE,
      );
    }
    if (credentialsList !== null) {
      const passkeyVerified = (credentialsList?.credentials?.length || 0) > 0;
      setPasskeyChecklistStatus(
        passkeyVerified ? ChecklistStatus.COMPLETE : ChecklistStatus.INCOMPLETE,
      );
    }

    const getEnrollmentButtonState = (): EnrollmentStatus => {
      const requiredComplete = [passkeyChecklistStatus, verifiedEmailChecklistStatus].every(
        status => status === ChecklistStatus.COMPLETE,
      );

      // When v2 is enabled, the user must complete passkey + email + (phone OR backup codes).
      // Otherwise, the original v1 logic requires passkey + email + phone.
      const choiceComplete = isEppRecoveryCodesEnabled
        ? verifiedPhoneChecklistStatus === ChecklistStatus.COMPLETE ||
          backupCodesChecklistStatus === ChecklistStatus.COMPLETE
        : verifiedPhoneChecklistStatus === ChecklistStatus.COMPLETE;

      const checklistCompleted = requiredComplete && choiceComplete;

      // The case where EPP is enrolled but the checklist is incomplete should never happen; we should
      // emit an event and check if backend events agree here.
      if (userSettings?.eppEnrollmentStatus === EppEnrollmentStatus.KEY_PLAN_ENROLLED) {
        return EnrollmentStatus.ENABLED_TO_UNENROLL;
      }

      if (checklistCompleted) {
        return EnrollmentStatus.ENABLED_TO_ENROLL;
      }

      return EnrollmentStatus.DISABLED;
    };
    setEnrollmentButtonChecklistStatus(getEnrollmentButtonState());
  }, [
    mySettingsInfo,
    phoneConfiguration,
    credentialsList,
    isEppRecoveryCodesEnabled,
    passkeyChecklistStatus,
    verifiedEmailChecklistStatus,
    verifiedPhoneChecklistStatus,
    backupCodesChecklistStatus,
    userSettings?.eppEnrollmentStatus,
  ]);

  // Derive backup codes checklist status separately to avoid re-triggering the seeding effect
  // above when recoveryCodeStatus changes reference (which would override enrollment state).
  useEffect(() => {
    if (isEppRecoveryCodesEnabled && recoveryCodeStatus) {
      setBackupCodesChecklistStatus(
        recoveryCodeStatus.activeCount > 0 ? ChecklistStatus.COMPLETE : ChecklistStatus.INCOMPLETE,
      );
    }
  }, [isEppRecoveryCodesEnabled, recoveryCodeStatus]);

  bindEmailVerificationRefreshHack({
    verifiedEmailChecklistStatus,
    refetchSettings,
  });

  // Fire modal shown events when modals open
  useEffect(() => {
    if (emailModalOpen) {
      eventService.sendEppEmailModalShownEvent();
    }
  }, [emailModalOpen, eventService]);

  useEffect(() => {
    if (phoneModalOpen) {
      eventService.sendEppPhoneModalShownEvent();
    }
  }, [phoneModalOpen, eventService]);

  /**
   * Button handlers
   */

  const onEmailSubmit = async ({ value, innerErrorTextSetter, closeModal }: EmailSubmitPayload) => {
    const updateEmailResult =
      await requestService.email.updateForCurrentUserWithVerification(value);
    if (updateEmailResult.isError) {
      innerErrorTextSetter(
        mapEmailErrorToResource(resources, updateEmailResult.error ?? EmailError.UNKNOWN),
      );
      return;
    }

    const spreadNullableToo = mySettingsInfo ?? ({} as unknown as GetMySettingsInfoReturnType);
    // Force a re-render by refreshing the context.
    dispatch({
      type: SecurityTabActionType.INITIALIZE_MY_SETTINGS_INFO,
      mySettingsInfo: {
        ...spreadNullableToo,
        UserEmail: "",
        IsEmailOnFile: true,
        IsEmailVerified: false,
      },
    });

    // Only close the modal if it was successful.
    closeModal();
  };

  const onPhoneSubmit = async ({
    value,
    innerErrorTextSetter,
    phoneModalStateSetter,
  }: PhoneSubmitPayload) => {
    const phoneUpdateResult = await requestService.phone.updatePhone(value);
    if (phoneUpdateResult.isError) {
      innerErrorTextSetter(
        mapPhoneErrorToResource(resources, phoneUpdateResult.error ?? UpdatePhoneError.UNKNOWN),
      );
      return;
    }

    phoneModalStateSetter("verification");
  };

  const onResendCode = async ({ innerErrorTextSetter }: ResendCodePayload) => {
    const resendCodeResult = await requestService.phone.resendCode({});
    if (resendCodeResult.isError) {
      innerErrorTextSetter(
        mapResendCodeErrorToResource(resources, resendCodeResult.error ?? ResendCodeError.UNKNOWN),
      );
    }
  };

  const onPhoneVerificationSubmit = async ({
    verifyCodeParams,
    innerErrorTextSetter,
    closeModal,
  }: PhoneVerificationPayload) => {
    const phoneVerificationResult = await requestService.phone.verifyCode(verifyCodeParams);
    if (phoneVerificationResult.isError) {
      innerErrorTextSetter(
        mapPhoneVerificationErrorToResource(
          resources,
          phoneVerificationResult.error ?? VerifyCodeError.UNKNOWN,
        ),
      );
      return;
    }

    // The rest of settings are unrelated but given phone is the last checklist item we
    // opportunistically refetch settings here as well.
    await refetchSettings();
    await refetchPhoneConfiguration();

    closeModal();
  };

  const onEppEnrollmentButtonClick = async () => {
    switch (enrollmentButtonChecklistStatus) {
      case EnrollmentStatus.ENABLED_TO_ENROLL: {
        eventService.sendEppEnrollClickEvent();
        setRequestInFlight(true);

        // TODO: This frontend call is skippable by malware
        // We will also enforce via auth-api: on ticket redemption, check if user is EPP enrolled,
        // and if so, invalidate all tickets + block the revert
        const invalidateTicketsResult =
          await requestService.authApi.invalidateTicketsForEppEnrollment();
        if (invalidateTicketsResult.isError) {
          systemFeedbackService.warning(resources.MessageUnknownError);
          setRequestInFlight(false);
          return;
        }

        const enrollResult = await requestService.userSettingsApi.changeEppStatus(
          EppEnrollmentStatus.KEY_PLAN_ENROLLED,
          twoStepVerificationMetadata?.isEppUIEnabled,
        );

        if (enrollResult.isError) {
          systemFeedbackService.warning(resources.MessageUnknownError);
          setRequestInFlight(false);
          return;
        }

        // Refetch settings to ensure state is synced with server
        const getUserSettingsResult = await requestService.userSettingsApi.userSettings();
        if (!getUserSettingsResult.isError) {
          dispatch({
            type: SecurityTabActionType.INITIALIZE_USER_SETTINGS,
            userSettings: getUserSettingsResult.value,
          });
        }

        setEnrollmentButtonChecklistStatus(EnrollmentStatus.ENABLED_TO_UNENROLL);
        setRequestInFlight(false);
        break;
      }
      case EnrollmentStatus.ENABLED_TO_UNENROLL:
        eventService.sendEppUnenrollClickEvent();
        setWarningModalOpen(true);
        break;
      default:
        break;
    }
  };

  const onUnenrollConfirm = async () => {
    eventService.sendEppUnenrollConfirmClickEvent();
    setWarningModalOpen(false);
    setRequestInFlight(true);

    const unenrollResult = await requestService.userSettingsApi.changeEppStatus(
      EppEnrollmentStatus.UNENROLLED,
      twoStepVerificationMetadata?.isEppUIEnabled,
    );

    if (unenrollResult.isError) {
      systemFeedbackService.warning(resources.MessageUnknownError);
      setRequestInFlight(false);
      return;
    }

    // Refetch settings to ensure state is synced with server
    const getUserSettingsResult = await requestService.userSettingsApi.userSettings();
    if (!getUserSettingsResult.isError) {
      dispatch({
        type: SecurityTabActionType.INITIALIZE_USER_SETTINGS,
        userSettings: getUserSettingsResult.value,
      });
    }

    setEnrollmentButtonChecklistStatus(EnrollmentStatus.ENABLED_TO_ENROLL);
    setRequestInFlight(false);
  };

  const onClearRecoveryCodesConfirm = async () => {
    setClearCodesWarningOpen(false);
    const result = await requestService.twoStepVerification.clearRecoveryCodes(
      authenticatedUser.id!.toString(),
    );
    if (!result.isError) {
      dispatch({
        type: SecurityTabActionType.SET_RECOVERY_CODE_STATUS,
        recoveryCodeStatus: { activeCount: 0, created: null },
      });
    }
  };

  const mapTranslatedErrorText = (statusCode: number) =>
    mapPhoneErrorToResource(resources, statusCode);

  const renderFido2CredentialRegistration = () =>
    Fido2CredentialRegistrationService.renderFido2CredentialRegistration({
      containerId: "fido2-epp-container",
      credentialPurpose: CredentialPurpose.Login,
      registeredKeys: credentialsList?.credentials ?? [],
      fido2Supported: isPasskeySupported ?? false,
      deleteAllPasskeysAllowed: mySettingsInfo?.HasValidPasswordSet,
      registrationSource: AUTH_EVENT_CONSTANTS.state.passkeyCreation.enhancedProtectionProgram,
      onCreationSuccess: async () => {
        await refetchCredentials();
        eventService.sendPasskeyCreationSourceEvent(
          AUTH_EVENT_CONSTANTS.state.passkeyCreation.enhancedProtectionProgram,
        );
        systemFeedbackService.success(resources.Response.PasskeyCreatedSuccessfully);
      },
      onDeleteSuccess: async () => {
        await refetchCredentials();
        systemFeedbackService.success(resources.Response.PasskeyRemovedSuccessfully);
      },
      onRenameSuccess: async () => {
        await refetchCredentials();
        systemFeedbackService.success(resources.Response.PasskeyRenamedSuccessfully);
      },
      onDuplicateCreated: () => {
        systemFeedbackService.warning(resources.Response.PasskeyAlreadyCreated);
      },
    });

  return (
    <div className="section enhanced-protection-program-details">
      <div>
        <h2>{resources.Heading.Security}</h2>
      </div>
      <div className="flex items-center gap-x-small">
        <IconButton
          icon="icon-filled-chevron-large-left"
          ariaLabel="back-button"
          variant="Utility"
          size="Large"
          onClick={() => {
            const isEnrolled =
              userSettings?.eppEnrollmentStatus === EppEnrollmentStatus.KEY_PLAN_ENROLLED;
            eventService.sendEppBackClickEvent(isEnrolled);
            onBackClick();
          }}
          // Override the size because the hover is too large by default (and there's no medium
          // icon).
          className="flex flex-col justify-center size-800"
        />
        <h3 className="flex flex-col justify-center font-header-2">
          {resources.Heading.EnhancedProtectionProgram}
        </h3>
      </div>
      <div className="text-body-large padding-y-small margin-bottom-small">
        {resources.Description.CardEnhancedProtectionProgramDetails}
      </div>

      {/* NOTE: that if we ever swap the design so the overall card is clickable we will need to swap
        this to padding instead, as the hover will not cover gaps. Also the padding will need to
        live in the child and this parent class will need to be removed. */}
      <div className="flex flex-col gap-y-large">
        {isEppRecoveryCodesEnabled ? (
          <div className="text-body-large font-bold" data-testid="epp-section-header-required">
            {resources.Label.AddBothOfThese}
          </div>
        ) : (
          <div className="rbx-divider" />
        )}
        <EppChecklistItem
          titleText={resources.Label.HavePasskeys}
          bodyText={passKeyTextMap[passkeyChecklistStatus]}
          defaultLoadingText={resources.Label.Loading}
          buttonText={passKeyButtonTextMap[passkeyChecklistStatus]}
          checklistStatus={passkeyChecklistStatus}
          onClick={() => {
            const isManage = passkeyChecklistStatus === ChecklistStatus.COMPLETE;
            eventService.sendEppPasskeyClickEvent(isManage);
            renderFido2CredentialRegistration();
          }}
          dataTestId="passkey-update-button"
        />
        <div className="rbx-divider" />
        <EppChecklistItem
          titleText={resources.Label.HaveVerifiedEmail}
          bodyText={verifiedEmailTextMap[verifiedEmailChecklistStatus]}
          defaultLoadingText={resources.Label.Loading}
          buttonText={verifiedEmailButtonTextMap[verifiedEmailChecklistStatus]}
          checklistStatus={verifiedEmailChecklistStatus}
          onClick={() => {
            const isEdit = verifiedEmailChecklistStatus !== ChecklistStatus.INCOMPLETE;
            eventService.sendEppEmailClickEvent(isEdit);
            setEmailModalOpen(true);
          }}
          dataTestId="email-update-button"
        />
        <div className="rbx-divider" />
        {isEppRecoveryCodesEnabled && (
          <div className="text-body-large font-bold" data-testid="epp-section-header-choice">
            {resources.Label.ChooseOneOfThese}
          </div>
        )}
        <EppChecklistItem
          titleText={resources.Label.HaveVerifiedPhone}
          bodyText={verifiedPhoneTextMap[verifiedPhoneChecklistStatus]}
          defaultLoadingText={resources.Label.Loading}
          buttonText={verifiedPhoneButtonTextMap[verifiedPhoneChecklistStatus]}
          checklistStatus={verifiedPhoneChecklistStatus}
          onClick={() => {
            const isEdit = verifiedPhoneChecklistStatus === ChecklistStatus.COMPLETE;
            eventService.sendEppPhoneClickEvent(isEdit);
            setPhoneModalOpen(true);
          }}
          dataTestId="phone-update-button"
        />
        {isEppRecoveryCodesEnabled && (
          <React.Fragment>
            <div className="rbx-divider" />
            <EppChecklistItem
              titleText={resources.Label.BackupCodes}
              bodyText={backupCodesBodyText}
              defaultLoadingText={resources.Label.Loading}
              buttonText={backupCodesButtonTextMap[backupCodesChecklistStatus]}
              checklistStatus={backupCodesChecklistStatus}
              onClick={() => {
                const isCreateAgain = backupCodesChecklistStatus === ChecklistStatus.COMPLETE;
                eventService.sendEppBackupCodesClickEvent(isCreateAgain);
                dispatch({
                  type: SecurityTabActionType.SET_MODAL_STATE,
                  modalState: ModalState.RECOVERY_CODES_GENERATE,
                  additionalModalProps: null,
                });
              }}
              secondaryAction={
                backupCodesChecklistStatus === ChecklistStatus.COMPLETE
                  ? {
                      text: resources.Action.Delete,
                      variant: "Alert",
                      onClick: () => setClearCodesWarningOpen(true),
                      dataTestId: "backup-codes-delete-button",
                    }
                  : undefined
              }
              dataTestId="backup-codes-button"
            />
          </React.Fragment>
        )}
        <div className="rbx-divider" />
        {/* Separately rendered as its sufficiently different... */}
        <ListItem
          divider="None"
          trailing={
            <Button
              size="Large"
              variant={
                // If we need more states we can make this a utility function later.
                enrollmentButtonChecklistStatus === EnrollmentStatus.ENABLED_TO_ENROLL
                  ? "Emphasis"
                  : "Alert"
              }
              isDisabled={enrollmentButtonChecklistStatus === EnrollmentStatus.DISABLED}
              isLoading={requestInFlight}
              onClick={onEppEnrollmentButtonClick}
              data-testid="epp-enrollment-button"
            >
              {enrollmentButtonTextMap[enrollmentButtonChecklistStatus]}
            </Button>
          }
          isContained
          // Button should be on the right side.
          className="flex-row-reverse"
        />
      </div>
      <EnhancedProtectionDisableWarning
        open={warningModalOpen}
        setOpen={setWarningModalOpen}
        // Technically not an action... but re-using strings is good.
        modalTitleText={resources.Action.TurnOffEnhancedProtectionProgram}
        modalBodyText={resources.Description.TurnOffEnhancedProtectionProgram}
        modalCancelButtonText={resources.Label.Cancel}
        modalTurnOffButtonText={resources.Action.TurnOff}
        onConfirm={onUnenrollConfirm}
        onCancel={() => eventService.sendEppUnenrollCancelClickEvent()}
      />
      {isEppRecoveryCodesEnabled && (
        <EnhancedProtectionDisableWarning
          open={clearCodesWarningOpen}
          setOpen={setClearCodesWarningOpen}
          modalTitleText={resources.Heading.ClearRecoveryCodes}
          modalBodyText={resources.Description.ClearRecoveryCodesWarning}
          modalCancelButtonText={resources.Label.Cancel}
          modalTurnOffButtonText={resources.Action.Delete}
          onConfirm={() => {
            onClearRecoveryCodesConfirm().catch(() => {
              setClearCodesWarningOpen(false);
            });
          }}
        />
      )}
      {emailModalOpen && (
        <EmailUpdateModal
          open={emailModalOpen}
          setOpen={setEmailModalOpen}
          titleText={resources.Action.Dialog.EditEmail}
          bodyText={resources.Description.Dialog.ChangeEmailWarning}
          buttonText={resources.Action.Dialog.EditEmail}
          placeholderText={resources.Label.EnterEmail}
          errorText={resources.Message.Error.InvalidEmail}
          onEmailSubmit={onEmailSubmit}
          data-testid="email-update-modal"
        />
      )}
      {phoneModalOpen && (
        <PhoneUpdateModal
          open={phoneModalOpen}
          setOpen={setPhoneModalOpen}
          titleText={resources.Action.Dialog.EditPhone}
          bodyText={resources.Description.Dialog.SmsInstructions}
          onPhoneSubmit={onPhoneSubmit}
          onPhoneVerificationSubmit={onPhoneVerificationSubmit}
          onResendCode={onResendCode}
          getPhonePrefixListImplementation={requestService.phone.getPhonePrefixList}
          footerText={resources.Description.Dialog.ShortCodeLegalDisclaimer}
          buttonText={resources.Action.Dialog.Continue}
          placeholderText={resources.Action.Dialog.EnterPhoneNumber}
          validationErrorText={resources.Response.Dialog.InvalidPhoneNumber}
          translatedRequestErrorText={mapTranslatedErrorText}
          verificationTitleText={resources.Action.Dialog.VerifyCode}
          verificationBodyText={resources.Action.Dialog.EnterSentCode}
          verificationPlaceholderText={resources.Action.Dialog.SixDigitCode}
          verificationResendButtonTextContainer={[
            resources.Action.Dialog.ResendCode,
            resources.Action.Dialog.ResendCodeWithTimer,
          ]}
          verificationLabelText={resources.Action.Dialog.VerifyCode}
          data-testid="phone-update-modal"
        />
      )}
      <div id="fido2-epp-container" data-testid="fido2-epp-container" />
    </div>
  );
};

export default EnhancedProtectionProgramDetails;
