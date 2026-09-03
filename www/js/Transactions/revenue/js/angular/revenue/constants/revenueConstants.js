import { EnvironmentUrls } from 'Roblox';
import revenueModule from '../revenueModule';

const revenueConstants = {
  revenueTargetTypes: {
    User: 'User',
    Group: 'Group'
  },
  urls: {
    getGroupCurrencyUrl: `${EnvironmentUrls.economyApi}/v1/groups/{groupId}/currency`,
    getUserCurrencyUrl: `${EnvironmentUrls.economyApi}/v1/users/{userId}/currency`,
    getTransactionRecordsApiGroupRevenueSummaryUrl: `${EnvironmentUrls.apiGatewayUrl}/transaction-records/v1/groups/{groupId}/revenue/summary/{timeFrame}`,
    getTransactionRecordsApiUserRevenueSummaryUrl: `${EnvironmentUrls.apiGatewayUrl}/transaction-records/v1/users/{userId}/transaction-totals`,
    getEconomyMetadataUrl: `${EnvironmentUrls.economyApi}/v2/metadata`
  },
  timeFrames: {
    Day: 'Day',
    Week: 'Week',
    Month: 'Month',
    Year: 'Year'
  }
};

revenueModule.constant('revenueConstants', revenueConstants);
export default revenueConstants;
