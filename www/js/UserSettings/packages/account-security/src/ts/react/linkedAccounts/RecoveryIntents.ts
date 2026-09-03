import { useQuery } from "@tanstack/react-query";
import {
  approveRecoveryIntent,
  denyRecoveryIntent,
  getRecoveryIntents,
} from "../../common/request/apis/accountRecovery";
import { RecoveryIntent } from "../../common/request/types/accountRecovery";

const RECOVERY_INTENTS_QUERY_KEY = ["linked-accounts", "recovery-intents"] as const;

export const useRecoveryIntents = () => {
  const query = useQuery({
    queryKey: RECOVERY_INTENTS_QUERY_KEY,
    queryFn: async (): Promise<RecoveryIntent[]> => {
      const result = await getRecoveryIntents();
      if (result.isError) throw result.errorRaw;
      return result.value.pendingRecoveryIntents ?? [];
    },
    retry: false,
  });

  const resolveIntent = async (intent: RecoveryIntent, isApproved: boolean): Promise<void> => {
    const result = isApproved
      ? await approveRecoveryIntent({ recoveryIntentId: intent.recoveryIntentId })
      : await denyRecoveryIntent({ recoveryIntentId: intent.recoveryIntentId });
    if (result.isError) throw result.errorRaw;
    await query.refetch();
  };

  return {
    intents: query.data ?? [],
    isError: query.isError,
    isLoading: query.isLoading,
    retry: query.refetch,
    resolveIntent,
  };
};
