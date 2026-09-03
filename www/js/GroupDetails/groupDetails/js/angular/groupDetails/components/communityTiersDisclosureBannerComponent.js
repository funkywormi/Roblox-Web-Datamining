import groupModule from '../groupModule';

const communityTiersDisclosureBanner = {
  templateUrl: 'community-tiers-disclosure-banner',
  bindings: {
    groupId: '<',
    isGroupMember: '<',
    isCommunityPage: '<'
  }
};

groupModule.component('communityTiersDisclosureBanner', communityTiersDisclosureBanner);
export default communityTiersDisclosureBanner;
