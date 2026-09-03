import configureGroupModule from '../configureGroupModule';

const configureCommunityTier = {
  templateUrl: 'configure-community-tier',
  bindings: {
    group: '<'
  },
  controller: 'configureCommunityTierController'
};

configureGroupModule.component('configureCommunityTier', configureCommunityTier);
export default configureCommunityTier;
