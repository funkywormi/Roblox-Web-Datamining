import { useContext, useEffect, useMemo, useState } from "react";
import useSessionStorage from "./useSessionStorage";
import { SierraConversation } from "../core/types/sierra";
import { clearSierraChatSession } from "../core/helpers/sierraSessionStorageManager";
import {
  redirectToSupportFormAfterChatTerminationMs,
  sierraSessionStorageKey,
} from "../core/constants/sierra";
import useNav from "./useNav";
import { SupportContext } from "../providers/SupportContextProvider";

const useSierraChatRouteRedirect = (
  guardianApprovalId: string | null | undefined,
  hasSDKLoadError: boolean,
): void => {
  const { pushToParent } = useNav();
  const { submittedSupportFormData } = useContext(SupportContext);

  const sierraSessionData = useSessionStorage<SierraConversation>(sierraSessionStorageKey);

  const isConvoTerminated = useMemo(
    () =>
      sierraSessionData?.conversationEnded ||
      sierraSessionData?.conversationTimedOut ||
      sierraSessionData?.transferredToAgent,
    [sierraSessionData],
  );

  const [hasReachedTerminationTimeLimit, setHasReachedTerminationTimeLimit] = useState(false);

  useEffect(() => {
    // Redirect back to the support form if an SDK or config load error has been detected by the parent
    if (hasSDKLoadError) pushToParent();

    // Redirect back if we are not in the u13 flow and support form data is not immediately avaiable from prior support form component
    const isSupportFormDataPresent = Object.values(submittedSupportFormData ?? {}).some(Boolean);
    if (!guardianApprovalId && !isSupportFormDataPresent) pushToParent();
  }, [
    guardianApprovalId,
    submittedSupportFormData,
    pushToParent,
    sierraSessionData,
    isConvoTerminated,
    hasSDKLoadError,
  ]);

  useEffect(() => {
    if (!isConvoTerminated) return undefined;

    const timeout = setTimeout(() => {
      setHasReachedTerminationTimeLimit(true);
    }, redirectToSupportFormAfterChatTerminationMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [isConvoTerminated]);

  useEffect(() => {
    if (hasReachedTerminationTimeLimit) {
      clearSierraChatSession();
      pushToParent();
    }
  }, [hasReachedTerminationTimeLimit, pushToParent]);
};

export default useSierraChatRouteRedirect;
