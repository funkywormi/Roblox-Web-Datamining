import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as Metrics from "../types/metrics";

export const recordMetric = (
  metric: Metrics.Metric,
): Promise<Result<void, Metrics.MetricsError | null>> =>
  toResult(http.post(Metrics.RECORD_METRICS_CONFIG, metric), Metrics.MetricsError);
