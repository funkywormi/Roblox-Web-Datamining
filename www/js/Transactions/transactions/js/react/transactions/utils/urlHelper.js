import { EnvironmentUrls } from 'Roblox';
import { AgentType } from '../../../../ts';

const { websiteUrl, economyApi, twoStepVerificationApi, apiGatewayUrl, domain } = EnvironmentUrls;

function getTransactionsUrl(targetId, targetType) {
  const targetTypePathName = targetType === AgentType.User ? 'users' : 'groups';
  return `${apiGatewayUrl}/transaction-records/v1/${targetTypePathName}/${targetId}/transactions`;
}

function getRevenueSummaryUrl(userId, usedTypes, timeFrame) {
  const urlPath = `${apiGatewayUrl}/transaction-records/v1/users/${userId}/transaction-totals?usedTypes=${usedTypes}&timeFrame=${timeFrame}&transactionType=summary`;
  return { url: urlPath, withCredentials: true };
}

function getUsedTransactionTypesUrl(userId) {
  const urlPath = `${apiGatewayUrl}/transaction-records/v1/users/${userId}/transaction-types`;
  return { url: urlPath, withCredentials: true };
}

function getBuyRobuxUrl() {
  return `${websiteUrl}/upgrades/robux`;
}

function getParentalControlsUrl() {
  return '/my/account#!/parental-controls';
}

function getCurrencyUrl(userId) {
  const urlPath = `${economyApi}/v1/users/${userId}/currency`;
  return { url: urlPath, withCredentials: true };
}

function getEconomyMetadataUrl() {
  const urlPath = `${economyApi}/v2/metadata`;
  return { url: urlPath, withCredentials: true };
}

function getTwoStepVerificationUrl(userId) {
  const urlPath = `${twoStepVerificationApi}/v1/users/${userId}/configuration`;
  return { url: urlPath, withCredentials: true };
}

function getSalesReportDownloadUrl() {
  const urlPath = `${apiGatewayUrl}/transaction-records/v1/sales/sales-report-download`;
  return { url: urlPath, withCredentials: true };
}

function getParentInfoUrl() {
  const urlPath = `${apiGatewayUrl}/parental-controls-api/v1/parental-controls/get-linked-parents`;
  return { url: urlPath, withCredentials: true };
}

function getFiatPaidAccessPurchasesUrl(limit, cursor, fetchBackwardsFromCursor) {
  const urlPath = `${apiGatewayUrl}/fiat-paid-access-service/v1/purchase/list-by-user?limit=${limit}&cursor=${cursor}&fetchBackwardsFromCursor=${fetchBackwardsFromCursor}`;
  return { url: urlPath, withCredentials: true };
}

function getLicensingHelpUrl() {
  return 'https://create.roblox.com/docs/ip-licensing/creators/';
}

function getCreatorHubTransactionsUrl(groupId, userId) {
  const url = `https://create.${domain}/dashboard/transactions`;
  // Pass the context so Creator Hub switches to it on arrival rather than restoring whichever
  // creator the visitor last had selected there: `groupId` for a group, `userId` for the
  // personal context. The two are mutually exclusive; a group takes precedence when both exist.
  if (groupId) {
    return `${url}?groupId=${groupId}`;
  }
  if (userId) {
    return `${url}?userId=${userId}`;
  }
  return url;
}

function getCheckHasFiatPaidAccessPurchaseUrl() {
  const urlPath = `${apiGatewayUrl}/fiat-paid-access-service/v1/purchase/check-by-user`;
  return { url: urlPath, withCredentials: true };
}

export {
  getTransactionsUrl,
  getRevenueSummaryUrl,
  getUsedTransactionTypesUrl,
  getBuyRobuxUrl,
  getParentalControlsUrl,
  getCurrencyUrl,
  getEconomyMetadataUrl,
  getTwoStepVerificationUrl,
  getSalesReportDownloadUrl,
  getParentInfoUrl,
  getFiatPaidAccessPurchasesUrl,
  getLicensingHelpUrl,
  getCheckHasFiatPaidAccessPurchaseUrl,
  getCreatorHubTransactionsUrl
};
