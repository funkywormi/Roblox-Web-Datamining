import { localStorageService } from 'core-roblox-utilities';
import { urlService } from 'core-utilities';
import { useCallback, useEffect, useState } from 'react';
import { CurrentUser } from 'Roblox';
import {
  createPaymentSession,
  getPaymentSession,
  PaymentSession
} from '../paymentSessionService';

const PAYMENT_SESSION_LOCAL_STORAGE_KEY_V2 = `paymentSession-${CurrentUser?.userId || 'loggedout'}`;
export const PAYMENT_SESSION_ID_URL_PARAM = 'paymentSessionId';

export default function usePaymentSession(createNewSession = false): PaymentSession | undefined {
  const [paymentSession, setPaymentSession] = useState<PaymentSession | undefined>(
    createNewSession
      ? undefined
      : (localStorageService.getLocalStorage(
          PAYMENT_SESSION_LOCAL_STORAGE_KEY_V2
        ) as PaymentSession | undefined)
  );

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
        // eslint-disable-next-line no-void
        void fetchPaymentSession();
      }

      return;
    }

    const paymentSessionId = urlService.getQueryParam(PAYMENT_SESSION_ID_URL_PARAM)?.toString();

    // eslint-disable-next-line no-void
    void fetchPaymentSession(paymentSessionId);
  }, [fetchPaymentSession, paymentSession]);

  return paymentSession;
}
