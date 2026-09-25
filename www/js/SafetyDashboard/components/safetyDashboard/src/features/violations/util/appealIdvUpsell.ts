import { AccessManagementUpsellV2Service } from "@rbx/legacy-webapp-types/Roblox";
import { userId } from "@rbx/core-scripts/meta/user";
import { AmpConfig } from "../../../api/useAppealEligibility";
import {
  getSettingsAndOptions,
  SettingsAndOptionsResponse,
} from "../../../api/useGetSettingsAndOptions";

/** Used when the eligibility response omits a namespace. */
export const ALT_APPEAL_NAMESPACE = "account_management/AccountManagement";

/** Dummy rule whose denial raises the parent-consent (VPC) recourse. */
export const SETTING_CHANGE_FEATURE = "CanChangeSetting";
export const SETTING_CHANGE_NAMESPACE = "account_management/SettingsChange";

const APPEAL_SETTING_NAME = "allowIdentityVerification";
const APPEAL_SETTING_VALUE = "Enabled";

interface StartAppealIdvUpsellParams {
  ampConfig: AmpConfig;
  violationId: string;
  onVerified: () => void;
  onError?: () => void;
}

const isTrueOption = (value: unknown): boolean => {
  if (value === true) {
    return true;
  }

  return typeof value === "string" && ["true", "enabled"].includes(value.toLowerCase());
};

const isSettingEnabled = (
  settingsAndOptions: SettingsAndOptionsResponse,
  settingName: string,
): boolean => isTrueOption(settingsAndOptions[settingName]?.currentValue);

const trueOptionRequiresParentalConsent = (
  settingsAndOptions: SettingsAndOptionsResponse,
  settingName: string,
): boolean =>
  settingsAndOptions[settingName]?.options?.some(
    ({ option, requiredActions }) =>
      isTrueOption(option.optionValue) && requiredActions?.includes("ParentalConsent"),
  ) ?? false;

const startUpsell = (
  service: typeof AccessManagementUpsellV2Service,
  params: Parameters<typeof service.startAccessManagementUpsell>[0],
  onVerified: () => void,
  onError?: () => void,
): void => {
  service
    .startAccessManagementUpsell(params)
    .then(success => {
      if (success) {
        onVerified();
      }
    })
    .catch(() => {
      onError?.();
    });
};

/**
 * Resolves any settings/VPC prerequisite, then starts the appeal IDV wizard.
 *
 *   1. Read `allowIdentityVerification`.
 *   2. If it is off and the Enabled option needs ParentalConsent, run
 *      `CanChangeSetting` so the wizard gathers VPC, then chain into the appeal
 *      rule. AMP is not told the setting name; it only lives on ampRecourseData.
 *   3. Otherwise start the appeal rule so the wizard mounts IDV.
 *
 * Under-18 users with the setting off therefore get VPC first. Everyone else
 * (setting already on, or no consent required) goes straight to IDV.
 */
export const startAppealIdvUpsell = ({
  ampConfig,
  violationId,
  onVerified,
  onError,
}: StartAppealIdvUpsellParams): void => {
  // The global is unavailable until its script loads.
  const service = AccessManagementUpsellV2Service as
    | typeof AccessManagementUpsellV2Service
    | undefined;

  if (!service?.startAccessManagementUpsell) {
    onError?.();
    return;
  }

  const namespace = ampConfig.namespace || ALT_APPEAL_NAMESPACE;
  const ampFeatureCheckData = [
    {
      name: "violation",
      type: "String",
      value: `users/${userId()}/violations/${violationId}`,
    },
  ];

  /*
   * Run the appeal rule so the wizard mounts IDV. `wizardIntent` selects the
   * IdvAppeal Persona template and is never sent to AMP. Consent passes this as
   * its success callback, so IDV starts only once consent has been granted.
   */
  const startAppealIdv = (): void => {
    startUpsell(
      service,
      {
        featureName: ampConfig.featureName,
        namespace,
        wizardIntent: "appeals",
        isAsyncCall: false,
        ampFeatureCheckData,
      },
      onVerified,
      onError,
    );
  };

  getSettingsAndOptions(APPEAL_SETTING_NAME)
    .then(settingsAndOptions => {
      if (
        !isSettingEnabled(settingsAndOptions, APPEAL_SETTING_NAME) &&
        trueOptionRequiresParentalConsent(settingsAndOptions, APPEAL_SETTING_NAME)
      ) {
        startUpsell(
          service,
          {
            featureName: SETTING_CHANGE_FEATURE,
            namespace: SETTING_CHANGE_NAMESPACE,
            isAsyncCall: false,
            usePrologue: true,
            ampRecourseData: {
              [APPEAL_SETTING_NAME]: APPEAL_SETTING_VALUE,
            },
          },
          startAppealIdv,
          onError,
        );
        return;
      }

      startAppealIdv();
    })
    .catch(() => {
      onError?.();
    });
};
