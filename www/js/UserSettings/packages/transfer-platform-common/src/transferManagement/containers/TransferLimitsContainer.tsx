import type React from "react";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ProgressCircle } from "@rbx/foundation-ui";
import { queryClient, useTranslation } from "@rbx/core-scripts/react";
import {
  clampRobuxTransferLimitsToTier,
  isRobuxTransferLimitParentBound,
  type TRobuxTransferLimitsInput,
} from "@rbx/user-settings";
import translationConstants from "../../core/constants/translationConstants";
import { getUserTransferLimit } from "../../core/services/transferLimitService";
import {
  appliesAccountStanding,
  parseHigherLimitsIneligibilityReason,
  resolveTransferLimitCta,
} from "../../core/types/transferLimitTypes";
import TransferLimitsSection from "../components/TransferLimitsSection";
import useAskParentRequest from "../hooks/useAskParentRequest";
import useCanAskParentForTransferLimits from "../hooks/useCanAskParentForTransferLimits";

/**
 * The stored caps a parent has configured for this user.
 *
 * Supplied by the host rather than read here: the settings page already holds
 * the whole settings-and-options body, so the tab would be asking user-settings
 * a second time for something it has. A failed read is passed through rather
 * than smoothed over, because treating an unreadable setting as "no caps" would
 * show a capped user their tier ceilings and hide the ask-parent row with
 * nothing on screen to say so.
 */
export type TStoredRobuxTransferLimits = {
  caps: TRobuxTransferLimitsInput | undefined;
  isLoading: boolean;
  isError: boolean;
};

type TTransferLimitsContainerProps = {
  storedLimits: TStoredRobuxTransferLimits;
};

const TransferLimitsContainerContent = ({
  storedLimits,
}: TTransferLimitsContainerProps): React.JSX.Element => {
  const { translate } = useTranslation();
  const {
    data: tierLimit,
    isLoading: isTierLimitLoading,
    isError: isTierLimitError,
  } = useQuery({
    queryKey: ["userTransferLimit"],
    queryFn: getUserTransferLimit,
  });
  const {
    caps: storedCaps,
    isLoading: isStoredCapsLoading,
    isError: isStoredCapsError,
  } = storedLimits;

  // Neither half is worth anything alone: the ceilings are only the limits in
  // force once it is known that no parent's cap sits below them.
  const caps =
    tierLimit?.dailyLimit === undefined ||
    tierLimit.monthlyLimit === undefined ||
    storedCaps === undefined
      ? undefined
      : {
          stored: storedCaps,
          tier: { daily: tierLimit.dailyLimit, monthly: tierLimit.monthlyLimit },
        };
  // Unresolved caps read as unbound, which holds the ask-parent read back until
  // there is an answer to gate it on.
  const isParentBound =
    caps !== undefined && isRobuxTransferLimitParentBound(caps.stored, caps.tier);

  const canAskParent = useCanAskParentForTransferLimits(isParentBound);
  const askParentRequest = useAskParentRequest(canAskParent === true);

  // Which numbers this tab reports now waits on the grant, so a parent-bound
  // child has nothing to show until it lands. Quoting the ceilings first and
  // replacing them with the cap a moment later would name a spendable figure
  // that is not one — a late call to action is recoverable, a limit that changes
  // under the child's eyes is not. `undefined` only ever arises for a
  // parent-bound child, since the read is gated on binding.
  const isAskEligibilityLoading = canAskParent === undefined;

  if (isTierLimitLoading || isStoredCapsLoading || isAskEligibilityLoading) {
    return (
      <div className="flex width-full justify-center padding-y-small">
        <ProgressCircle ariaLabel="Loading" size="Medium" variant="Indeterminate" />
      </div>
    );
  }

  const { isEligibleForHigherLimitsUpsell, higherLimitsIneligibilityReason } = tierLimit ?? {};

  if (
    isTierLimitError ||
    isStoredCapsError ||
    caps === undefined ||
    isEligibleForHigherLimitsUpsell === undefined
  ) {
    return (
      <span className="text-body-small content-system-alert">
        {translate(translationConstants.loadingError)}
      </span>
    );
  }

  // The grant gates the feature, not merely the ask: until AMP allows a parent to
  // manage this child's limits, the tab reports the tier ceilings and offers 2SV
  // exactly as it did before parent-configurable limits existed. Only a granted
  // child has a parent's cap named as their limit.
  //
  // Withholding it costs nothing for a child no cap binds, which is why the grant
  // can stay gated on binding: with nothing sitting below the ceilings, clamping
  // returns them unchanged and both branches agree.
  const effectiveCaps = canAskParent
    ? clampRobuxTransferLimitsToTier(caps.stored, caps.tier)
    : caps.tier;

  return (
    <TransferLimitsSection
      dailyLimit={effectiveCaps.daily}
      monthlyLimit={effectiveCaps.monthly}
      cta={resolveTransferLimitCta({
        isParentBound,
        canAskParent,
        isEligibleForHigherLimitsUpsell,
      })}
      higherLimitsIneligibilityReason={
        appliesAccountStanding({ isParentBound, canAskParent })
          ? parseHigherLimitsIneligibilityReason(higherLimitsIneligibilityReason)
          : null
      }
      askParentRequest={askParentRequest}
    />
  );
};

const TransferLimitsContainer = ({
  storedLimits,
}: TTransferLimitsContainerProps): React.JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <TransferLimitsContainerContent storedLimits={storedLimits} />
    </QueryClientProvider>
  );
};

export default TransferLimitsContainer;
