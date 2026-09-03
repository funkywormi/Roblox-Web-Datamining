import React, { useEffect } from "react";
import { useTranslation } from "react-utilities";
import { UpsellService } from "Roblox";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { Badge } from "@rbx/foundation-ui";
import { useSnackbar } from "@rbx/user-settings";
import SettingsTextField from "../../../common/components/SettingsTextField";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { accountSettingsPageOrigin, phoneRootElementId } from "../../constants/phoneConstants";
import { useGetPhoneQuery } from "../../../apis/accountInformationApi";
import { useGetUserSettingsAndOptionsQuery } from "../../../apis/userSettingsApi";

export const PhoneNumberSetting = (): JSX.Element => {
  const {
    data: phoneInfo,
    refetch: refetchPhoneInfo,
    status: phoneInfoStatus,
    isLoading,
  } = useGetPhoneQuery();
  const { refetch: refetchUserSettingsAndOptions } = useGetUserSettingsAndOptionsQuery();

  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  useEffect(() => {
    if (phoneInfoStatus === QueryStatus.rejected) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneInfoStatus]);

  const onEditPhoneNumber = () => {
    UpsellService.renderPhoneUpsell({
      onClose: () => {
        setTimeout(async () => {
          await refetchPhoneInfo();
          await refetchUserSettingsAndOptions();
        }, 1000); // delay refetch since delete takes some time to propogate
      },
      origin: accountSettingsPageOrigin,
      existingPhoneNumber: phoneInfo?.phone,
    });
  };

  const verifiedMetadata = (
    <div className="inline-badge">
      <Badge
        variant="Neutral"
        icon="icon-filled-circle-check"
        label={translate(accountInfoTranslationConstants.changePhone.verifiedPhoneLabel)}
      />
    </div>
  );

  const noneMetadata = (
    <span className="text-body-medium">
      {translate(accountInfoTranslationConstants.changePhone.noneLabel)}
    </span>
  );

  return (
    <React.Fragment>
      <div id={phoneRootElementId} />
      {!isLoading && (
        <SettingsTextField
          id="account-field-phone"
          label={translate(accountInfoTranslationConstants.changePhone.phoneLabel)}
          valueSet={phoneInfo?.isVerified ?? false}
          lines={[
            {
              value: phoneInfo?.phone ?? "",
              metadataBody: phoneInfo?.isVerified ? verifiedMetadata : noneMetadata,
            },
          ]}
          primaryEditLabel={
            phoneInfo?.isVerified
              ? translate(accountInfoTranslationConstants.changePhone.updatePhoneLabel)
              : translate(accountInfoTranslationConstants.changePhone.addPhoneLabel)
          }
          primaryOnEdit={onEditPhoneNumber}
          primaryActionId={
            phoneInfo?.isVerified ? "account-change-phone" : "account-field-phone-add-phone"
          }
        />
      )}
    </React.Fragment>
  );
};

export default PhoneNumberSetting;
