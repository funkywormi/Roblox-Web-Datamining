import { useCallback, useState, useEffect, useMemo } from "react";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import { composeQueryString } from "@rbx/core-scripts/util/url";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { PaymentSession } from "../types/buyRobuxPageData";
import { EXP_FLOW_QUERY_PARAM, EXP_FLOW_QUERY_VALUE } from "../constants/loginRedirect";
import { trackCounter, trackError } from "../observability";
import { getAuthTicketData } from "../services/getAuthTicketData";
import {
  DEFAULT_LOGIN_REDIRECT_PATHNAME,
  loginRedirectService,
} from "../services/loginRedirectService";

export const PAYMENT_METHODS_REDIRECT_URL = "/upgrades/paymentmethods";
const CTX_URL_PARAM = "redirect";

type ConstructRedirectUrlParams = {
  authTicket: string;
  paymentSessionId: string;
  returnUrl: string;
  loginRedirectPathname: string;
  isInExperiment: boolean;
  userId: number;
};

const constructRedirectUrl = ({
  authTicket,
  paymentSessionId,
  returnUrl,
  loginRedirectPathname,
  isInExperiment,
  userId,
}: ConstructRedirectUrlParams) => {
  const queryString = composeQueryString({
    analyticId: paymentFlowAnalyticsService.purchaseFlowUuid,
    at: authTicket,
    ctx: CTX_URL_PARAM,
    ...(isInExperiment && { [EXP_FLOW_QUERY_PARAM]: EXP_FLOW_QUERY_VALUE }),
    paymentSessionId,
    returnUrl,
    tuid: userId,
  });

  return `${loginRedirectPathname}?${queryString}`;
};

export type UseRedirectResult = {
  url: string;
  isInExperiment: boolean;
  refreshAuthTicket: () => void;
};

export default function useRedirect({
  paymentSession,
  isEnabled,
}: {
  // Auth-only; hook short-circuits when undefined.
  paymentSession: PaymentSession | undefined;
  isEnabled: boolean;
}): UseRedirectResult | undefined {
  const [authTicket, setAuthTicket] = useState<string>();
  const [pathname, setPathname] = useState(DEFAULT_LOGIN_REDIRECT_PATHNAME);
  const [isInExperiment, setIsInExperiment] = useState(false);
  const paymentSessionId = paymentSession?.id;

  const refreshAuthTicket = useCallback(() => {
    trackCounter("MobileRedirectUrlGenerationStarted");
    getAuthTicketData()
      .then(setAuthTicket)
      .catch((err: unknown) => {
        trackError("MobileRedirectUrlGenerationFailed", null, err);
      });
  }, []);

  useEffect(() => {
    /**
     * Skip when redirect is disabled or there's no payment session (unauth).
     */
    if (!isEnabled || !paymentSessionId) {
      return;
    }

    refreshAuthTicket();

    loginRedirectService
      .getExperimentBasedPathname()
      .then(({ pathname: resolvedPathname, isInExperiment: inExperiment }) => {
        setPathname(resolvedPathname);
        setIsInExperiment(inExperiment);
      })
      .catch((err: unknown) => {
        trackError("LoginRedirectExperimentFetchFailed", null, err);
      });
  }, [refreshAuthTicket, isEnabled, paymentSessionId]);

  // Guard against unauth deref; useMemo runs every render.
  const urlWithQueryParams: string = useMemo(() => {
    if (!authTicket || !paymentSessionId) {
      return "";
    }
    return constructRedirectUrl({
      authTicket,
      paymentSessionId,
      returnUrl: PAYMENT_METHODS_REDIRECT_URL,
      loginRedirectPathname: pathname,
      isInExperiment,
      userId: authenticatedUser()?.id ?? 0,
    });
  }, [authTicket, paymentSessionId, pathname, isInExperiment]);

  if (!isEnabled || !paymentSessionId) {
    return undefined;
  }

  return {
    url: urlWithQueryParams,
    isInExperiment,
    refreshAuthTicket,
  };
}
