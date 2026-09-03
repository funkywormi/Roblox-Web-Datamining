import { GetFeatureAccessResponse } from "../services/avatarAPIService";

export type AvatarAccessStatus = {
  isBlocked: boolean;
  endTime: Date | null;
  durationSeconds: number | null;
};

interface TimeoutAction {
  endTime?: string;
  duration?: number;
}

interface RecourseObject {
  timeoutActions?: TimeoutAction[];
  timedOutActions?: TimeoutAction[];
}

const AVATAR_CHANGE_FEATURE_NAME = "AvatarChange";
const GRANTED_ACCESS = "Granted";

export function getAvatarAccessStatus(response: GetFeatureAccessResponse): AvatarAccessStatus {
  const avatarChangeFeature = response.features.find(
    feature => feature.featureName === AVATAR_CHANGE_FEATURE_NAME,
  );

  if (!avatarChangeFeature) {
    return {
      isBlocked: false,
      endTime: null,
      durationSeconds: null,
    };
  }

  if (avatarChangeFeature.access === GRANTED_ACCESS) {
    return {
      isBlocked: false,
      endTime: null,
      durationSeconds: null,
    };
  }

  let endTime: Date | null = null;
  let durationSeconds: number | null = null;

  if (avatarChangeFeature.v2Recourses && avatarChangeFeature.v2Recourses.length > 0) {
    const firstRecourse = avatarChangeFeature.v2Recourses[0];

    // Handle both nested array structure and direct object structure
    let recourseObject: RecourseObject = firstRecourse as RecourseObject;

    // If it's an array (nested structure), get the first element
    if (Array.isArray(firstRecourse) && firstRecourse.length > 0) {
      recourseObject = (firstRecourse as RecourseObject[])[0]!;
    }

    // Check for timeoutActions (API response) or timedOutActions (type definition)
    const timeoutActions: TimeoutAction[] =
      recourseObject?.timeoutActions || recourseObject?.timedOutActions || [];

    if (timeoutActions.length > 0) {
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
    endTime,
    durationSeconds,
  };
}

export default getAvatarAccessStatus;
