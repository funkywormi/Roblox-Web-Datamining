import { useCallback, useContext } from "react";
import { paymentFlowAnalyticsService as pfas } from "@rbx/payments/payments-flow-analytics";
import { BuyRobuxPageContext } from "../../../contexts/BuyRobuxPageContext";
import { trackCounter } from "../../../observability";
import {
  getEarlyClickTapCountBucket,
  getEarlyClickWaitBucket,
  type EarlyClickKind,
  type EarlyClickStep,
  type EarlyClickWaitingFor,
} from "../utils/telemetry";
import type { Tracking } from "../../../hooks/useTracking";

/** One step of a tap that the early-click capture script held: `held`, then how it ended. */
export type EarlyClickReport = {
  outcome: EarlyClickStep;
  kind: EarlyClickKind;
  productId: string;
  waitingFor: EarlyClickWaitingFor;
  /** How long the tap had been held at this step (for `held`, when React first saw it). */
  waitMs: number;
  /** Taps on the control while it was held (a user who keeps tapping counts more than one). */
  taps: number;
};

export type EarlyClickTracking = {
  trackEarlyClick: (report: EarlyClickReport) => void;
};

const {
  ENUM_VIEW_NAME: { EARLY_CLICK },
  ENUM_PURCHASE_EVENT_TYPE: { USER_INPUT },
} = pfas;

export function useEarlyClickTracking({ trackFlow }: Tracking): EarlyClickTracking {
  const { deviceMeta } = useContext(BuyRobuxPageContext);
  const trackEarlyClick = useCallback(
    ({ outcome, kind, productId, waitingFor, waitMs, taps }: EarlyClickReport) => {
      // Dimensions stay low-cardinality (buckets, and the device's operating system); the exact
      // numbers and the product go to the purchase-flow event, whose values must all be strings.
      // The event already carries the user agent, so the os split is for the counter dashboards.
      trackCounter("EarlyClickTap", {
        outcome,
        kind,
        waitingFor,
        waitBucket: getEarlyClickWaitBucket(waitMs),
        tapCount: getEarlyClickTapCountBucket(taps),
        os: deviceMeta.operatingSystem,
      });
      trackFlow(EARLY_CLICK, USER_INPUT, undefined, {
        outcome,
        kind,
        productId,
        waitingFor,
        waitMs: String(Math.round(waitMs)),
        taps: String(taps),
      });
    },
    [deviceMeta.operatingSystem, trackFlow],
  );

  return { trackEarlyClick };
}
