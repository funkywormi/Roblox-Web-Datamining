import * as NewChallengeTypes from "@rbx/generic-challenge-types";
import { MetricName } from "../../../common/request/types/metrics";
import { RequestServiceDefault } from "../../../common/request";
import { ChallengeType } from "../generic/interface";
import { HybridTarget } from "./interface";

const requestServiceDefault = new RequestServiceDefault();

export type RecordHybridEventMetricProps = {
  hybridTarget: HybridTarget;
  challengeType: ChallengeType | NewChallengeTypes.ChallengeType;
  data: Record<string, unknown>;
};

export const recordHybridEventMetric = ({
  hybridTarget,
  challengeType,
  data,
}: RecordHybridEventMetricProps): void => {
  try {
    // Because data was lazily typed here using mapped types incur a massive refactor of the overarching
    // wrapper, so I'm avoiding that by encapsulating untyped, runtime assertions here.
    const notDisplayed = "displayed" in data && !data.displayed;
    const notInitialized = "initialized" in data && !data.initialized;
    const notParsed = "parsed" in data && !data.parsed;

    if (notParsed || notInitialized || notDisplayed) {
      // Don't count if we failed.
      return;
    }

    const labelValues = { hybrid_target: hybridTarget, challenge_type: challengeType };
    // eslint-disable-next-line no-void
    void requestServiceDefault.metrics.recordMetric({
      name: MetricName.EventGenericHybrid,
      value: 1,
      labelValues,
    });
  } catch (e) {
    // Swallow errors - fire & forget... This here because everyone else recording metrics does so.
    // They must know something I don't (even though the client converts errors to responses).
  }
};
