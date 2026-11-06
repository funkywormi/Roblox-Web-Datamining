import transport from "../requestTransport";
import { Result } from "../../result";
import { toResult } from "../common";
import * as Metrics from "../types/metrics";

export const recordMetric = (
  metric: Metrics.Metric,
): Promise<Result<void, Metrics.MetricsError | null>> =>
  toResult(transport.post(Metrics.RECORD_METRICS_CONFIG, metric), Metrics.MetricsError);
