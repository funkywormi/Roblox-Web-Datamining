import {
  CommunityMetric,
  getImpressionId,
  PollCreationButtonClicked,
  PollViewButtonClicked,
  PollViewSourceType,
  StructuredEvent
} from '../utils/eventStream';
import { getCommonParams } from '../utils/pageInfo';

const getLocation = (): { hash: string; pathname: string } => ({
  hash: window.location.hash,
  pathname: window.location.pathname
});

export const getPollCreateShownEvent = (): StructuredEvent => {
  const { hash, pathname } = getLocation();
  const { pageRoute, locationTab, groupId } = getCommonParams(hash, pathname);
  return CommunityMetric.PollCreateShown({
    pageRoute,
    groupId,
    locationTab,
    sessionId: getImpressionId()
  });
};

export const getPollCreationButtonClickEvent = (
  buttonClicked: PollCreationButtonClicked
): StructuredEvent => {
  const { hash, pathname } = getLocation();
  const { pageRoute, locationTab, groupId } = getCommonParams(hash, pathname);
  return CommunityMetric.PollCreationButtonClick({
    pageRoute,
    groupId,
    locationTab,
    sessionId: getImpressionId(),
    buttonClicked
  });
};

export const getPollViewButtonClickEvent = (
  buttonClicked: PollViewButtonClicked,
  pollId: string,
  sourceType: PollViewSourceType,
  sourceId: string
): StructuredEvent => {
  const { hash, pathname } = getLocation();
  const { pageRoute, locationTab, groupId } = getCommonParams(hash, pathname);
  return CommunityMetric.PollViewButtonClick({
    pageRoute,
    groupId,
    locationTab,
    sessionId: getImpressionId(),
    buttonClicked,
    pollId,
    sourceType,
    sourceId
  });
};
