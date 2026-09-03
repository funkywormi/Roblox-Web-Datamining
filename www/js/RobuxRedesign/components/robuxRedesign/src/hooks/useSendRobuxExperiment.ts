/* eslint-disable no-void */
import { useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { waitForExperimentationService } from "../services/experimentationService";
import { trackCounter, trackError } from "../observability";

export const SEND_ROBUX_EXPERIMENT_LAYER = "Payments.BuyRobux.SendRobux";
const VARIANT_PARAMETER = "variant";

type SendRobuxExperimentAssignment = {
  isFriendListFilterEnabled: boolean;
  isEnrolled: boolean;
};

export type SendRobuxExperimentState = {
  isFriendListFilterEnabled: boolean;
  isLoading: boolean;
  logExposure: () => void;
};

const DEFAULT_ASSIGNMENT: SendRobuxExperimentAssignment = {
  isFriendListFilterEnabled: false,
  isEnrolled: false,
};

const isControlVariant = (variant: unknown): boolean => variant === 0 || variant === "0";
const isTreatmentVariant = (variant: unknown): boolean => variant === 1 || variant === "1";

/**
 * Fetches the Send Robux experiment assignment without logging exposure.
 */
const getSendRobuxExperimentAssignment = async (): Promise<SendRobuxExperimentAssignment> => {
  try {
    const service = await waitForExperimentationService();
    const values = await service.getAllValuesForLayer(SEND_ROBUX_EXPERIMENT_LAYER);
    const variant = values[VARIANT_PARAMETER];

    if (!isControlVariant(variant) && !isTreatmentVariant(variant)) {
      trackCounter("SendRobuxExperimentEvaluated", { variant: "unknown" });
      return DEFAULT_ASSIGNMENT;
    }

    const normalizedVariant = isTreatmentVariant(variant) ? "1" : "0";
    trackCounter("SendRobuxExperimentEvaluated", { variant: normalizedVariant });
    return {
      isFriendListFilterEnabled: normalizedVariant === "1",
      isEnrolled: true,
    };
  } catch (error) {
    trackError("SendRobuxExperimentFetchFailed", null, error);
    return DEFAULT_ASSIGNMENT;
  }
};

/**
 * Logs exposure after the Send Robux sheet displays a resolved assignment.
 */
const logSendRobuxExperimentExposure = async (): Promise<void> => {
  try {
    const service = await waitForExperimentationService();
    trackCounter("SendRobuxExperimentExposed");
    service.logLayerExposure(SEND_ROBUX_EXPERIMENT_LAYER);
  } catch (error) {
    trackError("SendRobuxExperimentExposureFailed", null, error);
    throw error;
  }
};

/**
 * Returns the prefetched assignment and an idempotent exposure logger.
 */
export function useSendRobuxExperiment(enabled = true): SendRobuxExperimentState {
  const exposureLoggedRef = useRef(false);
  const { data = DEFAULT_ASSIGNMENT, isLoading } = useQuery({
    queryKey: [`ixp/${SEND_ROBUX_EXPERIMENT_LAYER}`],
    queryFn: getSendRobuxExperimentAssignment,
    staleTime: Infinity,
    retry: false,
    enabled,
  });

  const logExposure = useCallback(() => {
    if (!data.isEnrolled || exposureLoggedRef.current) {
      return;
    }

    exposureLoggedRef.current = true;
    void logSendRobuxExperimentExposure().catch(() => {
      exposureLoggedRef.current = false;
    });
  }, [data.isEnrolled]);

  return {
    isFriendListFilterEnabled: data.isFriendListFilterEnabled,
    isLoading: enabled && isLoading,
    logExposure,
  };
}
