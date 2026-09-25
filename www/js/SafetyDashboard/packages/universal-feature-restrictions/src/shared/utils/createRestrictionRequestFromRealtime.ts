import { NANOSECONDS_PER_SECOND } from "./time";
import type { ModerationDetail } from "../../types/api";
import type {
  FeatureRestrictionRequest,
  RealtimeFeatureIntervention,
  ShowFeatureRestrictionFromRealtimeOptions,
} from "../../types/runtimeOptions";

/**
 * Converts realtime timeout timing into the moderation-detail units expected by the dialog.
 * Returns undefined when a timeout is missing valid timing so the caller can use the fetch path.
 */
function buildRealtimeTiming(
  intervention: RealtimeFeatureIntervention,
): Pick<ModerationDetail, "beginDate" | "duration" | "endDate"> | undefined {
  if (intervention.type === "nudge") {
    return { beginDate: "", duration: 0, endDate: "" };
  }

  const { timeoutDurationSeconds, timeoutStartTime } = intervention;
  if (
    !timeoutStartTime ||
    timeoutDurationSeconds === undefined ||
    !Number.isFinite(timeoutDurationSeconds) ||
    timeoutDurationSeconds < 0
  ) {
    return undefined;
  }

  const startTimeMs = Date.parse(timeoutStartTime);
  if (Number.isNaN(startTimeMs)) {
    return undefined;
  }

  if (timeoutDurationSeconds === 0) {
    return { beginDate: timeoutStartTime, duration: 0, endDate: "" };
  }

  return {
    beginDate: timeoutStartTime,
    duration: timeoutDurationSeconds * NANOSECONDS_PER_SECOND,
    endDate: new Date(startTimeMs + timeoutDurationSeconds * 1000).toISOString(),
  };
}

/**
 * Uses complete non-acknowledgeable realtime data immediately, avoiding the notification-before-
 * persistence race. Incomplete and acknowledgeable notifications stay fetch-backed so UFR can get
 * the authoritative intervention, including the ID required for acknowledgement.
 */
export function createRestrictionRequestFromRealtime({
  intervention,
  ...request
}: ShowFeatureRestrictionFromRealtimeOptions): FeatureRestrictionRequest {
  if (
    intervention.acknowledgeable ||
    !intervention.decisionEventId ||
    !intervention.title ||
    !intervention.body
  ) {
    return request;
  }

  const timing = buildRealtimeTiming(intervention);
  if (!timing) {
    return request;
  }

  return {
    ...request,
    analyticsEventId: intervention.decisionEventId,
    moderationDetail: {
      punishedUserId: 0,
      messageToUser: "",
      title: intervention.title,
      body: intervention.body,
      punishmentTypeDescription: intervention.type,
      punishmentId: 0,
      ...timing,
      interventionId: "",
      consequenceTransparencyMessage: "",
      showAppealsProcessLink: false,
      acknowledgeable: false,
      badUtterances: [],
    },
  };
}
