import EventTimer from "../../../../common/eventTimer";
import { RequestServiceDefault } from "../../../../common/request";
import { MetricName } from "../../../../common/request/types/metrics";
import { FEATURE_NAME, METRICS_CONSTANTS } from "../app.config";

/**
 * A class encapsulating the metrics fired by this web app.
 */
export class MetricsServiceDefault {
  private readonly appType: string;

  private readonly challengeSolveTimeSequenceName: string;

  private readonly sensorFinishTimeSequenceName: string;

  private readonly eventTimer: EventTimer;

  private readonly requestServiceDefault: RequestServiceDefault;

  constructor(appType: string | undefined, requestServiceDefault: RequestServiceDefault) {
    this.appType = appType ?? "unknown";
    this.requestServiceDefault = requestServiceDefault;
    this.eventTimer = new EventTimer();
    this.challengeSolveTimeSequenceName = `${FEATURE_NAME}_${METRICS_CONSTANTS.sequence.challengeSolveTime}`;
    this.sensorFinishTimeSequenceName = `${FEATURE_NAME}_${METRICS_CONSTANTS.sequence.sensorFinishTime}`;
  }

  fireChallengeInitializedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeInitialized);
    this.eventTimer.start(this.challengeSolveTimeSequenceName);
    this.eventTimer.start(this.sensorFinishTimeSequenceName);
  }

  fireSensorFinishedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.sensorFinished);
    this.fireSensorFinishTimeEvent();
  }

  fireChallengeDisplayedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeDisplayed);
  }

  fireChallengeCompletedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeCompleted);
    this.fireSolveTimeEvent(METRICS_CONSTANTS.event.challengeCompleted);
  }

  fireChallengeInvalidatedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeInvalidated);
    this.fireSolveTimeEvent(METRICS_CONSTANTS.event.challengeInvalidated);
  }

  fireChallengeAbandonedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeAbandoned);
    this.fireSolveTimeEvent(METRICS_CONSTANTS.event.challengeAbandoned);
  }

  fireEvent(metricName: string): void {
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.EventCaptchaV2,
        value: 1,
        labelValues: {
          event_type: `${FEATURE_NAME}_${metricName}`,
          application_type: this.appType,
        },
      })
      // Swallow errors if metrics failed to send; this should not be fatal.
      // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
      .catch(() => {});
  }

  fireSolveTimeEvent(metricName: string): void {
    const eventTime = this.eventTimer.end(this.challengeSolveTimeSequenceName);
    if (eventTime !== null) {
      this.requestServiceDefault.metrics
        .recordMetric({
          name: MetricName.SolveTimeCaptchaV2,
          value: eventTime,
          labelValues: {
            event_type: `${FEATURE_NAME}_${metricName}`,
            application_type: this.appType,
          },
        })
        // Swallow errors if metrics failed to send; this should not be fatal.
        // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
        .catch(() => {});
    }
  }

  // Time from challenge initialization until the sensor established its decision
  // cookie (i.e. finished).
  fireSensorFinishTimeEvent(): void {
    const eventTime = this.eventTimer.end(this.sensorFinishTimeSequenceName);
    if (eventTime !== null) {
      this.requestServiceDefault.metrics
        .recordMetric({
          name: MetricName.SensorFinishTimeCaptchaV2,
          value: eventTime,
          labelValues: {
            application_type: this.appType,
          },
        })
        // Swallow errors if metrics failed to send; this should not be fatal.
        // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
        .catch(() => {});
    }
  }
}

/**
 * An interface encapsulating the metrics fired by this web app.
 *
 * This interface type offers future flexibility e.g. for mocking the default
 * metrics service.
 */
export type MetricsService = {
  [K in keyof MetricsServiceDefault]: MetricsServiceDefault[K];
};
