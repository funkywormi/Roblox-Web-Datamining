import { useQuery } from "@tanstack/react-query";
import { getCanParentManageChildRobuxTransferLimits } from "../../core/services/accessManagementService";

const askParentAccessQueryKey = ["canAskParentForTransferLimits"];

/**
 * Whether AMP grants parent-configurable transfer limits for this child.
 *
 * The single grant behind the whole feature on this tab: it decides both which
 * limits are reported — a parent's cap, or the tier ceilings that stood before
 * the feature existed — and whether the ask-parent call to action is offered.
 *
 * `undefined` while the read is in flight, which is not the same as `false`: a
 * negative answer sends a parent-bound child back to the tier ceilings and the
 * account-standing call to action, and settling on that before the answer
 * arrives would show a limit and then change it. A failed read counts as
 * negative, so an access-management outage leaves the tab behaving as it did
 * before this feature shipped.
 *
 * @param isEnabled Whether the question can arise at all — a parent's cap has
 * been found to bind one of the child's windows. Gating the read on it keeps
 * every other viewer of the Robux tab off access-management.
 */
const useCanAskParentForTransferLimits = (isEnabled: boolean): boolean | undefined => {
  const { data: isGranted, isInitialLoading } = useQuery({
    queryKey: askParentAccessQueryKey,
    queryFn: getCanParentManageChildRobuxTransferLimits,
    enabled: isEnabled,
  });

  if (!isEnabled) {
    return false;
  }

  return isInitialLoading ? undefined : isGranted === true;
};

export default useCanAskParentForTransferLimits;
