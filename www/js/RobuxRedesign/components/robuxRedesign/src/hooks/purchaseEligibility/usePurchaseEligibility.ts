/* eslint-disable no-void */
import { useCallback, useContext, useEffect, useState } from "react";
import { useSystemFeedback } from "@rbx/core-ui";
import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";
import { useTranslation } from "@rbx/core-scripts/react";
import { RequirementType } from "@rbx/user-settings";
import {
  checkUserPurchaseSetting,
  UserPurchaseSettingFailureReason,
} from "../../services/paymentsGatewayService";
import { getConsentRequest as getConsentRequiredRequest } from "../../services/parentalControlsService";
import { getEnablePurchasesSetting } from "../../services/userSettingsService";
import { getTexasU18VPCOptimizationFlowPolicy } from "../../services/guacService";
import { isInApp, isOnDesktop } from "../../utils/platform";
import { SETTING_CHANGE_AMP_NAMESPACE } from "../../constants";
import { ModalContext } from "../../contexts/ModalContext";
import { TrackingContext } from "../../contexts/TrackingContext";
import { trackCounter, trackError } from "../../observability";

function getViolationLabel(violation: UserPurchaseSettingFailureReason) {
  switch (violation) {
    case UserPurchaseSettingFailureReason.FraudPaymentAuthorizationAttempt:
      return "Label.Sublabel.FraudPaymentAbuse";
    case UserPurchaseSettingFailureReason.FraudVirtualEconomyAbuse:
      return "Label.Sublabel.FraudVirtualEconomyAbuse";
    case UserPurchaseSettingFailureReason.FraudAbuseOfAffiliateSystem:
      return "Label.Sublabel.FraudAbuseOfTheAffiliateSystem";
    case UserPurchaseSettingFailureReason.FraudAttemptedUnauthorizedPaymentMethodUse:
      return "Label.Sublabel.FraudAttemptedUnauthorizedPaymentMethodUse";
    case UserPurchaseSettingFailureReason.FraudRepeatedRefundRequests:
      return "Label.Sublabel.FraudRepeatedRefundRequests";
    case UserPurchaseSettingFailureReason.FraudSuspiciousRefundRequests:
      return "Label.Sublabel.FraudSuspiciousRefundRequests";
    case UserPurchaseSettingFailureReason.FraudUnauthorizedPurchase:
      return "Label.Sublabel.FraudUnauthorizedPurchase";
    case UserPurchaseSettingFailureReason.FraudUseOfUnauthorizedOffPlatformTransactions:
      return "Label.Sublabel.FraudUseOfUnauthorizedOffPlatformTransactions";
    case UserPurchaseSettingFailureReason.FraudUseOfUnauthorizedPaymentMethod:
      return "Label.Sublabel.FraudUseOfUnauthorizedPaymentMethod";
    case UserPurchaseSettingFailureReason.FraudSuspiciousAccountPatterns:
      return "Label.Sublabel.FraudSuspiciousAccountPatterns";
    case UserPurchaseSettingFailureReason.FraudChargeback:
      return "Label.AbuseType.Chargeback";
    case UserPurchaseSettingFailureReason.None:
    case UserPurchaseSettingFailureReason.PurchaseNotEnabled:
    case UserPurchaseSettingFailureReason.SpendLimitExceeded:
      return "";
    default:
      return "Label.Sublabel.FraudPaymentAbuse";
  }
}

export function usePurchaseEligibility(): {
  isUserEligibleForPurchase: () => Promise<boolean>;
} {
  const {
    purchaseDisabled: { openModal: openPurchaseDisabledModal },
  } = useContext(ModalContext);
  const { trackEconomicRestrictionErrorShown } = useContext(TrackingContext);

  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();

  const [vpcOptimizationEnabled, setVPCOptimizationEnabled] = useState<boolean | undefined>();

  const fetchParentalConsentRequiredForSettingUpdate = useCallback(async (): Promise<boolean> => {
    if (!CurrentUser) {
      return false;
    }

    return Boolean(await getConsentRequiredRequest(CurrentUser.userId, "UpdateUserSetting"));
  }, []);

  const fetchPurchasingDisabledBySelf = useCallback(async (): Promise<boolean> => {
    const enablePurchasesSetting = await getEnablePurchasesSetting();
    if (!enablePurchasesSetting?.enablePurchases) {
      return false;
    }

    const { currentValue, options } = enablePurchasesSetting.enablePurchases;

    return options.some(
      ({ option: { optionValue }, requirement }) =>
        optionValue !== currentValue && requirement === RequirementType.SelfUpdateSetting,
    );
  }, []);

  const showVPCOptimization = useCallback(async (): Promise<void> => {
    const { texasU18VPCOptimizationEnabled, texasU18VPCOptimizationEnabledForEveryone } =
      await getTexasU18VPCOptimizationFlowPolicy();

    setVPCOptimizationEnabled(
      Boolean(texasU18VPCOptimizationEnabled && texasU18VPCOptimizationEnabledForEveryone),
    );
  }, []);

  const startAccessManagementUpsellFlow = useCallback(async (): Promise<void> => {
    try {
      await window.Roblox.AccessManagementUpsellV2Service?.startAccessManagementUpsell({
        ampRecourseData: {
          enablePurchases: "Enabled",
        },
        featureName: "CanChangeSetting",
        namespace: SETTING_CHANGE_AMP_NAMESPACE,
        isAsyncCall: false,
        usePrologue: true,
      });
    } catch (e) {
      trackError("AccessManagementUpsellException", null, e);
    }
  }, []);

  const isUserEligibleForPurchase = useCallback(async (): Promise<boolean> => {
    // Only IOS/Android/UWP webview (native purchase) needs to respect this setting.
    // If on Desktop (web or UA), or not in app, we ignore this vpc setting for this page.
    // Desktop and not in app will be blocked at **payment method selection page**.
    if (isOnDesktop || !isInApp) {
      return true;
    }

    const userPurchaseSetting = await checkUserPurchaseSetting();
    if (!userPurchaseSetting) {
      trackCounter("PurchaseEligibilityFailedToFetch");
      systemFeedbackService.warning(translate("Heading.GeneralError"));
      return false;
    }

    if (userPurchaseSetting.expirationTimeInMinutes) {
      trackEconomicRestrictionErrorShown();

      const timeoutInHours = Math.ceil(userPurchaseSetting.expirationTimeInMinutes / 60);
      const violation = getViolationLabel(userPurchaseSetting.failureReason);
      systemFeedbackService.warning(
        timeoutInHours > 24
          ? translate("Text.EconomicRestrictionsDays", {
              day: Math.ceil(timeoutInHours / 24),
              violation,
            })
          : translate("Text.EconomicRestrictionsHours", {
              hour: timeoutInHours,
              violation,
            }),
      );
      trackCounter("EconomicRestrictionModalShown");
      return false;
    }

    if (userPurchaseSetting.isEligible) {
      return true;
    }

    const parentalConsentRequiredForSettingUpdate =
      await fetchParentalConsentRequiredForSettingUpdate();
    const purchasingDisabledBySelf = await fetchPurchasingDisabledBySelf();

    if (
      vpcOptimizationEnabled &&
      !parentalConsentRequiredForSettingUpdate &&
      !purchasingDisabledBySelf &&
      userPurchaseSetting.failureReason === UserPurchaseSettingFailureReason.PurchaseNotEnabled
    ) {
      trackCounter("AccessManagementUpsellModalShown");
      await startAccessManagementUpsellFlow();
      return false;
    }

    if (
      vpcOptimizationEnabled &&
      purchasingDisabledBySelf &&
      userPurchaseSetting.failureReason === UserPurchaseSettingFailureReason.PurchaseNotEnabled
    ) {
      trackCounter("PurchaseDisabledModalShownDisabledBySelf");
      openPurchaseDisabledModal(vpcOptimizationEnabled, purchasingDisabledBySelf);
      return false;
    }

    if (
      parentalConsentRequiredForSettingUpdate ||
      userPurchaseSetting.failureReason === UserPurchaseSettingFailureReason.PurchaseNotEnabled
    ) {
      trackCounter("PurchaseDisabledModalShownParentalConsent");
      openPurchaseDisabledModal(Boolean(vpcOptimizationEnabled), purchasingDisabledBySelf);
      return false;
    }

    // If this is reached, this means the user is generically ineligible
    trackCounter("PurchaseEligibility", {
      failureReason: userPurchaseSetting.failureReason,
    });
    systemFeedbackService.warning(translate("Heading.GeneralError"));
    return false;
  }, [
    trackEconomicRestrictionErrorShown,
    systemFeedbackService,
    translate,
    fetchParentalConsentRequiredForSettingUpdate,
    fetchPurchasingDisabledBySelf,
    vpcOptimizationEnabled,
    startAccessManagementUpsellFlow,
    openPurchaseDisabledModal,
  ]);

  useEffect(() => {
    void showVPCOptimization();
  }, [showVPCOptimization]);

  return {
    isUserEligibleForPurchase,
  };
}
