import { useCallback, useEffect, useRef, useState } from "react";
import { DeviceMeta } from "Roblox";
import { useSettingsModal, RequirementType, UserSetting } from "@rbx/user-settings";
import { TSettingConsentRequirementsV2 } from "../../apis/slices/parentalConsentSlice";
import { getQueryParamsFromUrl, removeQueryParamFromUrl } from "../utils/navigationUtils";
import { useGetSettingsUiPolicyQuery } from "../../apis/universalAppConfigurationApi";
import commonTranslationConstants from "../constants/contentConstants/commonTranslationConstants";
import { useWrappedTranslation } from "./useWrappedTranslation";

const SETTING_PARAM = "setting";
const VALUE_PARAM = "value";

/**
 * Reads `?setting=X&value=Y` from the URL and auto-triggers an update
 * when the target setting matches. Consumes the params after firing so
 * the update only runs once.
 *
 * Skips the update if the target value still requires age verification
 * (the user returned from the AMP wizard without completing it).
 *
 * Skips the update when the page is being speculatively prerendered
 * (Chrome / Edge speculation rules) so a prerendered navigation cannot
 * silently apply the setting before the user actually lands on the page.
 *
 * By default a confirmation modal is shown before the update is applied;
 * the caller must render the returned modal element. Setting the
 * `disableAutoSettingUpdateModal` UI policy flag bypasses the modal and
 * applies the update immediately.
 */
const useAutoSettingUpdate = (
  settingName: UserSetting,
  updateFn: (value: string) => Promise<void> | void,
  isReady: boolean,
  consentRequirements?: TSettingConsentRequirementsV2,
  translatedSettingLabel?: string,
): JSX.Element | null => {
  const { translate } = useWrappedTranslation();
  const hasFired = useRef(false);
  const [pendingValue, setPendingValue] = useState<string | null>(null);

  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const modalEnabled = !(uiPolicy?.disableAutoSettingUpdateModal ?? false);

  const runUpdate = useCallback(
    (value: string) => {
      // eslint-disable-next-line no-void
      void updateFn(value);
    },
    [updateFn],
  );

  const settingLabelPlaceholder = { settingName: translatedSettingLabel ?? "" };

  const [modal, modalService] = useSettingsModal({
    translatedTitle:
      translate(
        commonTranslationConstants.modal.autoUpdateConfirmation.title,
        settingLabelPlaceholder,
      ) || `Continue updating ${settingLabelPlaceholder.settingName}?`,
    translatedBody:
      translate(
        commonTranslationConstants.modal.autoUpdateConfirmation.body,
        settingLabelPlaceholder,
      ) || `Confirm to finish updating your ${settingLabelPlaceholder.settingName} setting`,
    translatedActionButtonText: translate(commonTranslationConstants.continue),
    translatedSecondaryButtonText: translate(commonTranslationConstants.cancel),
    translatedCloseLabel: translate(commonTranslationConstants.modal.closeBtn),
    size: "Small",
    onAction: () => {
      if (pendingValue !== null) {
        runUpdate(pendingValue);
      }
      setPendingValue(null);
    },
    onSecondary: () => setPendingValue(null),
    onDismiss: () => setPendingValue(null),
  });

  useEffect(() => {
    if (!isReady || hasFired.current) {
      return;
    }

    // Skip during speculative prerender so a prerendered navigation
    // cannot apply the setting before the user activates the page.
    if ((document as Document & { prerendering?: boolean }).prerendering) {
      return;
    }

    // Only auto-update when returning from the AMP wizard deep-link flow,
    // which is only reachable from the mobile webview.
    const deviceMeta = DeviceMeta();
    const isMobileDevice = deviceMeta.isPhone || deviceMeta.isTablet;
    if (!deviceMeta.isInApp || !isMobileDevice) {
      return;
    }

    const params = getQueryParamsFromUrl(window.location.href);
    const targetSetting = params.get(SETTING_PARAM);
    const targetValue = params.get(VALUE_PARAM);

    if (targetSetting !== settingName || !targetValue) {
      return;
    }

    hasFired.current = true;
    removeQueryParamFromUrl(SETTING_PARAM);
    removeQueryParamFromUrl(VALUE_PARAM);

    const requiredActions = consentRequirements?.[settingName]?.[targetValue];
    const requiresAgeVerification = requiredActions?.some(
      action =>
        action === RequirementType.FacialAgeEstimation || action === RequirementType.IdVerification,
    );
    if (requiresAgeVerification) {
      return;
    }

    // Only show the confirmation modal when no further recourse (e.g.
    // parental consent) is required. When recourse is required, the
    // downstream update flow will surface its own interactive prompt,
    // so we apply the update directly and let it drive the UI.
    const hasRemainingRecourse = (requiredActions?.length ?? 0) > 0;
    if (modalEnabled && !hasRemainingRecourse) {
      setPendingValue(targetValue);
      modalService.open();
      return;
    }

    runUpdate(targetValue);
  }, [settingName, runUpdate, isReady, consentRequirements, modalEnabled, modalService]);

  return modalEnabled ? modal : null;
};

export default useAutoSettingUpdate;
