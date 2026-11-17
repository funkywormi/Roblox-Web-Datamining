import React, { useEffect } from "react";
import { useTranslation } from "react-utilities";
import { Button } from "@rbx/foundation-ui";
import { ChallengeAbandonedError } from "@rbx/user-settings";
import type { TChildInfo } from "../../../../../types/childrenInfoTypes";
import { useGetEmailsQuery } from "../../../../apis/accountSettingsApi";
import { useForgetUserMutation, useRequestUserDataMutation } from "../../../../apis/privacyApi";
import { parentalControlsApi } from "../../../../apis/parentalControlsApi";
import { useAppDispatch } from "../../../../redux/hooks";
import SettingsSection from "../../../../common/components/SettingsSection";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";
import type { ChildPrivacyRequestAction } from "../../../constants/eventConstants";
import { accountDeletionHelpPageUrl } from "../../../constants/urlConstants";
import ChildPrivacyRequestActionSection from "./ChildPrivacyRequestActionSection";
import useChildPrivacyRequestModal from "./useChildPrivacyRequestModal";

const getChildAccountLabel = (child: TChildInfo): string =>
  `${child.displayName} (@${child.userName})`;

export const ChildPrivacyRequests = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    data: emails,
    isLoading: emailsIsLoading,
    isFetching: emailsIsFetching,
    isError: emailsIsError,
    refetch: refetchEmails,
  } = useGetEmailsQuery();
  const [requestUserData, { isLoading: requestDataIsSubmitting }] = useRequestUserDataMutation();
  const [forgetUser, { isLoading: deleteAccountIsSubmitting }] = useForgetUserMutation();

  const translations = parentalControlsTranslationConstants.privacyRequests;
  const childAccount = getChildAccountLabel(child);
  const childUsername = `@${child.userName}`;
  const translatedCloseLabel = translate(commonTranslationConstants.modal.closeBtn);
  const verifiedEmail = emails?.verifiedEmail ?? "";
  const emailStatusId = `child-privacy-request-email-status-${child.userId}`;
  const emailRequestPending = emailsIsLoading || emailsIsFetching;
  const submissionPending = requestDataIsSubmitting || deleteAccountIsSubmitting;
  const actionDisabled =
    emailRequestPending || emailsIsError || !verifiedEmail || submissionPending;
  let emailStatus = translate(translations.descriptionAddYourEmail, { childAccount });
  if (submissionPending || emailRequestPending) {
    emailStatus = translate(commonTranslationConstants.loading);
  } else if (emailsIsError) {
    emailStatus = translate(commonTranslationConstants.modal.error.body);
  } else if (verifiedEmail) {
    emailStatus = translate(translations.description, {
      childAccount,
      recipientEmail: verifiedEmail,
    });
  }

  const [errorModal, errorModalService] = useChildPrivacyRequestModal({
    translatedTitle: translate(commonTranslationConstants.modal.error.title),
    translatedBody: translate(commonTranslationConstants.modal.error.body),
    translatedActionButtonText: translate(commonTranslationConstants.modal.submitButtonText),
    translatedCloseLabel,
  });
  const [ongoingRequestModal, ongoingRequestModalService] = useChildPrivacyRequestModal({
    translatedTitle: translate(translations.ongoing.heading, { childAccount }),
    translatedBody: translate(translations.ongoing.body, { childAccount }),
    translatedActionButtonText: translate(commonTranslationConstants.ok),
    translatedCloseLabel,
  });

  const handlePrivacyRequestError = (error: unknown, action: ChildPrivacyRequestAction): void => {
    if (error === ChallengeAbandonedError) {
      return;
    }

    const isConflict = (error as { status?: number }).status === 409;
    parentalControlsEventService.authMsgShownSettingsPControlsPrivacyRequestError(
      child,
      action,
      isConflict ? "conflict" : "unknown",
    );
    if (isConflict) {
      ongoingRequestModalService.open();
    } else {
      errorModalService.open();
    }
  };

  const [requestDataReceivedModal, requestDataReceivedModalService] = useChildPrivacyRequestModal({
    translatedTitle: translate(translations.requestData.receivedHeading),
    translatedBody: translate(translations.requestData.receivedBody, {
      childAccount,
      recipientEmail: verifiedEmail,
    }),
    translatedActionButtonText: translate(commonTranslationConstants.ok),
    translatedCloseLabel,
  });
  const [requestDataConfirmationModal, requestDataConfirmationModalService] =
    useChildPrivacyRequestModal({
      translatedTitle: translate(translations.requestData.confirmationHeading, { childAccount }),
      translatedBody: translate(translations.requestData.confirmationBody, {
        childAccount,
        recipientEmail: verifiedEmail,
      }),
      translatedActionButtonText: translate(translations.requestData.action),
      translatedSecondaryButtonText: translate(commonTranslationConstants.cancel),
      translatedCloseLabel,
      disableActionButton: requestDataIsSubmitting,
      disableSecondaryButton: requestDataIsSubmitting,
      shouldCloseModalOnActionButton: false,
      onAction: async () => {
        parentalControlsEventService.authButtonClickSettingsPControlsPrivacyRequestConfirm(
          child,
          "dataAccess",
        );
        try {
          await requestUserData({ userId: child.userId }).unwrap();
          parentalControlsEventService.authButtonClickSettingsPControlsPrivacyRequestSuccess(
            child,
            "dataAccess",
          );
          requestDataConfirmationModalService.close();
          requestDataReceivedModalService.open();
        } catch (error) {
          requestDataConfirmationModalService.close();
          handlePrivacyRequestError(error, "dataAccess");
        }
      },
    });

  const [deleteAccountReceivedModal, deleteAccountReceivedModalService] =
    useChildPrivacyRequestModal({
      translatedTitle: translate(translations.deleteAccount.receivedHeading),
      translatedBody: (
        <span
          dangerouslySetInnerHTML={{
            __html: translate(translations.deleteAccount.receivedBody, {
              childUsername,
              openFaqTag: `<a class="text-link" target="_blank" rel="noreferrer" href="${accountDeletionHelpPageUrl}">`,
              closeFaqTag: "</a>",
            }),
          }}
        />
      ),
      translatedActionButtonText: translate(commonTranslationConstants.ok),
      translatedCloseLabel,
    });
  const [deleteAccountConfirmationModal, deleteAccountConfirmationModalService] =
    useChildPrivacyRequestModal({
      translatedTitle: translate(translations.deleteAccount.confirmationHeading, {
        childAccount,
      }),
      translatedBody: translate(translations.deleteAccount.confirmationBody, { childAccount }),
      translatedActionButtonText: translate(translations.deleteAccount.action),
      translatedSecondaryButtonText: translate(commonTranslationConstants.cancel),
      translatedCloseLabel,
      disableActionButton: deleteAccountIsSubmitting,
      disableSecondaryButton: deleteAccountIsSubmitting,
      shouldCloseModalOnActionButton: false,
      onAction: async () => {
        parentalControlsEventService.authButtonClickSettingsPControlsPrivacyRequestConfirm(
          child,
          "accountDeletion",
        );
        try {
          await forgetUser({ userId: child.userId }).unwrap();
          dispatch(
            parentalControlsApi.util.updateQueryData("getChildrenInfo", undefined, draft => {
              const deletedChild = draft.childrenInfoList.find(
                childInfo => childInfo.userId === child.userId,
              );
              if (deletedChild) {
                deletedChild.isAccountDeletionRequested = true;
              }
            }),
          );
          parentalControlsEventService.authButtonClickSettingsPControlsPrivacyRequestSuccess(
            child,
            "accountDeletion",
          );
          deleteAccountConfirmationModalService.close();
          deleteAccountReceivedModalService.open();
        } catch (error) {
          deleteAccountConfirmationModalService.close();
          handlePrivacyRequestError(error, "accountDeletion");
        }
      },
    });

  useEffect(() => {
    parentalControlsEventService.authPageloadSettingsPControlsPrivacyRequest(child);
  }, [child.userId]);

  return (
    <React.Fragment>
      <SettingsSection>
        <React.Fragment>
          <div
            id={emailStatusId}
            className="small text"
            role={emailsIsError ? "alert" : undefined}
            aria-live="polite"
          >
            {emailStatus}
          </div>
          {emailsIsError && (
            <Button
              size="Small"
              variant="Standard"
              onClick={() => {
                refetchEmails().catch(() => undefined);
              }}
              isDisabled={emailsIsFetching}
            >
              {translate(commonTranslationConstants.tryAgain)}
            </Button>
          )}
        </React.Fragment>
      </SettingsSection>
      <ChildPrivacyRequestActionSection
        label={translate(translations.requestData.heading, { childAccount })}
        inputId="btn-request-child-data"
        buttonText={translate(translations.requestData.action)}
        description={
          verifiedEmail
            ? translate(translations.requestData.description, {
                childAccount,
                recipientEmail: verifiedEmail,
              })
            : undefined
        }
        onButtonClick={() => {
          parentalControlsEventService.authButtonClickSettingsPControlsPrivacyRequest(
            child,
            "dataAccess",
          );
          requestDataConfirmationModalService.open();
        }}
        showDivider
        isDisabled={actionDisabled}
        isLoading={requestDataIsSubmitting}
        disabledReasonId={emailStatusId}
      />
      <ChildPrivacyRequestActionSection
        label={translate(translations.deleteAccount.heading, { childAccount })}
        inputId="btn-delete-child-account"
        buttonText={translate(translations.deleteAccount.action)}
        description={translate(translations.deleteAccount.description, { childAccount })}
        onButtonClick={() => {
          parentalControlsEventService.authButtonClickSettingsPControlsPrivacyRequest(
            child,
            "accountDeletion",
          );
          deleteAccountConfirmationModalService.open();
        }}
        showDivider
        isDisabled={actionDisabled}
        isLoading={deleteAccountIsSubmitting}
        disabledReasonId={emailStatusId}
        isDestructive
      />
      {requestDataConfirmationModal}
      {requestDataReceivedModal}
      {deleteAccountConfirmationModal}
      {deleteAccountReceivedModal}
      {ongoingRequestModal}
      {errorModal}
    </React.Fragment>
  );
};

export default ChildPrivacyRequests;
