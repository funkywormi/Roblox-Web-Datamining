import React, { useEffect } from "react";
import { useTranslation } from "react-utilities";
import { Button, Toggle } from "react-style-guide";
import { UpsellService } from "Roblox";
import { UserSetting, useSnackbar } from "@rbx/user-settings";
import useGetSettingsAndOptions from "../../../apis/hooks/useGetSettingsAndOptions";
import InlineSettingComponent from "../../../common/components/InlineSettingComponent";
import { useGetPhoneQuery } from "../../../apis/accountInformationApi";
import { useGetContactsQuery, useDeleteContactsMutation } from "../../../apis/contactsApi";
import {
  useUpdateUserSettingValueMutation,
  useGetUserSettingsQuery,
  useGetSettingsMetadataQuery,
} from "../../../apis/userSettingsApi";
import useSettingsModal from "../../../common/hooks/modals/useSettingsModal";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import {
  friendDiscoverySettingPageOrigin,
  phoneRootElementId,
} from "../../constants/phoneConstants";
import contactImportEventService from "../../services/eventServices/contactImportEventService";
import phoneEventService from "../../services/eventServices/phoneEventService";
import FriendDiscovery from "./FriendDiscovery";
import baseApi from "../../../apis/common/baseApi";
import ApiCacheTag from "../../../apis/common/cacheTagEnum";
import { useAppDispatch } from "../../../redux/hooks";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";

export const FriendsAndContacts = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const dispatch = useAppDispatch();

  const [updateUserSettingValue] = useUpdateUserSettingValueMutation();

  const { data: userSettings } = useGetUserSettingsQuery();
  const [settingsAndOptions] = useGetSettingsAndOptions();
  const { data: userSettingsMetadata } = useGetSettingsMetadataQuery();
  const { data: contacts, refetch: refetchContacts } = useGetContactsQuery();
  const { data: phoneInfo } = useGetPhoneQuery();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();

  const invalidateCachedPhoneData = () => {
    const invalidateAction = baseApi.util.invalidateTags([
      ApiCacheTag.UserSettingsAndOptions,
      ApiCacheTag.Phone,
    ]);
    dispatch(invalidateAction);
  };

  useEffect(() => {
    contactImportEventService.privacyTabPageView();
  }, []);

  const [deleteContactsMutation] = useDeleteContactsMutation();
  const deleteSyncedContacts = async () => {
    try {
      await deleteContactsMutation().unwrap();
      contactImportEventService.deleteContactsSuccess();
      await refetchContacts().unwrap();
      snackbarService.success(translate(privacyTranslationConstants.deleteContactDataSuccess));
    } catch {
      snackbarService.warning(translate(privacyTranslationConstants.deleteContactDataFailure));
    }
  };

  const [allowContactAccessModal, allowContactModalService] = useSettingsModal({
    titleResourceId: privacyTranslationConstants.connectWithContactsTitle,
    bodyResourceId: privacyTranslationConstants.connectWithContactModalDescription,
    size: "sm",
    actionButtonTextResourceId: commonTranslationConstants.ok,
    onAction: () => allowContactModalService.close(),
  });

  const [deleteContactModal, deleteContactModalService] = useSettingsModal({
    titleResourceId: privacyTranslationConstants.deleteSyncedContactDataLabel,
    bodyResourceId: privacyTranslationConstants.deleteContactDataInstructions,
    actionButtonTextResourceId: commonTranslationConstants.deleteAction,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    onAction: deleteSyncedContacts,
    size: "md",
  });

  const toggleAllowContactAccess = async () => {
    if (!userSettings?.canUploadContacts) {
      allowContactModalService.open();
    } else {
      try {
        await updateUserSettingValue({
          setting: UserSetting.canUploadContacts,
          value: false,
        }).unwrap();
        contactImportEventService.toggleSyncContacts(false);
        // These success / fail messages are generic and refer to updating access to contacts
        // not explicitly enabling or disabling them
        snackbarService.success(translate(privacyTranslationConstants.allowAccessContactsSuccess));
      } catch {
        snackbarService.warning(translate(privacyTranslationConstants.allowAccessContactsFailure));
      }
    }
  };

  const addPhone = () => {
    phoneEventService.addPhoneBtnClicked();
    UpsellService.renderPhoneUpsell({
      onClose: invalidateCachedPhoneData,
      origin: friendDiscoverySettingPageOrigin,
      existingPhoneNumber: phoneInfo?.phone,
    });
  };

  const unverifiedPhoneSection = (
    <InlineSettingComponent
      label={translate(privacyTranslationConstants.verifyYourPhone)}
      inputId="verify-phone-btn"
    >
      <Button size={Button.sizes.small} variant={Button.variants.secondary} onClick={addPhone}>
        {translate(privacyTranslationConstants.addPhoneBtn)}
      </Button>
    </InlineSettingComponent>
  );

  const accessContactSection = (
    <InlineSettingComponent
      label={translate(privacyTranslationConstants.deviceContactAccessLabel)}
      description={
        <span>{translate(privacyTranslationConstants.deviceContactAccessDescription)}</span>
      }
      inputId="device-contact-toggle"
    >
      <Toggle isOn={!!userSettings?.canUploadContacts} onToggle={toggleAllowContactAccess} />
    </InlineSettingComponent>
  );

  const contactSyncManagementSection = (
    <InlineSettingComponent
      label={translate(privacyTranslationConstants.deleteSyncedContactsLabel)}
      inputId="delete-synced-contact-btn"
    >
      <Button
        variant={Button.variants.alert}
        onClick={deleteContactModalService.open}
        size={Button.sizes.small}
      >
        {translate(commonTranslationConstants.deleteAction)}
      </Button>
    </InlineSettingComponent>
  );

  const shouldShowDeviceContactSyncSettings = () => {
    if (uiPolicy?.hideDeviceContactSyncSettings) {
      return false;
    }
    return userSettingsMetadata?.isContactImportFeatureEnabled;
  };

  return (
    <React.Fragment>
      <div id={phoneRootElementId} />
      {phoneInfo?.isVerified && settingsAndOptions?.[UserSetting.phoneNumberDiscoverability] ? (
        <FriendDiscovery />
      ) : (
        unverifiedPhoneSection
      )}
      {/* We are deprecating the device contact sync settings, but still want to allow users */}
      {/* to manage contacts they had previously synced. */}
      {shouldShowDeviceContactSyncSettings() && accessContactSection}
      {userSettingsMetadata?.isContactImportFeatureEnabled &&
        !!contacts?.userContactIds?.length &&
        contactSyncManagementSection}
      {allowContactAccessModal}
      {deleteContactModal}
    </React.Fragment>
  );
};

export default FriendsAndContacts;
