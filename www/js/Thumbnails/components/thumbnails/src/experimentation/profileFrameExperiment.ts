import { useEffect, useState } from "react";
import ExperimentationService from "@rbx/experimentation";
import { userId } from "@rbx/core-scripts/meta/user";

/**
 * Joint web + client IXP that gates profile frames on the friends carousel.
 * Layer + key must match the experiment definition in IXP (web reads the key
 * below; the client reads its own flag on the same layer).
 *
 * This gates exactly ONE web surface: the friends carousel. Every other
 * headshot surface renders frames ungated and must NOT read this experiment —
 * only the carousel calls the hook below. Falls back to control (off) when the
 * user is unbucketed or the IXP request fails.
 */
export const PROFILE_FRAME_LAYER = "Social.Friends";
export const PROFILE_FRAME_EXPERIMENT_KEY = "friendsCarouselProfileFrameEnabled";

const CACHE_VERSION = "v1";

const getSessionCacheKey = (): string => {
  const currentUserId = userId() ?? 0;
  return `${PROFILE_FRAME_LAYER}_${PROFILE_FRAME_EXPERIMENT_KEY}_${currentUserId}_${new Date().toDateString()}_${CACHE_VERSION}`;
};

/** Sync read of cached treatment (false when unbucketed / cache miss). */
export const isProfileFrameInTreatmentFromCache = (): boolean =>
  sessionStorage.getItem(getSessionCacheKey()) === "true";

/**
 * Single-flight promise shared by every carousel tile so a page with N friend
 * tiles issues ONE IXP request instead of N. Reset on failure so a later caller
 * can retry.
 */
let treatmentPromise: Promise<boolean> | null = null;

/** Resolves treatment once per page, caching the promise so callers share a single IXP POST. */
const resolveTreatment = (): Promise<boolean> => {
  if (treatmentPromise) return treatmentPromise;

  const pending = (async () => {
    const layerValues = await ExperimentationService.getAllValuesForLayer(PROFILE_FRAME_LAYER);
    const inTreatment = layerValues[PROFILE_FRAME_EXPERIMENT_KEY] === true;
    sessionStorage.setItem(getSessionCacheKey(), inTreatment.toString());
    return inTreatment;
  })();

  pending.catch(() => {
    // Allow a subsequent caller to retry after a failed request.
    treatmentPromise = null;
  });

  treatmentPromise = pending;
  return pending;
};

/** Test-only: clears single-flight state between cases. */
export const resetProfileFrameExperimentForTests = (): void => {
  treatmentPromise = null;
};

/**
 * React hook that resolves whether the current user is in the profile-frame
 * experiment treatment. Intended for the ONE gated surface (the friends
 * carousel): eligible tiles share a single-flight IXP request. Surfaces that
 * render frames ungated must NOT call this.
 *
 * Read-only by design — this hook does NOT log layer exposure. Social.Friends
 * exposure is owned by the experiment owner (the app / friends carousel); the
 * existing web carousel reads the layer without logging exposure, and we match
 * that so web doesn't over-log exposure across its extra surfaces.
 */
export const useProfileFrameExperiment = (): boolean => {
  const [isInTreatment, setIsInTreatment] = useState(isProfileFrameInTreatmentFromCache);

  useEffect(() => {
    let active = true;
    resolveTreatment()
      .then(inTreatment => {
        if (!active) return;
        setIsInTreatment(inTreatment);
      })
      .catch((error: unknown) => {
        console.error("Failed to load profile frame IXP:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  return isInTreatment;
};
