import { useCallback, useEffect, useState } from "react";

import { trackError } from "../../observability";
import { plusBillingPeriodSelectionService } from "../../services/plusBillingPeriodSelectionService";

export type PlusBillingPeriodSelection = {
  isTreatment: boolean;
  logExposure: () => void;
};

export function usePlusBillingPeriodSelection(isEligible: boolean): PlusBillingPeriodSelection {
  const [isTreatment, setIsTreatment] = useState(false);

  useEffect(() => {
    if (!isEligible) {
      return;
    }
    // eslint-disable-next-line no-void
    void (async () => {
      setIsTreatment(await plusBillingPeriodSelectionService.isTreatment());
    })();
  }, [isEligible]);

  const logExposure = useCallback(() => {
    if (!isEligible) {
      return;
    }
    plusBillingPeriodSelectionService.logLayerExposure().catch((error: unknown) => {
      trackError("PlusBillingPeriodSelectionLayerExposureError", null, error);
    });
  }, [isEligible]);

  return { isTreatment: isEligible && isTreatment, logExposure };
}
