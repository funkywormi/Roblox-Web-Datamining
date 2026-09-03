import { useEffect, useRef } from "react";
import { useRestrictionScope } from "../../contexts/RestrictionScopeContext";
import { useUniversalFeatureRestrictionsConfig } from "../../contexts/UniversalFeatureRestrictionsConfigContext";
import { useModerationDetail } from "../../api/useModerationDetail";
import { useRestrictionEndDateInfo } from "../../hooks/useRestrictionEndDateInfo";
import { useSendAnalyticsEvent } from "../../telemetry/useSendAnalyticsEvent";
import { EventType } from "../../telemetry/eventConstants";
import { parseBadUtterances } from "../../shared/utils/parseBadUtterances";
import {
  resolveAbuseVectorLabel,
  resolveBodyDescriptor,
  resolveTitleDescriptor,
} from "./restrictionDialogContent/resolveRestrictionDialogContent";
import { isOverrideBackedAbuseVector } from "./restrictionDialogContent/restrictionDialogContentRegistry";
import { determineInterventionType } from "../../shared/utils/determineInterventionType";
import {
  determineDurationAppealsState,
  determineAppealability,
} from "../../shared/utils/determineAppealability";
import { NANOSECONDS_PER_SECOND, monotonicNowMs } from "../../shared/utils/time";
import type { Overrides } from "../../types/runtimeOptions";

export interface DialogInterventionAnalytics {
  interventionId?: string;
  interventionType?: string;
  acknowledgeable: boolean;
  timeoutDurationSeconds?: number;
}

export interface DialogRestrictionView {
  title: string;
  body: string;
  evidence: string;
  violationReason: string;
  isAppealable: boolean;
  shouldOpenAppealsPortal: boolean;
  formattedEndDate?: string;
  countdownText?: string;
  dsaMessage?: string;
  violationUid?: string;
  messageToUser?: string;
  analytics: DialogInterventionAnalytics;
}

export type DialogRestrictionModel =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; view: DialogRestrictionView; mountTimeMs: number };

interface UseDialogRestrictionModelOptions {
  overrides?: Overrides;
  onAppeal?: () => void;
  translationsReady: boolean;
}

/**
 * Owns everything between fetch and render for the restriction dialog: it fetches the moderation
 * detail for the scoped abuse vector, reports unusable/failed responses, and derives the localized
 * view model. Returns a discriminated union so the view can render a plain loading/error/ready
 * switch.
 */
export const useDialogRestrictionModel = ({
  overrides,
  onAppeal,
  translationsReady,
}: UseDialogRestrictionModelOptions): DialogRestrictionModel => {
  const mountTimeMsRef = useRef<number>();

  const sendAnalyticsEvent = useSendAnalyticsEvent();
  const { translate } = useUniversalFeatureRestrictionsConfig();
  const { abuseVector } = useRestrictionScope();
  const { data: moderationDetail, isFetching, error } = useModerationDetail();

  const overrideBacked = isOverrideBackedAbuseVector(abuseVector);
  const hasUnusableDetail = !overrideBacked && !moderationDetail?.interventionId;

  const endDateSource = overrideBacked
    ? overrides?.restriction?.endDate
    : moderationDetail?.endDate;

  const { formattedEndDate, countdownText } = useRestrictionEndDateInfo(
    translationsReady && !hasUnusableDetail ? endDateSource : undefined,
  );

  useEffect(() => {
    if (!translationsReady || isFetching) {
      return;
    }

    if (error) {
      sendAnalyticsEvent(EventType.GetModerationDetailFailed, {
        error: error.message,
      });
      return;
    }

    if (hasUnusableDetail) {
      sendAnalyticsEvent(EventType.GetModerationDetailFailed, {
        error: "Moderation detail returned without usable info",
      });
    }
  }, [error, isFetching, hasUnusableDetail, sendAnalyticsEvent, translationsReady]);

  if (!translationsReady || (!overrideBacked && isFetching)) {
    return { status: "loading" };
  }

  if (error || hasUnusableDetail) {
    return { status: "error" };
  }

  const {
    acknowledgeable = false,
    badUtterances,
    beginDate,
    consequenceTransparencyMessage,
    duration,
    endDate,
    interventionId,
    messageToUser,
    punishmentTypeDescription,
    violation,
  } = moderationDetail ?? {};

  const resolvedDuration = duration ?? overrides?.restriction?.duration ?? 0;

  const appealsState = moderationDetail
    ? determineAppealability({
        beginDate,
        endDate,
        acknowledgeable,
        onAppeal,
      })
    : determineDurationAppealsState(resolvedDuration, onAppeal);

  const { interventionType, interventionTypeForAnalytics } = determineInterventionType({
    punishmentTypeDescription,
    durationNs: resolvedDuration,
  });

  const { textItems, abuseTypes } = moderationDetail
    ? parseBadUtterances(badUtterances ?? [], translate)
    : { textItems: [], abuseTypes: [] };

  const abuseVectorLabel = resolveAbuseVectorLabel(abuseVector, translate, overrides?.label);

  const titleDescriptor = resolveTitleDescriptor({
    interventionType,
    durationNs: resolvedDuration,
    abuseVector,
  });
  const title = translate(titleDescriptor.key, {
    ...titleDescriptor.params,
    abuseVector: abuseVectorLabel,
  });

  const bodyDescriptor = resolveBodyDescriptor({ interventionType, abuseVector });
  const body = translate(bodyDescriptor.key);

  mountTimeMsRef.current ??= monotonicNowMs();

  return {
    status: "ready",
    mountTimeMs: mountTimeMsRef.current,
    view: {
      title,
      body,
      evidence: textItems.join("\n"),
      violationReason: abuseTypes.join(", "),
      ...appealsState,
      formattedEndDate,
      countdownText,
      dsaMessage: consequenceTransparencyMessage,
      violationUid: violation?.uid,
      messageToUser,
      analytics: {
        interventionId,
        interventionType: interventionTypeForAnalytics,
        acknowledgeable,
        // TODO: Backend should pass duration as seconds
        timeoutDurationSeconds: duration ? duration / NANOSECONDS_PER_SECOND : undefined,
      },
    },
  };
};
