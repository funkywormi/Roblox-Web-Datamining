import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { trackCounter, trackError } from "../observability";
import { waitForExperimentationService } from "./experimentationService";

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
    if (!authenticatedUser()?.id) {
      return false;
    }

    try {
      const service = await waitForExperimentationService();
      const res = await service.getAllValuesForLayer(PLUS_BILLING_PERIOD_SELECTION_LAYER);
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

  async logLayerExposure() {
    if (!this.isResolved) {
      trackCounter("PlusBillingPeriodSelectionExposureBeforeAssignment");
      return;
    }
    if (!this.isEnrolled || this.hasLoggedExposure) {
      return;
    }
    this.hasLoggedExposure = true;
    try {
      const service = await waitForExperimentationService();
      service.logLayerExposure(PLUS_BILLING_PERIOD_SELECTION_LAYER);
      trackCounter("PlusBillingPeriodSelectionExperimentExposed");
    } catch (error) {
      this.hasLoggedExposure = false;
      throw error;
    }
  }
}

export const plusBillingPeriodSelectionService = new PlusBillingPeriodSelectionService();
