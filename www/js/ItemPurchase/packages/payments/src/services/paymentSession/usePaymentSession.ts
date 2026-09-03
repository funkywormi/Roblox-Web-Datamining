import { useCallback, useEffect, useMemo, useState } from "react";
import { CurrentUser } from "Roblox";
import localStorageService from "@rbx/core-scripts/local-storage";
import { urlService } from "@rbx/core-scripts/legacy/core-utilities";
import { createPaymentSession, getPaymentSession, PaymentSession } from "./paymentSessionService";

const PAYMENT_SESSION_LOCAL_STORAGE_KEY_V2 = `paymentSession-${CurrentUser?.userId || "loggedout"}`;
export const PAYMENT_SESSION_ID_URL_PARAM = "paymentSessionId";

export type UsePaymentSessionResult = {
  paymentSession: PaymentSession | undefined;
  // True when this hook instance itself POSTed /payment-sessions to create a
  // new session (cold start with no URL/localStorage, or expired-cache refresh).
  // False when the session came from a URL param (GET) or a valid cached entry.
  wasCreatedByCurrentClient: boolean;
};

export function usePaymentSessionWithCreationInfo(
  createNewSession = false,
): UsePaymentSessionResult {
  const [paymentSession, setPaymentSession] = useState<PaymentSession | undefined>(
    createNewSession
      ? undefined
      : (localStorageService.getLocalStorage(PAYMENT_SESSION_LOCAL_STORAGE_KEY_V2) as
          | PaymentSession
          | undefined),
  );
  const [wasCreatedByCurrentClient, setWasCreatedByCurrentClient] = useState(false);

  const fetchPaymentSession = useCallback(async (paymentSessionId?: string) => {
    const data = paymentSessionId
      ? await getPaymentSession(paymentSessionId)
      : await createPaymentSession();
    if (!data) {
      return;
    }

    localStorageService.setLocalStorage(PAYMENT_SESSION_LOCAL_STORAGE_KEY_V2, data.paymentSession);
    setPaymentSession(data.paymentSession);
  }, []);

  useEffect(() => {
    if (paymentSession) {
      if (new Date(paymentSession.expiresAt) < new Date()) {
        setWasCreatedByCurrentClient(true);
        // eslint-disable-next-line no-void
        void fetchPaymentSession();
      }

      return;
    }

    const paymentSessionId = urlService.getQueryParam(PAYMENT_SESSION_ID_URL_PARAM)?.toString();
    if (!paymentSessionId) {
      setWasCreatedByCurrentClient(true);
    }

    // eslint-disable-next-line no-void
    void fetchPaymentSession(paymentSessionId);
  }, [fetchPaymentSession, paymentSession]);

  return useMemo(
    () => ({ paymentSession, wasCreatedByCurrentClient }),
    [paymentSession, wasCreatedByCurrentClient],
  );
}

export function usePaymentSession(createNewSession = false): PaymentSession | undefined {
  return usePaymentSessionWithCreationInfo(createNewSession).paymentSession;
}
