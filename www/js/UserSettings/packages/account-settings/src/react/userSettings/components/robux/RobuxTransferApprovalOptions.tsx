import { useMemo, type JSX } from "react";
import { useTranslation } from "react-utilities";
import { Loading } from "react-style-guide";
import {
  ChallengeAbandonedError,
  RobuxTransferApprovalMode,
  TUpdateUserSettingValueRequest,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import translationConstants from "@rbx/transfer-platform-common/core/constants/translationConstants";
import RouterPath from "../../../../enums/RouterPath";
import SettingCategoryPageName from "../../../../enums/SettingCategoryPageName";
import { filterRadioButtonOptionsWithDescription } from "../../../../core/utils/settingOptionsUtils";
import { useUpdateUserSettingValueV2Mutation } from "../../../apis/userSettingsApi";
import useGetSettingsAndOptionsV2 from "../../../apis/hooks/useGetSettingsAndOptionsV2";
import { TRadioButtonOptionV2 } from "../../../common/components/RadioButtonOptionsWithParentalConsent";
import RadioButtonOptionsWithParentalConsentV2 from "../../../common/components/RadioButtonOptionsWithParentalConsentV2";
import BackLink from "../../../common/components/routing/BackLink";
import SettingsSection from "../../../common/components/SettingsSection";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import {
  getSuccessMessageKeyForUserSettingsUpdate,
  handleChildSettingsUpdateError,
} from "../../utils/successMessageUtils";

const robuxSettingsPath = `/${RouterPath.Robux}`;
const transferApprovalsPath = `${robuxSettingsPath}/${SettingCategoryPageName.TransferApprovals}`;

const getChildApprovalOptions = (): TRadioButtonOptionV2[] => [
  {
    label:
      translationConstants.childControlTransferApprovals[RobuxTransferApprovalMode.AlwaysAsk].title,
    value: RobuxTransferApprovalMode.AlwaysAsk,
    id: "robux-transfer-approval-always-ask",
    name: "robux-transfer-approval-always-ask",
  },
  {
    label:
      translationConstants.childControlTransferApprovals[
        RobuxTransferApprovalMode.TrustedFriendsAutoApproved
      ].title,
    value: RobuxTransferApprovalMode.TrustedFriendsAutoApproved,
    id: "robux-transfer-approval-trusted-friends",
    name: "robux-transfer-approval-trusted-friends",
  },
];

/**
 * Transfer approval options for child control.
 */
const RobuxTransferApprovalOptions = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const [updateSettingValue] = useUpdateUserSettingValueV2Mutation();
  const [settingsAndOptions, isLoading, isError] = useGetSettingsAndOptionsV2();
  const approvalModeSetting = settingsAndOptions?.[UserSetting.robuxTransferApprovalMode];

  const updateApprovalMode = async (value: RobuxTransferApprovalMode): Promise<void> => {
    const updateBody: TUpdateUserSettingValueRequest = {
      setting: UserSetting.robuxTransferApprovalMode,
      value,
      // The consent requirements for this setting live on the V2 map.
      useRequirementsMapV2: true,
    };
    try {
      const result = await updateSettingValue(updateBody).unwrap();
      const successMessageKey = getSuccessMessageKeyForUserSettingsUpdate(updateBody, result);
      if (successMessageKey) {
        snackbarService.success(translate(successMessageKey));
      }
    } catch (error) {
      if (
        error === ChallengeAbandonedError ||
        (error instanceof Error && error.message === ChallengeAbandonedError)
      ) {
        return;
      }
      const errorKey = handleChildSettingsUpdateError(
        error,
        undefined,
        UserSetting.robuxTransferApprovalMode,
      );
      if (errorKey) {
        snackbarService.warning(translate(errorKey));
      }
    }
  };

  const options = useMemo(
    () =>
      filterRadioButtonOptionsWithDescription(
        UserSetting.robuxTransferApprovalMode,
        getChildApprovalOptions(),
        approvalModeSetting?.options ?? [],
        translate,
      ),
    [approvalModeSetting, translate],
  );

  const savedModeCopy =
    approvalModeSetting?.currentValue == null
      ? undefined
      : translationConstants.childControlTransferApprovals[approvalModeSetting.currentValue];
  const title = translate(translationConstants.transferApprovalsHeading);

  const renderContent = (): JSX.Element => {
    if (isLoading) {
      return <Loading />;
    }
    if (isError || savedModeCopy == null) {
      return <div className="text-error">{translate(commonTranslationConstants.unknownError)}</div>;
    }
    return (
      <RadioButtonOptionsWithParentalConsentV2
        className="section-content"
        options={options}
        settingName={UserSetting.robuxTransferApprovalMode}
        onOptionSelected={updateApprovalMode}
      />
    );
  };

  return (
    <div>
      <BackLink
        basePath={robuxSettingsPath}
        currentPagePath={transferApprovalsPath}
        titleTranslationKey={translationConstants.transferApprovalsHeading}
        title={title}
      />
      <SettingsSection
        description={savedModeCopy == null ? undefined : translate(savedModeCopy.pageDescription)}
      >
        {renderContent()}
      </SettingsSection>
    </div>
  );
};

export default RobuxTransferApprovalOptions;
