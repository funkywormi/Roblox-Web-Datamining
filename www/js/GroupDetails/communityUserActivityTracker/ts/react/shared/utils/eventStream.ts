/**
 * Thin shim over the `Roblox.CommunityTelemetry` global; the EventStream client / builders now live
 * in @rbx/community-telemetry. Exports are unchanged so existing call sites keep working.
 */
import type { DescMessage } from '@bufbuild/protobuf';
import type { Message, Schema } from '@rbx/event-stream-v2';

import getCommunityTelemetry from './communityTelemetryGlobal';
import type {
  CommunityEventStreamApi,
  CommunityMetricBuilders,
  StructuredEvent
} from './communityTelemetryTypes';

// Re-export the telemetry types so existing call sites can keep importing them from here.
export type {
  StructuredEvent,
  AgeCheckClickEvent,
  PollCreationButtonClicked,
  PollViewButtonClicked,
  PollViewSourceType,
  ExperienceServerSectionShownEvent,
  ExperienceServerSectionClickEvent,
  ExperienceServerSectionJoinEvent,
  GroupPageExposureEventParams,
  GroupPageClickEventParams,
  CmntyEntrypointExposureEventParams,
  CmntyEntrypointClickEventParams,
  CmntySearchConductedEventParams,
  CmntySearchResultsReturnedEventParams
} from './communityTelemetryTypes';

export const getImpressionId = (): string => getCommunityTelemetry().getImpressionId();

export const updateImpressionId = (): string => getCommunityTelemetry().updateImpressionId();

export const getMetricEvent = <T extends DescMessage>(
  schema: Schema<T>,
  init: Message<T>
): StructuredEvent => getCommunityTelemetry().getMetricEvent(schema, init);

// Every builder delegates by name to the package's CommunityMetric on the global. The global is read
// per call (not captured once) because the CommunityTelemetry SCC can load after this module imports.
export const CommunityMetric: CommunityMetricBuilders = new Proxy({} as CommunityMetricBuilders, {
  get: (_target, prop: string) => (msg: unknown) =>
    ((getCommunityTelemetry().CommunityMetric as unknown) as Record<
      string,
      (m: unknown) => StructuredEvent
    >)[prop](msg)
});

// Default export matches the previous `CommunityEventStream.sendEvent(metric)` call sites.
const CommunityEventStream: CommunityEventStreamApi = {
  sendEvent: (event: StructuredEvent): void =>
    getCommunityTelemetry().CommunityEventStream.sendEvent(event)
};

export default CommunityEventStream;
