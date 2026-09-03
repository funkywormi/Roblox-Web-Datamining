/* eslint-disable default-param-last */
import { CurrentUser } from 'Roblox';
import * as EventType from '../actions/eventType';
import { getUrlUserId } from '../../../utils/appUtil';

const profileUserId = getUrlUserId() || CurrentUser.userId;

const DEFAULT_METADATA = {
  profileUserId,
  isMyProfile: profileUserId === CurrentUser.userId,
  isNearbyUpsellEnabled: false,
  isFriendsUserDataStoreCacheEnabled: true,
  onlyShowContents: false,
  userName: '',
  displayName: ''
};

const metaData = (state = DEFAULT_METADATA, action) => {
  const onlyShowContents = window.location.search.match('onlyShowContents') || false;
  switch (action.type) {
    case EventType.SET_METADATA:
      return { ...{ onlyShowContents }, ...state, ...action.data };
    default:
      return state;
  }
};

export default metaData;
