import { useCallback, useEffect, useMemo, useRef } from "react";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import { TAnalyticsProps } from "../types/upsellCardTypes";
import {
  logUpsellBannerShown,
  logUpsellButtonClick,
  logUpsellBannerDismissed,
} from "../services/upsellAnalyticsService";

interface UseUpsellAnalyticsReturn {
  logDismissed: () => void;
  logButtonClick: (buttonVariant: string) => void;
}

export const useUpsellAnalytics = (
  analyticsConfigProp?: TAnalyticsProps,
): UseUpsellAnalyticsReturn => {
  const {
    upsellPurpose,
    upsellEntrySurface,
    upsellComponent,
    upsellStage,
    impressionId: providedImpressionId,
  } = analyticsConfigProp || {};

  const impressionId = useMemo(() => {
    return providedImpressionId || uuidService.generateRandomUuid();
  }, [providedImpressionId]);

  const prevImpressionIdRef = useRef<string | null>(null);

  const analyticsConfigWithImpressionId = useMemo(() => {
    const hasAnalyticsConfig =
      upsellPurpose || upsellEntrySurface || upsellComponent || upsellStage || providedImpressionId;

    if (!hasAnalyticsConfig) return null;

    return {
      upsellPurpose,
      upsellEntrySurface,
      upsellComponent,
      upsellStage,
      impressionId,
    };
  }, [
    upsellPurpose,
    upsellEntrySurface,
    upsellComponent,
    upsellStage,
    impressionId,
    providedImpressionId,
  ]);

  useEffect(() => {
    if (analyticsConfigWithImpressionId && prevImpressionIdRef.current !== impressionId) {
      logUpsellBannerShown(analyticsConfigWithImpressionId);
      prevImpressionIdRef.current = impressionId;
    }
  }, [analyticsConfigWithImpressionId, impressionId]);

  const logDismissed = useCallback(() => {
    if (analyticsConfigWithImpressionId) {
      logUpsellBannerDismissed(analyticsConfigWithImpressionId);
    }
  }, [analyticsConfigWithImpressionId]);

  const logButtonClick = useCallback(
    (buttonVariant: string) => {
      if (analyticsConfigWithImpressionId) {
        logUpsellButtonClick(buttonVariant, analyticsConfigWithImpressionId);
      }
    },
    [analyticsConfigWithImpressionId],
  );

  return {
    logDismissed,
    logButtonClick,
  };
};

export default useUpsellAnalytics;
