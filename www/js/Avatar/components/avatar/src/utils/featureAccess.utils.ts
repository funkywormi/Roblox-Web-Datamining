import type {
  GetFeatureAccessResponse,
  TimeoutAction,
  V2Resource,
} from "../services/avatarAPIService";

export type AvatarAccessStatus = {
  isBlocked: boolean;
  hasTimeoutAction: boolean;
  endTime: Date | null;
  durationSeconds: number | null;
};

const AVATAR_CHANGE_FEATURE_NAME = "AvatarChange";
const GRANTED_ACCESS = "Granted";

export const NOT_BLOCKED: AvatarAccessStatus = {
  isBlocked: false,
  hasTimeoutAction: false,
  endTime: null,
  durationSeconds: null,
};

export function getAvatarAccessStatus(response: GetFeatureAccessResponse): AvatarAccessStatus {
  const avatarChangeFeature = response.features.find(
    feature => feature.featureName === AVATAR_CHANGE_FEATURE_NAME,
  );

  if (!avatarChangeFeature || avatarChangeFeature.access === GRANTED_ACCESS) {
    return NOT_BLOCKED;
  }

  let hasTimeoutAction = false;
  let endTime: Date | null = null;
  let durationSeconds: number | null = null;

  if (avatarChangeFeature.v2Recourses && avatarChangeFeature.v2Recourses.length > 0) {
    const firstRecourse = avatarChangeFeature.v2Recourses[0];

    // Handle both nested array structure and direct object structure
    let recourseObject: V2Resource | undefined = firstRecourse;

    // If it's an array (nested structure), get the first element
    if (Array.isArray(firstRecourse) && firstRecourse.length > 0) {
      recourseObject = (firstRecourse as V2Resource[])[0]!;
    }

    const timeoutActions: TimeoutAction[] = recourseObject?.timeoutActions ?? [];

    if (timeoutActions.length > 0) {
      hasTimeoutAction = true;
      const timeoutAction = timeoutActions[0]!;
      if (timeoutAction.endTime) {
        endTime = new Date(timeoutAction.endTime);
      }
      if (timeoutAction.duration) {
        durationSeconds = timeoutAction.duration;
      }
    }
  }

  return {
    isBlocked: true,
    hasTimeoutAction,
    endTime,
    durationSeconds,
  };
}

export default getAvatarAccessStatus;
