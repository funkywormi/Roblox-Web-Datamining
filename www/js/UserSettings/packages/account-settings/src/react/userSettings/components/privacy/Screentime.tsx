import React, { useState, useEffect } from "react";
import { authenticatedUser } from "header-scripts";
import { useTranslation } from "react-utilities";
import { Button, NativeDropdown } from "react-style-guide";
import { AccessManagementUpsellV2Service } from "Roblox";
import { NavLink } from "react-router-dom";
import { TUpdateUserSettingValueRequest, UserSetting, useSnackbar } from "@rbx/user-settings";
import useGetPendingParentalConsentRequest from "../../hooks/useGetPendingParentalConsentRequest";
import SettingSubListItem from "../../../common/components/routing/SettingSubListItem";
import ScreentimeChart from "../parentalControls/shared/ScreentimeChart";
import parentalControlsTranslationConstants from "../../constants/contentConstants/parentalControlsTranslationConstants";
import screentimeUtils from "../../utils/parentalControls/screentime/screentimeUtils";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import { ParentConsentType } from "../../../../types/parentConsentsTypes";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import SettingOptionPendingPill from "../../../common/components/SettingOptionPendingPill";
import useSettingsModal from "../../../common/hooks/modals/useSettingsModal";
import useCancelConsentRequestModal from "../../../common/hooks/modals/useCancelConsentRequestModal";
import AMPFeaturesConstants from "../../constants/AMPFeaturesConstants";
import ApiCacheTag from "../../../apis/common/cacheTagEnum";
import baseApi from "../../../apis/common/baseApi";
import { useAppDispatch } from "../../../redux/hooks";
import privacyEventService from "../../services/eventServices/privacyEventService";
import { screentimePages } from "../../constants/privacy/privacyConstants";
import PrivacySettingName from "../../../../enums/privacy/PrivacySettingName";
import { useGetFeatureAccessQuery } from "../../../apis/accessManagementApi";
import { Access } from "../../../../types/accessManagementTypes";
import useGetSettingsAndOptions from "../../../apis/hooks/useGetSettingsAndOptions";
import ScreentimeDescription from "../parentalControls/shared/ScreentimeDescription";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";

export const Screentime = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const [userSettings] = useGetSettingsAndOptions();
  const dispatch = useAppDispatch();
  const pendingConsentRequest = useGetPendingParentalConsentRequest(
    ParentConsentType.UpdateUserSetting,
    UserSetting.dailyScreenTimeLimit,
  );
  const [updateUserSettingValue] = useUpdateUserSettingValueMutation();

  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const rollbackUserControlledScreentime = uiPolicy?.rollbackUserControlledScreentime === true;

  const { data: userControlScreentimeLimitFeature } = useGetFeatureAccessQuery({
    featureName: AMPFeaturesConstants.ShouldUserControlScreentimeLimit,
  });
  const showUserControlScreentimeLimit =
    userControlScreentimeLimitFeature?.access === Access.Granted;

  const requestParentalConsent = async () => {
    try {
      await AccessManagementUpsellV2Service.startAccessManagementUpsell({
        featureName: AMPFeaturesConstants.settingChangeAmpFeature,
        namespace: AMPFeaturesConstants.Namespaces.SettingsChange,
        isAsyncCall: false,
        usePrologue: false,
        ampRecourseData: {
          dailyScreenTimeLimit: null,
        },
      }).finally(() => {
        const invalidCacheTags = [ApiCacheTag.ParentalConsentsType];
        const invalidateAction = baseApi.util.invalidateTags(invalidCacheTags);
        dispatch(invalidateAction);
      });
    } catch (e) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  };

  const [requestParentalConsentModal, requestParentalConsentModalService] = useSettingsModal({
    titleResourceId: parentalControlsTranslationConstants.parentalConsents.askMyParent,
    bodyResourceId:
      parentalControlsTranslationConstants.parentalControlsScreentime.requestLimitUpdate,
    actionButtonTextResourceId: parentalControlsTranslationConstants.parentalConsents.askMyParent,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    size: "sm",
    onAction: async () => {
      privacyEventService.authButtonClickSettingsScreentimeAskParent();
      await requestParentalConsent();
    },
    onNeutral: () => {
      privacyEventService.authButtonClickSettingsScreentimeCancel();
    },
  });

  const [cancelConsentRequestModal, cancelConsentRequestModalService] =
    useCancelConsentRequestModal({
      pendingConsent: pendingConsentRequest,
      translatedBody: translate(
        parentalControlsTranslationConstants.parentalConsents.cancelSettingUpdateRequestDescription,
      ),
    });

  const handleClick = () => {
    if (pendingConsentRequest) {
      cancelConsentRequestModalService.open();
      return;
    }
    privacyEventService.authModalShownSettingsScreentimeAskParent();
    requestParentalConsentModalService.open();
  };

  const controlsWithNoLimitPresent = (
    <SettingSubListItem
      title={translate(
        parentalControlsTranslationConstants.parentalControlsScreentime.dailyLimitLabel,
      )}
      additionalClasses="screentime-limit-setting-list-item-container"
      currentSettingValueComponent={
        <span>
          {translate(parentalControlsTranslationConstants.parentalControlsScreentime.noLimit)}
        </span>
      }
    />
  );

  const controlsWithLimitPresent = (
    <React.Fragment>
      {requestParentalConsentModal}
      {cancelConsentRequestModal}
      <SettingSubListItem
        title={translate(
          parentalControlsTranslationConstants.parentalControlsScreentime.dailyLimitLabel,
        )}
        showArrow
        onClick={handleClick}
        additionalClasses="screentime-limit-setting-list-item-container"
        currentSettingValueComponent={
          <React.Fragment>
            {pendingConsentRequest && <SettingOptionPendingPill />}
            {screentimeUtils.generateCurrentTimeDisplay(
              userSettings?.dailyScreenTimeLimit?.currentValue,
              translate(parentalControlsTranslationConstants.parentalControlsScreentime.noLimit),
              translate(
                parentalControlsTranslationConstants.parentalControlsScreentime.minutesLabel,
              ),
              translate(parentalControlsTranslationConstants.parentalControlsScreentime.hoursLabel),
              translate(parentalControlsTranslationConstants.parentalControlsScreentime.hourLabel),
            )}
          </React.Fragment>
        }
      />
      {pendingConsentRequest && (
        <div className="request-consent-button-container screentime-request-consent-button-container">
          {/* Cancel request button */}
          <div>
            <Button
              variant={Button.variants.secondary}
              onClick={() => {
                cancelConsentRequestModalService.open();
              }}
            >
              {translate(parentalControlsTranslationConstants.parentalConsents.cancelRequest)}
            </Button>
          </div>
        </div>
      )}
    </React.Fragment>
  );

  const saveScreentimeLimitHandler = async (newValue: number) => {
    const updateBody: TUpdateUserSettingValueRequest = {
      setting: UserSetting.dailyScreenTimeLimit,
      value: newValue,
    };
    try {
      await updateUserSettingValue(updateBody).unwrap();
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
    } catch {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  };

  const screentimeLimitOptions = screentimeUtils.generateAllowedTimeAmountOptions(
    translate(parentalControlsTranslationConstants.parentalControlsScreentime.noLimit),
    translate(parentalControlsTranslationConstants.parentalControlsScreentime.minutesLabel),
    translate(parentalControlsTranslationConstants.parentalControlsScreentime.hoursLabel),
    translate(parentalControlsTranslationConstants.parentalControlsScreentime.hourLabel),
  );

  const [selectedDailyLimit, setSelectedDailyLimit] = useState<number>(
    userSettings?.dailyScreenTimeLimit?.currentValue ?? screentimeUtils.minutesInDay,
  );

  useEffect(() => {
    setSelectedDailyLimit(
      userSettings?.dailyScreenTimeLimit?.currentValue ?? screentimeUtils.minutesInDay,
    );
  }, [userSettings]);

  const dailyLimitModalBody = (
    <div className="screentime-limit-modal-body">
      <p className="screentime-limit-modal-description">
        {translate(
          parentalControlsTranslationConstants.parentalControlsScreentime.limitModalDescriptionV2,
        )}
      </p>
      <NativeDropdown
        selectionItems={screentimeLimitOptions as unknown as { label?: string; value?: string }[]}
        selectedItemvalue={selectedDailyLimit as unknown as string}
        className="form-group"
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setSelectedDailyLimit(Number(e.target.value))
        }
      />
    </div>
  );

  const [dailyLimitModal, dailyLimitModalService] = useSettingsModal({
    translatedTitle: translate(
      parentalControlsTranslationConstants.parentalControlsScreentime.dailyLimitLabel,
    ),
    translatedBody: dailyLimitModalBody,
    actionButtonTextResourceId: commonTranslationConstants.saveAction,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    size: "sm",
    onAction: async () => {
      await saveScreentimeLimitHandler(selectedDailyLimit);
    },
  });

  const controlsWithUserLimitPresent = (
    <React.Fragment>
      {dailyLimitModal}
      <SettingSubListItem
        title={translate(
          parentalControlsTranslationConstants.parentalControlsScreentime.dailyLimitLabel,
        )}
        showArrow
        onClick={() => {
          // Reset selection to the current server value each time modal opens
          setSelectedDailyLimit(
            userSettings?.dailyScreenTimeLimit?.currentValue ?? screentimeUtils.minutesInDay,
          );
          dailyLimitModalService.open();
        }}
        additionalClasses="screentime-limit-setting-list-item-container"
        currentSettingValueComponent={
          <span>
            {screentimeUtils.generateCurrentTimeDisplay(
              userSettings?.dailyScreenTimeLimit?.currentValue,
              translate(parentalControlsTranslationConstants.parentalControlsScreentime.noLimit),
              translate(
                parentalControlsTranslationConstants.parentalControlsScreentime.minutesLabel,
              ),
              translate(parentalControlsTranslationConstants.parentalControlsScreentime.hoursLabel),
              translate(parentalControlsTranslationConstants.parentalControlsScreentime.hourLabel),
            )}
          </span>
        }
      />
    </React.Fragment>
  );

  const getDailyLimitSetting = () => {
    if (showUserControlScreentimeLimit) {
      // If rollback flag is on, only show the new user-controlled UI when the user already has a daily limit set
      if (rollbackUserControlledScreentime) {
        return userSettings?.dailyScreenTimeLimit?.currentValue != null
          ? controlsWithUserLimitPresent
          : null; // hide the setting entirely when no limit is set
      }

      return controlsWithUserLimitPresent;
    }

    return userSettings?.dailyScreenTimeLimit?.currentValue != null
      ? controlsWithLimitPresent
      : controlsWithNoLimitPresent;
  };

  const dailyLimitSetting = getDailyLimitSetting();

  return (
    <React.Fragment>
      <ScreentimeDescription />
      <ScreentimeChart userId={authenticatedUser.id!} />
      {dailyLimitSetting}
      <React.Fragment>
        <div className="rbx-divider" />
        <NavLink to={screentimePages[PrivacySettingName.PerExperienceScreentime].path}>
          <SettingSubListItem
            id="setting-sub-list-per-experience-screentime"
            title={translate(parentalControlsTranslationConstants.topGames.heading)}
            showArrow
          />
        </NavLink>
      </React.Fragment>
    </React.Fragment>
  );
};

export default Screentime;
