/* eslint-disable no-void */
import { AccessManagementUpsellV2Service, DeepLinkService, DeviceMeta } from "Roblox";
import { authenticatedUser } from "header-scripts";
import { FullTagDescription } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { useTranslation } from "react-utilities";
import {
  RequirementType,
  EnabledStatusValue,
  TOptionValue,
  TUserSettingsAndOptionsV2Body,
  UserSetting,
  useSnackbar,
} from "@rbx/user-settings";
import { useAppDispatch } from "../../redux/hooks";
import baseApi from "../../apis/common/baseApi";
import ApiCacheTag from "../../apis/common/cacheTagEnum";
import AMPFeaturesConstants from "../constants/AMPFeaturesConstants";
import {
  verifyAgeButtonClickedFacialAgeEstimation,
  verifyAgeButtonClickedIdVerification,
  verifyAgeButtonClickedIdVerificationDeeplink,
} from "../services/eventServices/verificationEventService";
import {
  univeralAppConfigurationApi,
  useGetAccountInfoAgeVerificationPolicyQuery,
  useGetSettingsUiPolicyQuery,
} from "../../apis/universalAppConfigurationApi";
import {
  useAcceptPendingDownageMutation,
  useGetUndoAgeVerificationEligibilityQuery,
  useUndoAgeVerificationMutation,
} from "../../apis/ageVerificationApi";
import { accountInsightsApi, useGetAgeGroupQuery } from "../../apis/accountInsightsApi";
import { useSettingsInfoModal } from "../../common/hooks/modals/useSettingsModal";
import commonTranslationConstants from "../constants/contentConstants/commonTranslationConstants";
import { hasParentalRequirement } from "../../../core/utils/settingOptionsUtils";
import { ParentConsentStatus } from "../../../types/parentConsentsTypes";
import { getAllParentalConsentsCacheTags } from "../../apis/parentalControlsApi";
import accountInfoEventService from "../services/eventServices/accountInfoEventService";
import { fireAgeCheckIdvDeeplinkCounter } from "../utils/accountInfoEventsCounters";
import { getUserSettingsAndOptionsV2 } from "../../apis/userSettingsApi";

type TRequiredActionsUpsellParams = {
  settingName: UserSetting;
  optionValue: TOptionValue | undefined;
  requiredActions?: RequirementType[];
  usePrologue?: boolean;
  onComplete?: (freshSettingsData?: TUserSettingsAndOptionsV2Body) => void | Promise<void>;
};

interface UseAgeVerificationUpsellResult {
  faeAvailable: boolean;
  idvAvailable: boolean;
  vpcForFaeAvailable: boolean;
  undoAgeVerificationAvailable: boolean;
  acceptDownageAvailable: boolean;
  requireIDReverification: boolean;
  isLoading: boolean;
  handleFAEClick: (
    eventState?: string,
    onComplete?: (freshSettingsData?: TUserSettingsAndOptionsV2Body) => void,
  ) => void;
  handleIDVClick: () => void;
  handleVpcForFaeClick: (eventState?: string) => void;
  handleAgeCheckUpsells: (params: TRequiredActionsUpsellParams) => Promise<boolean>;
  errorModal: JSX.Element;
  eligibleForAgeVerificationUndo: boolean;
  handleUndoAgeVerificationClick: (descriptionKey: string) => void;
  handleAcceptDownageClick: (errorMessage?: string) => void;
  isAcceptingDownage: boolean;
}

/**
 * This hook encapsulates the data fetching, logic, and error UI for the
 * ID Verification (IDV) and Facial Age Estimation (FAE) upsell flows.
 */
const useAgeVerificationUpsell = (): UseAgeVerificationUpsellResult => {
  const dispatch = useAppDispatch();
  const { snackbarService } = useSnackbar();
  const { translate } = useTranslation();

  const [errorModal, errorModalService] = useSettingsInfoModal(
    commonTranslationConstants.modal.error.title,
    commonTranslationConstants.modal.error.body,
  );

  // Note: The idvAvailable and faeAvailable rules return false if the user is already age verified, which prevents us from upselling
  const { data: policyData, isLoading: isPolicyQueryLoading } =
    useGetAccountInfoAgeVerificationPolicyQuery();
  const faeAvailable = policyData?.faeAvailable ?? false;
  const idvAvailable = policyData?.idvAvailable ?? false;
  const vpcForFaeAvailable = policyData?.vpcForFaeAvailable ?? false;
  const undoAgeVerificationAvailable = policyData?.undoAgeVerificationAvailable ?? false;
  const acceptDownageAvailable = policyData?.acceptDownageAvailable ?? false;
  const requireIDReverification = policyData?.requireIDReverification ?? false;

  const { data: eligibleForAgeVerificationUndo = false, isLoading: isUndoEligibilityLoading } =
    useGetUndoAgeVerificationEligibilityQuery();

  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const faeDeeplinkFlowEnabled = uiPolicy?.faeDeeplinkFlowEnabled ?? false;
  const idvDeeplinkFlowEnabled = uiPolicy?.idvDeeplinkFlowEnabled ?? false;
  // Android-only kill-switches for the AMP wizard deep-link handoff (all default off).
  const disableAndroidDeeplink = uiPolicy?.disableAndroidDeeplink ?? false;
  const disableAndroidAccountInfoReturnpage =
    uiPolicy?.disableAndroidAccountInfoReturnpage ?? false;
  const disableAndroidReturnpage = uiPolicy?.disableAndroidReturnpage ?? false;
  // iOS-only kill-switches for the AMP wizard deep-link handoff (all default off).
  const disableIosDeeplink = uiPolicy?.disableIosDeeplink ?? false;
  const disableIosAccountInfoReturnpage = uiPolicy?.disableIosAccountInfoReturnpage ?? false;
  const disableIosReturnpage = uiPolicy?.disableIosReturnpage ?? false;

  const isLoading = isPolicyQueryLoading || isUndoEligibilityLoading;
  const [undoAgeVerification] = useUndoAgeVerificationMutation();
  const [acceptPendingDownage, { isLoading: isAcceptingDownage }] =
    useAcceptPendingDownageMutation();

  const invalidateCachedData = async (): Promise<TUserSettingsAndOptionsV2Body | undefined> => {
    let freshSettingsData: TUserSettingsAndOptionsV2Body | undefined;

    try {
      // Fetch fresh settingsAndOptionsV2 FIRST before invalidating tags
      // This prevents race conditions with invalidation-triggered refetches
      freshSettingsData = await dispatch(
        getUserSettingsAndOptionsV2.initiate(undefined, {
          forceRefetch: true,
          subscribe: false,
        }),
      ).unwrap();
    } catch (e) {
      // silence errors
    }

    const invalidCacheTags: (ApiCacheTag | FullTagDescription<ApiCacheTag>)[] = [
      ApiCacheTag.Birthdate,
      ApiCacheTag.AccountInfo,
      ApiCacheTag.VerifiedAge,
      ApiCacheTag.AccountInfoAgeVerificationPolicy,
      ApiCacheTag.AgeGroup,
      ApiCacheTag.UserSettings,
      ApiCacheTag.UserSettingsAndOptions,
      ...getAllParentalConsentsCacheTags(authenticatedUser.id!, ParentConsentStatus.Pending),
      ApiCacheTag.UndoAgeVerificationEligibility,
    ];
    dispatch(baseApi.util.invalidateTags(invalidCacheTags));

    try {
      // Refetch guac policies. Guac uses cache headers, so we need to change the URL to ensure we don't hit the disk cache
      const freshPolicyData = await dispatch(
        univeralAppConfigurationApi.endpoints.getSettingsUiPolicy.initiate(
          { bustCache: true },
          {
            forceRefetch: true,
          },
        ),
      ).unwrap();

      const freshAgeGroupData = await dispatch(
        accountInsightsApi.endpoints.getAgeGroup.initiate(
          { bustCache: true },
          { forceRefetch: true },
        ),
      ).unwrap();

      const freshAgeVerificationPolicyData = await dispatch(
        univeralAppConfigurationApi.endpoints.getAccountInfoAgeVerificationPolicy.initiate(
          { bustCache: true },
          {
            forceRefetch: true,
          },
        ),
      ).unwrap();

      // Since the endpoint is different, RTK cache will not update. So, we manually inject the newly fetched data into the RTK cache
      dispatch(
        univeralAppConfigurationApi.util.updateQueryData(
          "getSettingsUiPolicy",
          undefined, // This is RTK cache key
          () => freshPolicyData,
        ),
      );

      dispatch(
        univeralAppConfigurationApi.util.updateQueryData(
          "getAccountInfoAgeVerificationPolicy",
          undefined, // This is RTK cache key
          () => freshAgeVerificationPolicyData,
        ),
      );

      dispatch(
        accountInsightsApi.util.updateQueryData(
          "getAgeGroup",
          {}, // This is RTK cache key
          () => freshAgeGroupData,
        ),
      );
    } catch (e) {
      // silence errors, we just won't be able to hide upsells
    }

    return freshSettingsData;
  };

  const deviceMeta = DeviceMeta();
  // Gate the AMP wizard deep-link handoff on devices/builds where the native
  // Persona SDK is available — phone/tablet running inside the Roblox app,
  // excluding Amazon Appstore builds (no native Persona integration). When the
  // matching platform kill-switch is on, also exclude Android/iOS so FAE/IDV fall
  // back to the standard AccessManagementUpsellV2 flow.
  const isMobilePersonaSDKAvailable =
    (deviceMeta.isPhone || deviceMeta.isTablet) &&
    deviceMeta.isInApp &&
    !deviceMeta.isAmazonApp &&
    !(disableAndroidDeeplink && deviceMeta.isAndroidApp) &&
    !(disableIosDeeplink && deviceMeta.isIosApp);

  // The Persona SDK does not support landscape orientation on tablets, which
  // lowers IDV completion there, so exclude tablets from the IDV deep-link
  // handoff and let it fall back to the standard web flow.
  const isIdvPersonaSDKAvailable = isMobilePersonaSDKAvailable && !deviceMeta.isTablet;

  const buildAmpWizardDeepLink = (
    featureName: string,
    namespace: string,
    settingName?: string,
    settingValue?: string,
  ): string => {
    const baseDeepLink = `roblox://navigation/amp_wizard?feature_name=${featureName}&namespace=${namespace}&entry_point=settings`;

    // The Account Info FAE/IDV entry points call this without a settingName/value,
    // whereas the settings-change flow always passes them — so their absence marks
    // the Account Info source (no need to sniff the URL).
    const isAccountInfoSource = !settingName || !settingValue;

    // Per-platform kill-switches: omit the returnpage entirely, or only when the
    // user is coming from Account Info.
    const omitReturnpage =
      (deviceMeta.isAndroidApp &&
        (disableAndroidReturnpage ||
          (disableAndroidAccountInfoReturnpage && isAccountInfoSource))) ||
      (deviceMeta.isIosApp &&
        (disableIosReturnpage || (disableIosAccountInfoReturnpage && isAccountInfoSource)));
    if (omitReturnpage) {
      return baseDeepLink;
    }

    let returnPath = window.location.pathname.slice(1) + window.location.hash;
    if (settingName && settingValue) {
      const separator = returnPath.includes("?") ? "&" : "?";
      returnPath += `${separator}setting=${settingName}&value=${settingValue}`;
    }
    const returnPage = encodeURIComponent(returnPath);
    return `${baseDeepLink}&returnpage=${returnPage}`;
  };

  const handleFAEClick = (eventState?: string) => {
    if (faeDeeplinkFlowEnabled && isMobilePersonaSDKAvailable) {
      void DeepLinkService.navigateToDeepLink(
        buildAmpWizardDeepLink(
          AMPFeaturesConstants.ageEstimationAMPFeature,
          AMPFeaturesConstants.Namespaces.AgeCheck,
        ),
      );
      return;
    }

    accountInfoEventService.authButtonClickConfirmFae(eventState);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    verifyAgeButtonClickedFacialAgeEstimation();
    const ageEstimationFeatureParams = {
      featureName: AMPFeaturesConstants.ageEstimationAMPFeature,
      namespace: AMPFeaturesConstants.Namespaces.AgeCheck,
      isAsyncCall: false, // FAE is a sync flow
      featureSpecificData: {
        context: "settings",
        source: eventState,
      },
    };

    AccessManagementUpsellV2Service.startAccessManagementUpsell(ageEstimationFeatureParams)
      .catch(() => errorModalService.open())
      .finally(() => void invalidateCachedData());
  };

  const handleIDVClick = () => {
    if (idvDeeplinkFlowEnabled && isIdvPersonaSDKAvailable) {
      fireAgeCheckIdvDeeplinkCounter("handleIDVClick");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      verifyAgeButtonClickedIdVerificationDeeplink();
      void DeepLinkService.navigateToDeepLink(
        buildAmpWizardDeepLink(
          AMPFeaturesConstants.ageVerificationAMPFeature,
          AMPFeaturesConstants.Namespaces.AccountManagement,
        ),
      );
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    verifyAgeButtonClickedIdVerification();
    const ageVerificationFeatureParams = {
      featureName: AMPFeaturesConstants.ageVerificationAMPFeature,
      namespace: AMPFeaturesConstants.Namespaces.AccountManagement,
    };
    AccessManagementUpsellV2Service.startAccessManagementUpsell(ageVerificationFeatureParams)
      .catch(() => errorModalService.open())
      .finally(() => void invalidateCachedData());
  };

  const handleVpcForFaeClick = (eventState?: string) => {
    AccessManagementUpsellV2Service.startAccessManagementUpsell({
      featureName: AMPFeaturesConstants.settingChangeAmpFeature,
      namespace: AMPFeaturesConstants.Namespaces.SettingsChange,
      isAsyncCall: true,
      usePrologue: true,
      ampRecourseData: { [UserSetting.allowFacialAgeEstimation]: EnabledStatusValue.Enabled },
      featureSpecificData: {
        source: eventState,
      },
    } as any)
      .catch(() => errorModalService.open())
      .finally(() => void invalidateCachedData());
  };

  const handleAgeCheckUpsells = async ({
    settingName,
    optionValue,
    requiredActions,
    usePrologue,
    onComplete,
  }: TRequiredActionsUpsellParams): Promise<boolean> => {
    if (
      !requiredActions ||
      requiredActions.length === 0 ||
      optionValue === undefined ||
      optionValue === null
    ) {
      return false;
    }

    const requiresFae = requiredActions.includes(RequirementType.FacialAgeEstimation);
    const requiresIdVerification = requiredActions.includes(RequirementType.IdVerification);

    if (!requiresFae && !requiresIdVerification) {
      return false;
    }

    const requiresParentalConsent = hasParentalRequirement(requiredActions);

    let featureName: string | undefined;
    let namespace: string | undefined;
    let shouldUsePrologue = usePrologue ?? true;
    const featureSpecificData: Record<string, unknown> = { context: "settings" };

    if (requiresFae) {
      if (faeDeeplinkFlowEnabled && isMobilePersonaSDKAvailable) {
        void DeepLinkService.navigateToDeepLink(
          buildAmpWizardDeepLink(
            AMPFeaturesConstants.ageEstimationAMPFeature,
            AMPFeaturesConstants.Namespaces.AgeCheck,
            settingName,
            optionValue as string,
          ),
        );
        return true;
      }
      featureName = AMPFeaturesConstants.ageEstimationAMPFeature;
      namespace = AMPFeaturesConstants.Namespaces.AgeCheck;
    } else if (requiresIdVerification) {
      if (idvDeeplinkFlowEnabled && isIdvPersonaSDKAvailable) {
        fireAgeCheckIdvDeeplinkCounter(settingName);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        verifyAgeButtonClickedIdVerificationDeeplink();
        void DeepLinkService.navigateToDeepLink(
          buildAmpWizardDeepLink(
            AMPFeaturesConstants.ageVerificationAMPFeature,
            AMPFeaturesConstants.Namespaces.AccountManagement,
            settingName,
            optionValue as string,
          ),
        );
        return true;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      verifyAgeButtonClickedIdVerification();
      featureName = AMPFeaturesConstants.ageVerificationAMPFeature;
      namespace = AMPFeaturesConstants.Namespaces.AccountManagement;
    }

    if (!featureName || !namespace) {
      return false;
    }

    if (requiresIdVerification && (!requiresParentalConsent || !shouldUsePrologue)) {
      shouldUsePrologue = false;
    }

    const success = await AccessManagementUpsellV2Service.startAccessManagementUpsell({
      featureName,
      namespace,
      ampRecourseData: { [settingName]: optionValue },
      featureSpecificData,
      isAsyncCall: false, // FAE is a sync flow
      usePrologue: shouldUsePrologue,
    } as any).catch(() => errorModalService.open());

    const freshSettingsData = await invalidateCachedData();
    if (success) {
      await onComplete?.(freshSettingsData);
    }

    return true;
  };

  const handleUndoAgeVerificationClick = async (descriptionKey: string) => {
    await undoAgeVerification()
      .unwrap()
      .catch(() => {
        snackbarService.warning(translate(descriptionKey));
      })
      .finally(() => void invalidateCachedData());
  };

  const handleAcceptDownageClick = (errorMessage?: string) => {
    acceptPendingDownage()
      .unwrap()
      .catch(() => {
        if (errorMessage) {
          snackbarService.warning(errorMessage);
        } else {
          errorModalService.open();
        }
      })
      .finally(() => void invalidateCachedData());
  };

  return {
    faeAvailable,
    idvAvailable,
    vpcForFaeAvailable,
    undoAgeVerificationAvailable,
    acceptDownageAvailable,
    requireIDReverification,
    isLoading,
    handleFAEClick,
    handleIDVClick,
    handleVpcForFaeClick,
    handleAgeCheckUpsells,
    errorModal,
    eligibleForAgeVerificationUndo,
    handleUndoAgeVerificationClick,
    handleAcceptDownageClick,
    isAcceptingDownage,
  };
};

export default useAgeVerificationUpsell;
