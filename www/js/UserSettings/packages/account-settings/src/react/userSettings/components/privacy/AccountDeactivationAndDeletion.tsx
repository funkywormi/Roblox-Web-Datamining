import React, { useEffect } from "react";
import { useTranslation } from "react-utilities";
import { Button } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { DeviceMeta, Hybrid } from "Roblox";
import { ChallengeAbandonedError, useSnackbar } from "@rbx/user-settings";
import InlineUserInput from "../../../common/components/InlineUserInput";
import { useDeactivateUserMutation } from "../../../apis/accountDeletionApi";
import useSettingsModal, {
  useSettingsInfoModal,
} from "../../../common/hooks/modals/useSettingsModal";
import {
  exerciseDataRightPagePath,
  rightToAccessHelpPageUrl,
  supportFormPath,
} from "../../constants/urlConstants";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import SettingsSection from "../../../common/components/SettingsSection";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import reloadUtils from "../../utils/reloadUtils";
import { useForgetUserMutation, useRequestUserDataMutation } from "../../../apis/privacyApi";
import { useGetEmailsQuery } from "../../../apis/accountSettingsApi";
import privacyEventService from "../../services/eventServices/privacyEventService";
import logoutService from "../../services/logoutService";
import EmailSetting from "../accountInfo/EmailSetting";
import { useGetAccountInfoQuery } from "../../../apis/legacyAccountSettingsApi";

type AccountActionSectionProps = {
  label: string;
  inputId: string;
  buttonText: string;
  description: React.ReactNode;
  onButtonClick: () => void;
  showDivider?: boolean;
  isDisabled?: boolean;
};

function AccountActionSection({
  label,
  inputId,
  buttonText,
  description,
  onButtonClick,
  showDivider = false,
  isDisabled = false,
}: AccountActionSectionProps): JSX.Element {
  return (
    <SettingsSection>
      <React.Fragment>
        {showDivider && <div className="rbx-divider" />}
        <InlineUserInput label={label} inputId={inputId}>
          <Button
            size={Button.sizes.small}
            variant={Button.variants.alert}
            width={Button.widths.default}
            onClick={onButtonClick}
            isDisabled={isDisabled}
          >
            {buttonText}
          </Button>
        </InlineUserInput>
        <div className="small text">{description}</div>
      </React.Fragment>
    </SettingsSection>
  );
}

function AccountDeactivationAndDeletion(): JSX.Element {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const [deactivateUser] = useDeactivateUserMutation();
  const [errorModal, errorModalService] = useSettingsInfoModal(
    commonTranslationConstants.modal.error.title,
    commonTranslationConstants.modal.error.body,
  );
  const [privacyRequestOngoingModal, privacyRequestOngoingModalService] = useSettingsModal({
    titleResourceId: privacyTranslationConstants.privacyRequestOngoingHeading,
    bodyResourceId: privacyTranslationConstants.privacyRequestOngoingBody,
    size: "sm",
    actionButtonTextResourceId: commonTranslationConstants.ok,
  });

  const handlePrivacyRequestError = (error: unknown): void => {
    if (error === ChallengeAbandonedError) {
      return;
    }

    const typedError = error as { status: number };
    if (typedError.status === 409) {
      privacyRequestOngoingModalService.open();
    } else {
      errorModalService.open();
    }
  };

  const updateDeactivationStatusHandler = async (): Promise<void> => {
    try {
      await deactivateUser().unwrap();
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
      // Provide a short delay for the deactivation to apply.
      await new Promise(resolve => setTimeout(resolve, 2000));
      const deviceMeta = DeviceMeta();
      if (deviceMeta?.isInApp && Hybrid?.Overlay) {
        Hybrid.Overlay.close(() => undefined);
      } else {
        reloadUtils.reloadPage();
      }
    } catch (error) {
      if (error === ChallengeAbandonedError) {
        return;
      }

      const typedError = error as { status: number };
      if (typedError.status === 429) {
        snackbarService.warning(translate(commonTranslationConstants.rateLimitedError));
      } else {
        snackbarService.warning(translate(commonTranslationConstants.unknownError));
      }
    }
  };

  const deactivationModalBody = (
    <span
      dangerouslySetInnerHTML={{
        __html: translate(privacyTranslationConstants.deactivateConfirmationBody, {
          lineBreak: "<br>",
        }),
      }}
    />
  );

  const [confirmDeactivationModal, confirmDeactivationModalService] = useSettingsModal({
    titleResourceId: privacyTranslationConstants.deactivateConfirmationHeading,
    translatedBody: deactivationModalBody,
    size: "sm",
    actionButtonTextResourceId: privacyTranslationConstants.deactivateBtnText,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    onAction: updateDeactivationStatusHandler,
  });

  const getDeletionDescription = () => {
    return uiPolicy?.displayAccountDeactivation
      ? translate(privacyTranslationConstants.deleteDescription)
      : translate(privacyTranslationConstants.exerciseDataRightsDescription) +
          translate(privacyTranslationConstants.privacyRightsRequest, {
            linkStart: `<a class="text-link" target="_blank" rel="noreferrer" href=${supportFormPath}>`,
            linkEnd: "</a>",
          });
  };

  const deleteMyAccountReceivedModalBody = (
    <span
      dangerouslySetInnerHTML={{
        __html: translate(privacyTranslationConstants.deleteMyAccountReceivedBody, {
          openHelpTag: `<a class="text-link" target="_blank" rel="noreferrer" href=${exerciseDataRightPagePath}>`,
          closeHelpTag: "</a>",
        }),
      }}
    />
  );

  const [deleteMyAccountReceivedModal, deleteMyAccountReceivedModalService] = useSettingsModal({
    titleResourceId: privacyTranslationConstants.deleteMyAccountReceivedHeading,
    translatedBody: deleteMyAccountReceivedModalBody,
    size: "sm",
    actionButtonTextResourceId: commonTranslationConstants.ok,
    neutralButtonTextResourceId: undefined,
    onAction: () => {
      deleteMyAccountReceivedModalService.close();
      logoutService.logout();
    },
  });

  const [requestUserDataMutation] = useRequestUserDataMutation();
  const [requestAccountDataReceivedModal, requestAccountDataReceivedModalService] =
    useSettingsModal({
      titleResourceId: privacyTranslationConstants.requestAccountDataReceivedHeading,
      translatedBody: translate(privacyTranslationConstants.requestAccountDataReceivedBody),
      size: "sm",
      actionButtonTextResourceId: commonTranslationConstants.ok,
      neutralButtonTextResourceId: undefined,
      onAction: () => {
        requestAccountDataReceivedModalService.close();
      },
    });

  const { data: emails, isLoading: emailsIsLoading } = useGetEmailsQuery();
  const verifiedEmail = emails?.verifiedEmail ?? "";
  const [requestAccountDataConfirmationModal, requestAccountDataConfirmationModalService] =
    useSettingsModal({
      titleResourceId: privacyTranslationConstants.requestAccountDataConfirmationHeading,
      translatedBody: (
        <span
          dangerouslySetInnerHTML={{
            __html: translate(privacyTranslationConstants.requestAccountDataConfirmationBody, {
              recipientEmail: verifiedEmail,
              openDetailsTag: `<a class="text-link" target="_blank" rel="noreferrer" href=${rightToAccessHelpPageUrl}>`,
              closeDetailsTag: "</a>",
            }),
          }}
        />
      ),
      size: "sm",
      actionButtonTextResourceId: privacyTranslationConstants.requestAccountDataBtnText,
      neutralButtonTextResourceId: commonTranslationConstants.cancel,
      onAction: async () => {
        privacyEventService.authButtonClickSettingsRequestAccountDataConfirm();
        try {
          await requestUserDataMutation({ userId: authenticatedUser.id! }).unwrap();
          privacyEventService.authButtonClickSettingsRequestAccountDataConfirmSuccess();
          requestAccountDataConfirmationModalService.close();
          requestAccountDataReceivedModalService.open();
        } catch (error) {
          handlePrivacyRequestError(error);
        }
      },
    });

  const [forgetUserMutation] = useForgetUserMutation();
  const [deleteMyAccountConfirmationModal, deleteMyAccountConfirmationModalService] =
    useSettingsModal({
      titleResourceId: privacyTranslationConstants.deleteMyAccountConfirmationHeading,
      translatedBody: translate(privacyTranslationConstants.deleteMyAccountConfirmationBody),
      size: "sm",
      actionButtonTextResourceId: privacyTranslationConstants.deleteAccountBtnText,
      neutralButtonTextResourceId: commonTranslationConstants.cancel,
      onAction: async () => {
        privacyEventService.authButtonClickSettingsDeleteMyAccountConfirm();
        try {
          await forgetUserMutation({ userId: authenticatedUser.id! }).unwrap();

          privacyEventService.authButtonClickSettingsDeleteMyAccountConfirmSuccess();
          deleteMyAccountConfirmationModalService.close();
          deleteMyAccountReceivedModalService.open();
        } catch (error) {
          handlePrivacyRequestError(error);
        }
      },
    });

  const [confirmDeletionModal, confirmDeletionModalService] = useSettingsModal({
    titleResourceId: privacyTranslationConstants.exerciseDataRightsField,
    translatedBody: getDeletionDescription(),
    size: "sm",
    actionButtonTextResourceId: privacyTranslationConstants.initiateBtnText,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    onAction: () => {
      window.location.pathname = exerciseDataRightPagePath;
    },
  });

  const { data: accountInfo, isLoading: accountInfoIsLoading } = useGetAccountInfoQuery();

  const isLoading = emailsIsLoading || accountInfoIsLoading;
  const showSelfServeUi = !isLoading && accountInfo?.UserAbove13;
  const showSelfServeEmailSection =
    showSelfServeUi &&
    uiPolicy?.displayEmailAddress &&
    (uiPolicy?.selfServeDataAccessEnabled || uiPolicy?.selfServeAccountDeletionEnabled);
  const showSelfServeRequestAccountData = showSelfServeUi && uiPolicy?.selfServeDataAccessEnabled;
  const showSelfServeDeleteAccount = showSelfServeUi && uiPolicy?.selfServeAccountDeletionEnabled;

  useEffect(() => {
    if (showSelfServeRequestAccountData) {
      privacyEventService.authPageloadSettingsSelfServeRequestAccountData();
    }
  }, [showSelfServeRequestAccountData]);

  useEffect(() => {
    if (showSelfServeDeleteAccount) {
      privacyEventService.authPageloadSettingsSelfServeDeleteAccount();
    }
  }, [showSelfServeDeleteAccount]);

  // deleteMyAccount triggers the new account deletion flow.
  // It is only shown to users with a verified email.
  return (
    <React.Fragment>
      <SettingsSection>
        <div>
          {showSelfServeEmailSection && (
            <React.Fragment>
              <EmailSetting />
              <div className="small text privacy-requests-disclaimer">
                {verifiedEmail
                  ? translate(privacyTranslationConstants.privacyRequestsDescription)
                  : translate(privacyTranslationConstants.privacyRequestsDescriptionAddYourEmail)}
              </div>
            </React.Fragment>
          )}
          {showSelfServeRequestAccountData && (
            <AccountActionSection
              label={translate(privacyTranslationConstants.requestAccountDataHeading)}
              inputId="btn-request-account-data"
              buttonText={translate(privacyTranslationConstants.requestAccountDataBtnText)}
              description={translate(privacyTranslationConstants.requestAccountDataBody)}
              onButtonClick={() => {
                privacyEventService.authButtonClickSettingsRequestAccountData();
                requestAccountDataConfirmationModalService.open();
              }}
              showDivider
              isDisabled={!verifiedEmail}
            />
          )}
          {showSelfServeDeleteAccount ? (
            <AccountActionSection
              label={translate(privacyTranslationConstants.deleteMyAccountHeading)}
              inputId="btn-account-deletion"
              buttonText={translate(privacyTranslationConstants.deleteAccountBtnText)}
              description={translate(privacyTranslationConstants.deleteMyAccountBody)}
              onButtonClick={() => {
                privacyEventService.authButtonClickSettingsDeleteMyAccount();
                deleteMyAccountConfirmationModalService.open();
              }}
              showDivider
              isDisabled={!verifiedEmail}
            />
          ) : uiPolicy?.displayAccountDeletion ? (
            <AccountActionSection
              label={translate(privacyTranslationConstants.exerciseDataRightsField)}
              inputId="btn-account-deletion"
              buttonText={translate(privacyTranslationConstants.initiateBtnText)}
              description={getDeletionDescription()}
              onButtonClick={() => {
                confirmDeletionModalService.open();
              }}
              showDivider
            />
          ) : null}
          {uiPolicy?.displayAccountDeactivation && (
            <AccountActionSection
              label={translate(privacyTranslationConstants.deactivateField)}
              inputId="btn-account-deactivation"
              buttonText={translate(privacyTranslationConstants.deactivateBtnText)}
              description={translate(privacyTranslationConstants.deactivateDescription)}
              onButtonClick={() => {
                privacyEventService.authButtonClickSettingsAccountDeactivate();
                confirmDeactivationModalService.open();
              }}
              showDivider
            />
          )}
        </div>
      </SettingsSection>
      {requestAccountDataConfirmationModal}
      {requestAccountDataReceivedModal}
      {confirmDeactivationModal}
      {confirmDeletionModal}
      {deleteMyAccountConfirmationModal}
      {deleteMyAccountReceivedModal}
      {errorModal}
      {privacyRequestOngoingModal}
    </React.Fragment>
  );
}

export default AccountDeactivationAndDeletion;
