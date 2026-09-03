import CommunityEventStream, { CommunityMetric, getImpressionId } from '../utils/eventStream';
import { getCommonParams } from '../utils/pageInfo';
import { logGroupPageClickEvent } from '../utils/logging';
import { EventContext } from '../constants/eventConstants';

const getLocation = (): { hash: string; pathname: string } => ({
  hash: window.location.hash,
  pathname: window.location.pathname
});

// Log a community-page click via the shared generic group-page click event,
// differentiated by clickTargetType (for tabs, clickTargetId = destination tab).
// logGroupPageClickEvent fills in pageRoute/locationTab/sessionId from the route.
const sendGroupPageClick = (clickTargetType: string, clickTargetId?: string): void => {
  const { hash, pathname } = getLocation();
  const { groupId, isValid } = getCommonParams(hash, pathname);
  if (!isValid) {
    return;
  }
  logGroupPageClickEvent({
    context: EventContext.GroupHomepage,
    groupId,
    clickTargetType,
    clickTargetId
  });
};

export const sendMembersListClickEvent = (): void => sendGroupPageClick('membersList');

export const sendCommunityDetailsClickEvent = (): void => sendGroupPageClick('expandDetails');

// Rank pill (opens the roles dialog).
export const sendRankClickEvent = (): void => sendGroupPageClick('rank');

// Opening the header overflow (three-dot) menu.
export const sendOverflowMenuClickEvent = (): void => sendGroupPageClick('overflowMenu');

// An overflow menu item; menuItem is the action key (e.g. ConfigureCommunity, Report).
export const sendOverflowMenuItemClickEvent = (menuItem: string): void =>
  sendGroupPageClick('overflowMenuItem', menuItem);

export const sendTabClickEvent = (tab: string): void => sendGroupPageClick('tab', tab);

export const sendHomepageScrollExposure = (): void => {
  const { hash, pathname } = getLocation();
  const { pageRoute, locationTab, groupId, isValid } = getCommonParams(hash, pathname);
  if (!isValid) {
    return;
  }
  CommunityEventStream.sendEvent(
    CommunityMetric.HomepageScrollExposure({
      pageRoute,
      groupId,
      locationTab,
      sessionId: getImpressionId()
    })
  );
};
