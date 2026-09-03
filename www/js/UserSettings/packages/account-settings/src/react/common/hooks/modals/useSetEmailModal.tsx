import React, { FormEvent, useState } from "react";
import { IModalService } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { LegallySensitiveContentService } from "Roblox";
import {
  ChallengeAbandonedError,
  EnabledStatusValue,
  TUpdateUserSettingValueRequest,
  UserSetting,
} from "@rbx/user-settings";
import useSettingsModal from "./useSettingsModal";
import useNotificationTypePreference from "./useNotificationTypePreference";
import {
  NotificationTypes,
  NotificationChannels,
} from "../../../userSettings/constants/notificationConstants";
import emailTranslationConstants from "../../../userSettings/constants/contentConstants/emailTranslationConstants";
import emailRegex from "../../../userSettings/constants/emailConstants";
import commonTranslationConstants from "../../../userSettings/constants/contentConstants/commonTranslationConstants";
import { useSetEmailAddressMutation } from "../../../apis/emailApi";
import { useGetAccountInfoQuery } from "../../../apis/legacyAccountSettingsApi";
import { useGetEmailConsentCheckboxEnabledQuery } from "../../../apis/experimentApi";
import { useUpdateUserSettingValueV2Mutation } from "../../../apis/userSettingsApi";
import {
  emailMarketingVerificationConsentName,
  emailMarketingVerificationSurface,
} from "../../../userSettings/constants/privacy/privacyConstants";
import { privacyPolicyLink } from "../../../userSettings/constants/urlConstants";

const useSetEmailModal = (
  contextForSetEmail: string | undefined = undefined,
): [JSX.Element, IModalService] => {
  const { translate } = useTranslation();

  const [errorTranslationKey, setErrorTranslationKey] = useState("");
  const [newEmailAddress, setNewEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [emailSetSuccess, setEmailSetSuccess] = useState(false);
  const [emailConsentCheckboxState, setEmailConsentCheckboxState] = useState<boolean>(false);

  const [updateEmailAddress] = useSetEmailAddressMutation();
  const [updateUserSettings] = useUpdateUserSettingValueV2Mutation();
  const { data: accountInfo } = useGetAccountInfoQuery();
  const { data: emailConsentCheckboxEnabled } = useGetEmailConsentCheckboxEnabledQuery();
  const emailPreference = useNotificationTypePreference(
    NotificationTypes.PromotionalOffers,
    NotificationChannels.Email,
  );
  const isEmailPreferenceOptedIn =
    emailPreference?.selectedOption !== null &&
    emailPreference?.selectedOption !== undefined &&
    "enabled" in emailPreference.selectedOption &&
    emailPreference.selectedOption.enabled;
  const showEmailConsentCheckbox = emailPreference !== undefined && !isEmailPreferenceOptedIn;

  const changeEmail = accountInfo?.IsEmailOnFile; // If email is already on file, we are changing it
  const [
    marketingEmailConsentLegallySensitiveContent,
    marketingEmailConsentLegallySensitiveActions,
  ] = LegallySensitiveContentService.useLegallySensitiveContentAndActions(
    emailMarketingVerificationConsentName,
    emailMarketingVerificationSurface,
  );

  let titleTranslationKey: string;
  if (changeEmail) {
    titleTranslationKey = accountInfo?.UserAbove13
      ? emailTranslationConstants.changeEmailO13Label
      : emailTranslationConstants.parentRecoveryEmail.changeParentEmailLabel;
  } else {
    titleTranslationKey = accountInfo?.UserAbove13
      ? emailTranslationConstants.addEmailO13Label
      : emailTranslationConstants.parentRecoveryEmail.addParentEmailLabel;
  }

  let descriptionTranslationKey: string;
  if (accountInfo?.UserAbove13) {
    descriptionTranslationKey = emailTranslationConstants.changeEmailWarning;
  } else if (changeEmail) {
    descriptionTranslationKey =
      emailTranslationConstants.parentRecoveryEmail.changeParentEmailDescription;
  } else {
    descriptionTranslationKey =
      emailTranslationConstants.parentRecoveryEmail.addParentEmailDescription;
  }

  let actionButtonTranslationKey: string;
  if (emailSetSuccess) {
    actionButtonTranslationKey = commonTranslationConstants.modal.submitButtonText;
  } else if (changeEmail) {
    actionButtonTranslationKey = emailTranslationConstants.changeEmailLabel;
  } else {
    actionButtonTranslationKey = emailTranslationConstants.addEmailLabel;
  }

  const regex = new RegExp(emailRegex);
  const getSetEmailErrorMessage = () => {
    if (newEmailAddress && !regex.test(newEmailAddress)) {
      return translate(emailTranslationConstants.invalidEmailAddressMessage);
    }

    if (errorTranslationKey) {
      return translate(errorTranslationKey);
    }
    return "";
  };

  const disableSetEmailButton =
    !emailSetSuccess && (!regex.test(newEmailAddress) || !newEmailAddress);

  const setEmailAddress = async (event: FormEvent | undefined = undefined) => {
    if (event) {
      event.preventDefault();
    }

    if (disableSetEmailButton) {
      return;
    }

    setErrorTranslationKey("");
    try {
      const body = { emailAddress: newEmailAddress, password };
      await updateEmailAddress(body).unwrap();

      // We try to save the email preference, but if it fails do not error out
      try {
        if (emailConsentCheckboxState) {
          const updateBody: TUpdateUserSettingValueRequest = {
            setting: UserSetting.AllowPromotionalOffersNotifications,
            value: {
              channelSettings: [
                {
                  channelName: "Email",
                  setting: EnabledStatusValue.Enabled,
                },
              ],
            },
            auditHeader: marketingEmailConsentLegallySensitiveActions.getBase64EncodedAuditHeader(),
          };
          await updateUserSettings(updateBody).unwrap();
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}

      setEmailSetSuccess(true);
      setNewEmailAddress("");
      setPassword("");
    } catch (err) {
      // Ignore challenge abandons for errors.
      if (err !== ChallengeAbandonedError) {
        setErrorTranslationKey(err as string);
      }
    }
  };

  const setEmailBody = (
    <React.Fragment>
      <form
        className="form-horizontal"
        autoComplete="off"
        name="updateEmailForm"
        onSubmit={setEmailAddress}
      >
        <div className="form-group">
          <input
            id="emailAddress"
            name="userInfo.emailAddress"
            type="email"
            className="form-control input-field"
            placeholder={translate(emailTranslationConstants.enterEmailLabel)}
            autoComplete="off"
            value={newEmailAddress}
            onChange={e => {
              setNewEmailAddress(e.target.value);
              setErrorTranslationKey("");
            }}
          />
          <span className="text-error form-control-label modal-error-message change-email-message">
            {getSetEmailErrorMessage()}
          </span>
        </div>
        {/* <!-- Do not remove these two input hidden fields below. They are to prevent browsers from saving the email as your username in the autofill settings https://stackoverflow.com/questions/15738259/disabling-chrome-autofill --> */}
        <input type="text" className="hidden" name="fake-username" />
        <input
          type="password"
          className="hidden"
          name="fake-password"
          autoComplete="new-password"
        />
        {/* <!-- Do not remove the two input hidden fields above. --> */}
        {accountInfo?.UserAbove13 && showEmailConsentCheckbox && emailConsentCheckboxEnabled ? (
          <div className="form-group email-consent checkbox">
            <input
              id="email-consent-checkbox"
              type="checkbox"
              checked={emailConsentCheckboxState}
              disabled={false}
              onClick={() => setEmailConsentCheckboxState(state => !state)}
            />
            <label htmlFor="email-consent-checkbox" className="email-consent-label text-body-small">
              {marketingEmailConsentLegallySensitiveContent.wordsOfConsent.consent}
            </label>
          </div>
        ) : null}
        {/* Hidden submit button to allow form submission on Enter key press */}
        <button
          type="submit"
          className="hidden-button"
          aria-label={translate(commonTranslationConstants.submitAction)}
        />
      </form>
      <span
        className="small text"
        dangerouslySetInnerHTML={{
          __html: translate(descriptionTranslationKey, {
            linkStart: `<a class='text-link' rel='noreferrer' target='_blank' href='${privacyPolicyLink}'>`,
            linkEnd: "</a>",
          }),
        }}
      />
    </React.Fragment>
  );

  const [setEmailModal, setEmailModalService] = useSettingsModal({
    titleResourceId: titleTranslationKey,
    translatedBody: emailSetSuccess
      ? translate(emailTranslationConstants.verificationSentAfterChangeEmail)
      : setEmailBody,
    actionButtonTextResourceId: actionButtonTranslationKey,
    shouldCloseModalOnActionButton: emailSetSuccess,
    onAction: emailSetSuccess ? () => setEmailSetSuccess(false) : setEmailAddress,
    disableActionButton: disableSetEmailButton,
    onHide: () => {
      setErrorTranslationKey("");
      setNewEmailAddress("");
      setPassword("");
      setEmailSetSuccess(false);
    },
    size: "md",
  });

  const [emailRequiredPromptModal, emailRequiredPromptModalService] = useSettingsModal({
    titleResourceId: emailTranslationConstants.emailRequiredMessage,
    bodyResourceId: contextForSetEmail,
    actionButtonTextResourceId: emailTranslationConstants.addEmailLabel,
    onAction: () => setEmailModalService.open(),
    size: "sm",
  });

  const modals = (
    <React.Fragment>
      {emailRequiredPromptModal}
      {setEmailModal}
    </React.Fragment>
  );

  return [modals, contextForSetEmail ? emailRequiredPromptModalService : setEmailModalService];
};

export default useSetEmailModal;
