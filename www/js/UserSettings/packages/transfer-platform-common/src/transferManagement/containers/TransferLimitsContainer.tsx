import type React from "react";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ProgressCircle } from "@rbx/foundation-ui";
import { queryClient, useTranslation } from "@rbx/core-scripts/react";
import translationConstants from "../../core/constants/translationConstants";
import { getUserTransferLimit } from "../../core/services/transferLimitService";
import { parseHigherLimitsIneligibilityReason } from "../../core/types/transferLimitTypes";
import TransferLimitsSection from "../components/TransferLimitsSection";

const TransferLimitsContainerContent = (): React.JSX.Element => {
  const { translate } = useTranslation();
  const {
    data: transferLimit,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userTransferLimit"],
    queryFn: getUserTransferLimit,
  });

  if (isLoading) {
    return (
      <div className="flex width-full justify-center padding-y-small">
        <ProgressCircle ariaLabel="Loading" size="Medium" variant="Indeterminate" />
      </div>
    );
  }

  const {
    dailyLimit,
    monthlyLimit,
    isEligibleForHigherLimitsUpsell,
    higherLimitsIneligibilityReason,
  } = transferLimit ?? {};

  if (
    isError ||
    dailyLimit === undefined ||
    monthlyLimit === undefined ||
    isEligibleForHigherLimitsUpsell === undefined
  ) {
    return (
      <span className="text-body-small content-system-alert">
        {translate(translationConstants.loadingError)}
      </span>
    );
  }

  return (
    <TransferLimitsSection
      dailyLimit={dailyLimit}
      monthlyLimit={monthlyLimit}
      isEligibleForHigherLimitsUpsell={isEligibleForHigherLimitsUpsell}
      higherLimitsIneligibilityReason={parseHigherLimitsIneligibilityReason(
        higherLimitsIneligibilityReason,
      )}
    />
  );
};

const TransferLimitsContainer = (): React.JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <TransferLimitsContainerContent />
    </QueryClientProvider>
  );
};

export default TransferLimitsContainer;
