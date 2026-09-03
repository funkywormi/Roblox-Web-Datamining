import React, { useEffect, useMemo, useState } from "react";
import { AccessManagementUpsellV2Service } from "Roblox";
import { useTranslation } from "react-utilities";
import { IModalService, Loading } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { useSnackbar } from "@rbx/user-settings";
import { ParentConsentStatus } from "../../../../types/parentConsentsTypes";
import { useAppDispatch } from "../../../redux/hooks";
import baseApi from "../../../apis/common/baseApi";
import ApiCacheTag from "../../../apis/common/cacheTagEnum";
import { TExtraParameter } from "../../../../types/ampTypes";
import { AmpParameterName, AmpParameterType } from "../../../../enums/ampEnums";
import useBirthdateSelector from "../../../userSettings/hooks/useBirthdateSelector";
import { useGetAccountInfoQuery } from "../../../apis/legacyAccountSettingsApi";
import { useGetVerifiedAgeQuery } from "../../../apis/ageVerificationApi";
import accountInfoTranslationConstants from "../../../userSettings/constants/contentConstants/accountInfoTranslationConstants";
import commonTranslationConstants from "../../../userSettings/constants/contentConstants/commonTranslationConstants";
import { useUpdateBirthdateMutation, useGetBirthdateQuery } from "../../../apis/usersApi";
import useSettingsModal, { useSettingsInfoModal } from "./useSettingsModal";
import birthdayUtils from "../../../userSettings/utils/birthdayUtils";
import { ageDownThreshold } from "../../../userSettings/constants/accountInfo/accountInfoConstants";
import accountInfoEventService from "../../../userSettings/services/eventServices/accountInfoEventService";
import { getAllParentalConsentsCacheTags } from "../../../apis/parentalControlsApi";
import AMPFeaturesConstants from "../../../userSettings/constants/AMPFeaturesConstants";
import waitUtils from "../../../userSettings/utils/waitUtils";
import reloadUtils from "../../../userSettings/utils/reloadUtils";

const useChangeBirthdateModal = (): [JSX.Element, IModalService] => {
  const dispatch = useAppDispatch();
  const { snackbarService } = useSnackbar();
  const { translate } = useTranslation();

  const { birthdate: birthdateTranslation } = accountInfoTranslationConstants;
  const { data: accountInfo } = useGetAccountInfoQuery();
  const { data: verifiedAge, refetch: refetchVerifiedAge } = useGetVerifiedAgeQuery();
  const { data: birthdate } = useGetBirthdateQuery();

  const [updateBirthdate] = useUpdateBirthdateMutation();
  const [selectedBirthdate, birthdateSelector, clearSelectedBirthdate, isBirthdayValid] =
    useBirthdateSelector();
  const [ampFeatureCheckData, setAmpFeatureCheckData] = useState<TExtraParameter[]>();
  const [ampRecourseData, setAmpRecourseData] = useState<Record<string, any>>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSameBirthdate, setIsSameBirthdate] = useState<boolean>(true);
  const [errorModal, errorModalService] = useSettingsInfoModal(
    commonTranslationConstants.modal.error.title,
    commonTranslationConstants.modal.error.body,
  );

  const invalidateCachedData = () => {
    const invalidCacheTags = [
      ApiCacheTag.Birthdate,
      ApiCacheTag.AccountInfo,
      ApiCacheTag.VerifiedAge,
      ApiCacheTag.AccountInfoAgeVerificationPolicy,
    ];
    const invalidateAction = baseApi.util.invalidateTags(invalidCacheTags);
    dispatch(invalidateAction);
  };
  const newAge = useMemo(() => birthdayUtils.calculateAge(selectedBirthdate), [selectedBirthdate]);

  useEffect(() => {
    if (selectedBirthdate) {
      const isSameDate = birthdayUtils.isSelectingTheSameDate(selectedBirthdate, birthdate);
      setIsSameBirthdate(isSameDate);
      const newBirthdate = birthdayUtils.birthdateToIsoString(selectedBirthdate);
      setAmpFeatureCheckData([
        {
          name: AmpParameterName.NewAge,
          type: AmpParameterType.Number,
          value: newAge,
        },
      ]);
      setAmpRecourseData({
        ...ampRecourseData,
        newBirthdate,
      });
    }
  }, [birthdate, selectedBirthdate]);

  const changeBirthdayHandler = async (callbackService: IModalService) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const access = await AccessManagementUpsellV2Service.startAccessManagementUpsell({
      featureName: AMPFeaturesConstants.ageCorrectionAmpFeature,
      ampFeatureCheckData,
      isAsyncCall: true,
      usePrologue: true,
      ampRecourseData,
      namespace: AMPFeaturesConstants.Namespaces.AgeCorrection,
    }).finally(() => invalidateCachedData());

    if (!access) {
      clearSelectedBirthdate();
      setIsLoading(false);
      const invalidateAction = baseApi.util.invalidateTags(
        getAllParentalConsentsCacheTags(authenticatedUser.id!, ParentConsentStatus.Pending),
      );
      dispatch(invalidateAction);
    } else {
      // wait for 1 second to make sure the data is updated
      await waitUtils(1);
      const verifiedAgeResult = await refetchVerifiedAge().unwrap();
      if (!verifiedAgeResult?.isVerified) {
        await updateBirthdate(selectedBirthdate).unwrap();
        snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
      }
    }
    callbackService.close();
  };
  const [ageDownModal, ageDownModalService] = useSettingsModal({
    titleResourceId: birthdateTranslation.warnings.ageDownInModal.title,
    translatedBody: (
      <span
        dangerouslySetInnerHTML={{
          __html: translate(birthdateTranslation.warnings.ageDownInModal.body, {
            lineBreak: "<br><br>",
          }),
        }}
      />
    ),
    actionButtonTextResourceId: commonTranslationConstants.cancel,
    neutralButtonTextResourceId: commonTranslationConstants.continue,
    onAction: () => {
      // close modal without action. This is expected because we don't want user to age down
      setIsLoading(false);
    },
    onNeutral: async () => {
      try {
        await changeBirthdayHandler(ageDownModalService);
        reloadUtils.reloadPage();
      } catch (e) {
        errorModalService.open();
        setIsLoading(false);
        accountInfoEventService.birthdayUpdateModalError(
          verifiedAge?.isVerified ?? false,
          accountInfo?.UserAbove13 ?? false,
        );
      }
    },
    onHide: () => {
      setIsLoading(false);
    },
    size: "sm",
  });
  const loading = isLoading ? <Loading /> : null;
  const body = (
    <div>
      {loading}
      {birthdateSelector}
      {errorModal}
      {ageDownModal}
    </div>
  );
  const [changeAgeModal, changeAgeModalService] = useSettingsModal({
    titleResourceId: birthdateTranslation.birthdayChangeTitle,
    translatedBody: body,
    actionButtonTextResourceId: commonTranslationConstants.continue,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    shouldCloseModalOnActionButton: false,
    onAction: async () => {
      setIsLoading(true);
      accountInfoEventService.birthdayUpdateModalContinue(
        verifiedAge?.isVerified ?? false,
        accountInfo?.UserAbove13 ?? false,
      );
      if (newAge < ageDownThreshold && accountInfo?.UserAbove13) {
        ageDownModalService.open();
      } else {
        try {
          await changeBirthdayHandler(changeAgeModalService);
          setIsLoading(false);
          changeAgeModalService.close();
        } catch (e) {
          errorModalService.open();
          setIsLoading(false);
        }
      }
    },
    onHide: clearSelectedBirthdate,
    onNeutral: () => {
      clearSelectedBirthdate();
      accountInfoEventService.birthdayUpdateModalCancel(
        verifiedAge?.isVerified ?? false,
        accountInfo?.UserAbove13 ?? false,
      );
      setIsLoading(false);
    },
    size: "sm",
    disableActionButton: !selectedBirthdate || !isBirthdayValid || isSameBirthdate,
  });

  return [changeAgeModal, changeAgeModalService];
};

export default useChangeBirthdateModal;
