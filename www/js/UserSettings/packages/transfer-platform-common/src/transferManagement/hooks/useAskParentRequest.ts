import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelAskParentRequest,
  getPendingAskParentRequest,
  submitAskParentRequest,
} from "../../core/services/askParentService";
import type { TAskParentRequestControls } from "../../core/types/askParentTypes";

const askParentRequestQueryKey = ["robuxTransferLimitsAskParentRequest"];

/**
 * Drives the child's ask-parent row: whether an ask is already outstanding, and
 * the two actions that change that.
 *
 * Returns undefined until the read settles, which leaves the row inert. A child
 * who already has an unanswered ask must not be able to send a second one, and
 * until the read comes back we cannot tell.
 *
 * @param isEnabled Whether the child can ask at all — parent-bound limits, the
 * verified-parental-consent age band, and the rollout, all decided by the
 * caller. Gating the read on it keeps every other viewer of the Robux tab off
 * parental-controls-api.
 */
const useAskParentRequest = (isEnabled: boolean): TAskParentRequestControls | undefined => {
  const queryClient = useQueryClient();

  const { data: pendingRequest, isInitialLoading } = useQuery({
    queryKey: askParentRequestQueryKey,
    queryFn: getPendingAskParentRequest,
    enabled: isEnabled,
  });

  const refreshPendingRequest = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: askParentRequestQueryKey });
  };

  // The ask resolves when the AMP upsell closes, whether or not it sent
  // anything, so refetching is the only way to learn the outcome.
  const askMutation = useMutation({
    mutationFn: submitAskParentRequest,
    onSuccess: refreshPendingRequest,
  });
  const cancelMutation = useMutation({
    mutationFn: cancelAskParentRequest,
    onSuccess: refreshPendingRequest,
  });

  if (!isEnabled || isInitialLoading) {
    return undefined;
  }

  const consentId = pendingRequest?.consentId;

  return {
    pendingRequest: pendingRequest ?? null,
    onAsk: () => {
      askMutation.mutate();
    },
    onCancel: () => {
      if (consentId !== undefined) {
        cancelMutation.mutate(consentId);
      }
    },
    isBusy: askMutation.isPending || cancelMutation.isPending,
    hasError: askMutation.isError || cancelMutation.isError,
  };
};

export default useAskParentRequest;
