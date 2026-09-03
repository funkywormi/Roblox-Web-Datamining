import { BatchRequestFactory } from "@rbx/core-scripts/legacy/core-utilities";
import {
  getBatchMetricsUrl,
  Measure,
  MetricsResult,
  DefaultBatchSize,
  DefaultProcessBatchWaitTime,
  JsonData,
} from "./sharedConstants";
import { getMetaData } from "./metricsMetaData";
import { fetchWithCsrf } from "./fetchWithCsrf";

const batchRequestFactory = new BatchRequestFactory<Measure, MetricsResult>();
let idCounter = 0;

const { performanceMetricsBatchWaitTime, performanceMetricsBatchSize } = getMetaData();

const metricsBatchRequestProcessor = batchRequestFactory.createRequestProcessor(
  async items => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const measures = items.map(({ data: { taskId, ...otherKeys } }) => ({ ...otherKeys }));

    await fetchWithCsrf(getBatchMetricsUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify(measures),
    });
    const results: MetricsResult = {};
    items.forEach(({ key }) => {
      results[key] = true;
    });
    return results;
  },
  ({ taskId }: Measure) => taskId?.toString() ?? "",
  {
    getFailureCooldown: batchRequestFactory.createExponentialBackoffCooldown(1000, 3000),
    maxRetryAttempts: 5,
    batchSize: performanceMetricsBatchSize ?? DefaultBatchSize,
    processBatchWaitTime: performanceMetricsBatchWaitTime ?? DefaultProcessBatchWaitTime,
  },
);

export const logMeasurement = (metricName: string, jsonData: JsonData): Promise<MetricsResult> => {
  const taskId = idCounter;
  idCounter += 1;
  const measure: Measure = {
    metricName,
    jsonData: JSON.stringify(jsonData),
  };
  return metricsBatchRequestProcessor.queueItem({ taskId, ...measure });
};
