import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-utilities";
import { IModalService, Loading } from "react-style-guide";
import { birthdayUtils, useSnackbar } from "@rbx/user-settings";
import useChildBirthdateSelector from "../../../userSettings/hooks/useChildBirthdateSelector";
import commonTranslationConstants from "../../../userSettings/constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../userSettings/constants/contentConstants/parentalControlsTranslationConstants";
import { useInitiateConsentByParentMutation } from "../../../apis/parentalControlsApi";
import useSettingsModal, { useSettingsInfoModal } from "./useSettingsModal";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import { ParentConsentType, TConsentData } from "../../../../types/parentConsentsTypes";
import accountInfoTranslationConstants from "../../../userSettings/constants/contentConstants/accountInfoTranslationConstants";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";

const useChangeChildBirthdateModal = (child: TChildInfo): [JSX.Element, IModalService] => {
  const { snackbarService } = useSnackbar();
  const { translate } = useTranslation();
  const birthdate = birthdayUtils.isoStringToBirthdate(child.birthDate);

  const [initiateConsentByParent] = useInitiateConsentByParentMutation();
  const [selectedBirthdate, birthdateSelector, clearSelectedBirthdate, isBirthdayValid] =
    useChildBirthdateSelector(
      birthdate,
      child.birthdatePickerLowerBoundInclusive,
      child.birthdatePickerUpperBoundInclusive,
    );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSameBirthdate, setIsSameBirthdate] = useState<boolean>(true);
  const [newBirthdateInIso, setNewBirthdateInIso] = useState<string>("");
  const changeAgeModalServiceRef = useRef<IModalService | null>(null);
  const [errorModal, errorModalService] = useSettingsInfoModal(
    commonTranslationConstants.modal.error.title,
    commonTranslationConstants.modal.error.body,
  );

  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  useEffect(() => {
    if (selectedBirthdate) {
      const isSameDate = birthdayUtils.isSelectingTheSameDate(selectedBirthdate, birthdate);
      setIsSameBirthdate(isSameDate);
      const newBirthdate = birthdayUtils.birthdateToIsoString(selectedBirthdate);
      setNewBirthdateInIso(newBirthdate);
    }
  }, [selectedBirthdate]);

  const changeBirthdayHandler = async () => {
    const details: TConsentData = { newBirthdate: newBirthdateInIso };
    // Use .unwrap() so a failed mutation rejects and can be caught by the outer try/catch
    await initiateConsentByParent({
      childUserId: child.userId,
      consentType: ParentConsentType.UpdateBirthdate,
      details,
    }).unwrap();
  };

  const [warningModal, warningModalService] = useSettingsModal({
    titleResourceId: commonTranslationConstants.modal.warning.title,
    translatedBody: (
      <span
        dangerouslySetInnerHTML={{
          __html: translate(
            accountInfoTranslationConstants.birthdate.updateChildBirthdayWarningDescription,
            {
              lineBreak: "<br><br>",
            },
          ),
        }}
      />
    ),
    actionButtonTextResourceId: commonTranslationConstants.continue,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    onAction: async () => {
      try {
        await changeBirthdayHandler();
        snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
        warningModalService.close();
        changeAgeModalServiceRef.current?.close();
        clearSelectedBirthdate();
      } catch (e) {
        errorModalService.open();
      } finally {
        setIsLoading(false);
      }
    },
    onNeutral: () => {
      setIsLoading(false);
      clearSelectedBirthdate();
      changeAgeModalServiceRef.current?.close();
    },
    onHide: () => {
      setIsLoading(false);
    },
    size: "sm",
  });

  const loading = isLoading ? <Loading /> : null;
  const warningText = uiPolicy?.enableVPCBirthdateUpdateLifetimeCap ? (
    <div className="update-child-birthday-warning-description">
      {translate(accountInfoTranslationConstants.birthdate.updateChildBirthdayWarningDescription)}
    </div>
  ) : null;
  const body = (
    <div>
      {warningText}
      {loading}
      {birthdateSelector}
      {errorModal}
      {warningModal}
    </div>
  );
  const [changeAgeModal, changeAgeModalService] = useSettingsModal({
    // TODO: upload the modal header
    titleResourceId: parentalControlsTranslationConstants.updateChildBirthday,
    translatedBody: body,
    actionButtonTextResourceId: commonTranslationConstants.continue,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    shouldCloseModalOnActionButton: false,
    onAction: () => {
      setIsLoading(true);
      warningModalService.open();
    },
    onHide: clearSelectedBirthdate,
    onNeutral: () => {
      clearSelectedBirthdate();
      setIsLoading(false);
    },
    size: "sm",
    disableActionButton: !selectedBirthdate || !isBirthdayValid || isSameBirthdate,
  });

  changeAgeModalServiceRef.current = changeAgeModalService;

  return [changeAgeModal, changeAgeModalService];
};

export default useChangeChildBirthdateModal;
