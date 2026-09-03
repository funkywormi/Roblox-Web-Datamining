import React, { useEffect } from "react";
import { useTranslation } from "react-utilities";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { Badge } from "@rbx/foundation-ui";
import { useSnackbar } from "@rbx/user-settings";
import SettingsTextField from "../../../../common/components/SettingsTextField";
import accountInfoTranslationConstants from "../../../constants/contentConstants/accountInfoTranslationConstants";
import { useGetAgeGroupQuery } from "../../../../apis/accountInsightsApi";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import {
  useGetAccountInfoAgeVerificationPolicyQuery,
  useGetSettingsUiPolicyQuery,
} from "../../../../apis/universalAppConfigurationApi";

const ageGroupTranslationConstants = accountInfoTranslationConstants.ageGroup;

const AgeGroup = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const { data: ageGroup, status } = useGetAgeGroupQuery({});
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const { data: ageVerificationPolicy, isFetching: isAgeVerificationPolicyFetching } =
    useGetAccountInfoAgeVerificationPolicyQuery();
  const acceptDownageAvailable = ageVerificationPolicy?.acceptDownageAvailable ?? false;

  useEffect(() => {
    if (status === QueryStatus.rejected || (status === QueryStatus.fulfilled && !ageGroup)) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  }, [ageGroup, status]);

  // TODO: Remove this useEffect once acceptDownageAvailable is fully rolled out
  useEffect(() => {
    if (isAgeVerificationPolicyFetching) {
      return;
    }

    if (acceptDownageAvailable) {
      return;
    }

    if (ageGroup?.ageVerificationDeadline) {
      const deadline = new Date(ageGroup.ageVerificationDeadline);
      const formattedDeadline = deadline.toLocaleDateString();
      snackbarService.warning(
        translate(ageGroupTranslationConstants.verifyAgeWarning, {
          ageVerificationDeadline: formattedDeadline,
        }),
      );
    }

    if (ageGroup?.isPendingWithUnknownDeadline) {
      snackbarService.warning(
        translate(ageGroupTranslationConstants.verifyAgeWarningUnknownDeadline),
      );
    }
  }, [ageGroup, acceptDownageAvailable, isAgeVerificationPolicyFetching]);

  let metadataBody: JSX.Element | null = null;
  if (ageGroup?.isChecked) {
    metadataBody = uiPolicy?.displayAgeCheckedBadge ? (
      <Badge
        icon="icon-filled-circle-check"
        label={translate(ageGroupTranslationConstants.checkedLabel)}
        variant="Neutral"
        className="age-checked-badge"
      />
    ) : (
      <span className="account-field-verified-icon icon-checkmark-16x16 settings-metadata-icon" />
    );
  }

  return ageGroup ? (
    <SettingsTextField
      id="age-group-id"
      label={translate(ageGroupTranslationConstants.label)}
      lines={[{ value: translate(ageGroup.ageGroupTranslationKey), metadataBody }]}
      valueSet={Boolean(ageGroup)}
      primaryEditLabel="" // there is no edit button for this setting
      primaryOnEdit={() => {
        // There is no edit functionality for this setting
      }}
      displayEditButton={false}
    />
  ) : (
    <React.Fragment />
  );
};

export default AgeGroup;
