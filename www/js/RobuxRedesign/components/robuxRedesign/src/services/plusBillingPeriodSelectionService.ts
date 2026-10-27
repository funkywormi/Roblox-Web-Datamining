import { getCurrentUser } from "@rbx/www-common/user";
import ExperimentationService from "@rbx/experimentation";
import { trackCounter, trackError } from "../observability";

export const PLUS_BILLING_PERIOD_SELECTION_LAYER = "Payments.BuyRobux.PlusBillingPeriodSelection";
const ExperimentParameterName = "plusBillingPeriodSelectionVariant";

export class PlusBillingPeriodSelectionService {
  private isEnrolled = false;

  private isResolved = false;

  private hasLoggedExposure = false;

  private assignment: Promise<boolean> | undefined;

  isTreatment(): Promise<boolean> {
    this.assignment ??= this.fetchIsTreatment().finally(() => {
      this.isResolved = true;
    });
    return this.assignment;
  }

  private async fetchIsTreatment(): Promise<boolean> {
    if (!getCurrentUser()?.id) {
      return false;
    }

    try {
      const res = await ExperimentationService.getAllValuesForLayer(
        PLUS_BILLING_PERIOD_SELECTION_LAYER,
      );
      const variant = res[ExperimentParameterName];
      if (variant !== 0 && variant !== 1) {
        trackCounter("PlusBillingPeriodSelectionExperimentEvaluated", { variant: "unknown" });
        return false;
      }
      this.isEnrolled = true;
      trackCounter("PlusBillingPeriodSelectionExperimentEvaluated", {
        variant: variant.toString(),
      });
      return variant === 1;
    } catch (error) {
      trackError("PlusBillingPeriodSelectionExperimentFetchFailed", null, error);
      return false;
    }
  }

  logLayerExposure() {
    if (!this.isResolved) {
      trackCounter("PlusBillingPeriodSelectionExposureBeforeAssignment");
      return;
    }
    if (!this.isEnrolled || this.hasLoggedExposure) {
      return;
    }
    this.hasLoggedExposure = true;
    try {
      ExperimentationService.logLayerExposure(PLUS_BILLING_PERIOD_SELECTION_LAYER);
      trackCounter("PlusBillingPeriodSelectionExperimentExposed");
    } catch (error) {
      this.hasLoggedExposure = false;
      throw error;
    }
  }
}

export const plusBillingPeriodSelectionService = new PlusBillingPeriodSelectionService();
