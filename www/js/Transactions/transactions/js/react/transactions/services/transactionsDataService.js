import { httpService } from 'core-utilities';
import {
  getTransactionsUrl,
  getRevenueSummaryUrl,
  getUsedTransactionTypesUrl,
  getCurrencyUrl,
  getEconomyMetadataUrl,
  getTwoStepVerificationUrl,
  getSalesReportDownloadUrl,
  getFiatPaidAccessPurchasesUrl,
  getCheckHasFiatPaidAccessPurchaseUrl
} from '../utils/urlHelper';
import errorCodes from '../constants/errorConstants';
import {
  AgentType,
  SummaryTimeFrame,
  TransactionItemType,
  TransactionOriginType
} from '../../../../ts';
import { PRICING_TYPE_FIAT_PAID_ACCESS } from '../constants/itemPricingTypeConstants';

const cachedRevenueSummaryResponses = {
  [SummaryTimeFrame.Day]: null,
  [SummaryTimeFrame.Week]: null,
  [SummaryTimeFrame.Month]: null,
  [SummaryTimeFrame.Year]: null
};
const FIAT_PURCHASE_STATUS_REFUNDED = 'PURCHASE_STATUS_REFUNDED';
const ENTITY_TYPE_USER = 'ENTITY_TYPE_USER';

function inverseDateCompare(transaction1, transaction2) {
  const d1 = new Date(transaction1.created);
  const d2 = new Date(transaction2.created);

  if (d1.valueOf() > d2.valueOf()) {
    return -1;
  }
  if (d1.valueOf() < d2.valueOf()) {
    return 1;
  }
  return 0;
}

const getTransactionHistoryRequest = params => {
  const urlConfig = {
    url: getTransactionsUrl(params.targetId, params.targetType),
    retryable: true,
    withCredentials: true
  };
  const data = {
    cursor: params.cursor,
    limit: params.count,
    transactionType: params.transactionType,
    itemPricingType: params.itemPricingType
  };

  return httpService.get(urlConfig, data);
};

// Make a call to economyAPI endpoint to retrieve transactions
const getTransactionHistory = async params => {
  return new Promise((resolve, reject) => {
    if (params.transactionType) {
      if (
        params.isFiatPaidAccessEnabled &&
        params.itemPricingType === PRICING_TYPE_FIAT_PAID_ACCESS
      ) {
        const url = getFiatPaidAccessPurchasesUrl(params.count, params.cursor, false);
        httpService.get(url).then(
          response => {
            const { data } = response;
            const { purchases, previousCursor, nextCursor, hasMore } = data;
            const mapData = {
              nextPageCursor: hasMore ? nextCursor : null,
              previousPageCursor: previousCursor,
              items: purchases.map(purchase => ({
                id: purchase.transactionId,
                created: purchase.createdTime,
                agent: {
                  id: purchase.seller.longValue,
                  type:
                    purchase.seller.type === ENTITY_TYPE_USER ? AgentType.User : AgentType.Group,
                  name: purchase.sellerName
                },
                details: {
                  id: purchase.rootPlaceId,
                  name: purchase.universeName,
                  type: TransactionItemType.Place,
                  place: {
                    placeId: purchase.rootPlaceId,
                    name: purchase.universeName,
                    universeId: purchase.universeId
                  },
                  refunded: purchase.status === FIAT_PURCHASE_STATUS_REFUNDED,
                  agreementId: purchase.agreementId,
                  licensingPaymentTransactionOriginType:
                    purchase.licensingPaymentTransactionOriginType
                },
                amountInLocalCurrency: purchase.priceSold.localizedFormattedFiatPrice,
                transactionType: TransactionOriginType.Purchase
              })),
              fetchBackwardsFromCursor: false
            };
            resolve(mapData);
          },
          error => {
            if (error?.data?.errors) {
              reject(error.data.errors);
            }
          }
        );
      } else {
        getTransactionHistoryRequest(params).then(
          response => {
            const { data } = response;
            const { data: rawItems, previousPageCursor, nextPageCursor } = data;
            const items = rawItems.sort(inverseDateCompare);

            let formattedItems;
            if (params.targetType === AgentType.Group) {
              formattedItems = items.map(transaction => {
                return { ...transaction, transactionType: params.transactionType };
              });
            }

            const mapData = {
              nextPageCursor,
              previousPageCursor,
              items: formattedItems || items
            };
            resolve(mapData);
          },
          error => {
            if (error?.data?.errors) {
              reject(error.data.errors);
            }
          }
        );
      }
    } else {
      const errors = [{ code: errorCodes.invalidUser }];
      reject(errors);
    }
  });
};

// Make a call to economyAPI endpoint to retrieve summary data (totals)
function getRevenueSummary(userId, usedTypes, timeFrame) {
  const url = getRevenueSummaryUrl(userId, usedTypes, timeFrame);
  return new Promise((resolve, reject) => {
    if (cachedRevenueSummaryResponses[timeFrame]) {
      resolve(cachedRevenueSummaryResponses[timeFrame]);
      return;
    }
    if (timeFrame) {
      httpService.get(url).then(
        response => {
          // Cache result
          cachedRevenueSummaryResponses[timeFrame] = response;
          resolve(response);
        },
        errors => {
          if (errors && errors.response && errors.response.data && errors.response.data.errors) {
            reject(errors.response.data.errors);
          }
        }
      );
    } else {
      const errors = [{ code: errorCodes.invalidUserId }];
      reject(errors);
    }
  });
}

// Make a call to economyAPI endpoint to retrieve transaction types user has
// used in their lifetime
function getUsedTransactionTypeFlags(userId) {
  const url = getUsedTransactionTypesUrl(userId);
  return new Promise((resolve, reject) => {
    httpService.get(url).then(
      response => {
        resolve(response);
      },
      errors => {
        if (errors && errors.response && errors.response.data && errors.response.data.errors) {
          reject(errors.response.data.errors);
        }
      }
    );
  });
}

function getHasFiatPaidAccessPurchase() {
  const url = getCheckHasFiatPaidAccessPurchaseUrl();
  return new Promise((resolve, reject) => {
    httpService.get(url).then(
      response => {
        resolve(response.data.hasPurchases);
      },
      errors => {
        if (errors && errors.response && errors.response.data && errors.response.data.errors) {
          reject(errors.response.data.errors);
        }
      }
    );
  });
}

// Make a call to economyAPI endpoint to retrieve currency balance
function getCurrency(userId) {
  const url = getCurrencyUrl(userId);
  return new Promise((resolve, reject) => {
    if (userId) {
      httpService.get(url).then(
        response => {
          resolve(response);
        },
        errors => {
          if (errors && errors.response && errors.response.data && errors.response.data.errors) {
            reject(errors.response.data.errors);
          }
        }
      );
    } else {
      const errors = [{ code: errorCodes.invalidUserId }];
      reject(errors);
    }
  });
}

function getUserConfiguration(userId) {
  const url = getTwoStepVerificationUrl(userId);
  return new Promise((resolve, reject) => {
    httpService.get(url).then(
      response => {
        resolve(response);
      },
      errors => {
        if (errors?.data?.errors) {
          reject(errors.data.errors);
        }
      }
    );
  });
}

function getEconomyMetadata() {
  const url = getEconomyMetadataUrl();
  return new Promise(resolve => {
    httpService.get(url).then(
      response => {
        if (response?.data) {
          resolve(response.data);
        }
        resolve({});
      },
      _ => {
        resolve({});
      }
    );
  });
}

function requestSalesReportDownload(targetId, targetType, dateRange, transactionType) {
  const url = getSalesReportDownloadUrl();
  const [start, end] = dateRange;
  const requestBody = {
    targetId,
    targetType,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    transactionType
  };
  return new Promise((resolve, reject) => {
    httpService.post(url, requestBody).then(
      response => {
        resolve(response);
      },
      errors => {
        if (errors?.data?.errors) {
          reject(errors.data.errors);
        }
        reject(errors);
      }
    );
  });
}

export {
  getTransactionHistory,
  getRevenueSummary,
  getUsedTransactionTypeFlags,
  getCurrency,
  getUserConfiguration,
  getEconomyMetadata,
  requestSalesReportDownload,
  getHasFiatPaidAccessPurchase
};
