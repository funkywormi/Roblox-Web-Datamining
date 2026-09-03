import { EnvironmentUrls } from 'Roblox';
import groupPayoutsModule from '../groupPayoutsModule';

const groupPayoutsConstants = {
  urls: {
    getPayoutsUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/payouts`,
    postGroupPayoutUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/payouts`,
    postGroupRecurringPayoutUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/payouts/recurring`,
    groupPayoutRestrictionUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/payout-restriction`,
    getAddFundsLatestUrl: `${EnvironmentUrls.economyApi}/v1/groups/{groupId}/addfunds/latest`,
    postAddFundsUrl: `${EnvironmentUrls.economyApi}/v1/groups/{groupId}/addfunds`,
    getUsersGroupPayoutEligibility: `${EnvironmentUrls.economyApi}/v1/groups/{groupId}/users-payout-eligibility`
  },
  payoutTypes: {
    Amount: 'Amount',
    Percent: 'Percentage'
  },
  apiPayoutTypes: {
    Amount: 'FixedAmount',
    Percent: 'Percentage'
  },
  payoutRecipientTypes: {
    User: 'User',
    Group: 'Group'
  },
  addFundsMaxRobuxDefault: 10000000,
  addFundsErrorCodeMessages: {
    14: 'Message.MaximumExceeded',
    16: 'Message.InsufficentFunds'
  },
  guestRoleset: {
    name: 'Guest',
    rank: 0
  }
};

groupPayoutsModule.constant('groupPayoutsConstants', groupPayoutsConstants);
export default groupPayoutsConstants;
