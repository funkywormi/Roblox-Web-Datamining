import CommunityEventStream, { CommunityMetric, getImpressionId } from '../utils/eventStream';
import { getCommonParams, getSanitizedReferrer } from '../utils/pageInfo';

let sessionSequenceNumber = 0;

export const resetSequenceNumber = (): void => {
  sessionSequenceNumber = 0;
};

export const trackTimeSpent = (hash: string, pathname: string, lastActiveTime: number): void => {
  const { pageRoute, locationTab, groupId, isValid } = getCommonParams(hash, pathname);

  if (isValid) {
    sessionSequenceNumber += 1;
    CommunityEventStream.sendEvent(
      CommunityMetric.ActivityTimeSlice({
        pageRoute,
        groupId,
        locationTab,
        sessionId: getImpressionId(),
        timeSinceLastAction: Date.now() - lastActiveTime,
        sequenceNumber: sessionSequenceNumber
      })
    );
  }
};

export const trackSessionStart = (hash: string, pathname: string, referrer: string): void => {
  const { pageRoute, locationTab, groupId, isValid } = getCommonParams(hash, pathname);

  if (isValid) {
    CommunityEventStream.sendEvent(
      CommunityMetric.SessionStart({
        pageRoute,
        groupId,
        locationTab,
        sessionId: getImpressionId(),
        enterFrom: getSanitizedReferrer(referrer)
      })
    );
  }
};

export const trackSessionEnd = (hash: string, pathname: string, sessionStartTime: number): void => {
  const { pageRoute, locationTab, groupId, isValid } = getCommonParams(hash, pathname);

  if (isValid) {
    CommunityEventStream.sendEvent(
      CommunityMetric.SessionEnd({
        pageRoute,
        groupId,
        locationTab,
        sessionId: getImpressionId(),
        sessionDuration: Date.now() - sessionStartTime
      })
    );
  }
};

export default trackTimeSpent;
