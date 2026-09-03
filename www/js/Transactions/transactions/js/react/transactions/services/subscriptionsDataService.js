import { httpService } from 'core-utilities';
import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

const getSubscriptionProductKey = (targetId, targetType) => {
  let typePrefix = 'unknown';
  switch (targetType) {
    case 'DeveloperSubscriptionProduct':
      typePrefix = 'EXP';
      break;
    default:
      break;
  }
  return `${typePrefix}-${targetId}`;
};

function getSubscriptionsUrl(targetKey) {
  // includeDeletedProduct is true since the developer should see transactions for deleted products
  return `${apiGatewayUrl}/v1/subscriptions/${targetKey}/product-info?includeDeletedProduct=true`;
}

const getSubscriptionProductInfoRequest = targetKey => {
  const urlConfig = {
    url: getSubscriptionsUrl(targetKey),
    retryable: true,
    withCredentials: true
  };

  return httpService.get(urlConfig);
};

const fetchSubscriptionProductInfo = async transactionItems => {
  const uniqueSubscriptionProductIds = [
    ...new Set(
      transactionItems.map(txn =>
        getSubscriptionProductKey(
          txn.details.subscriptionProductTargetId,
          txn.details.subscriptionProductTargetType
        )
      )
    )
  ];
  const uniqueSubscriptionsMap = {};
  const requests = uniqueSubscriptionProductIds.map(async subscriptionProductId => {
    const subscriptionProduct = await getSubscriptionProductInfoRequest(subscriptionProductId);
    uniqueSubscriptionsMap[subscriptionProductId] = subscriptionProduct;
  });
  await Promise.all(requests);
  return uniqueSubscriptionsMap;
};

export { getSubscriptionProductKey, fetchSubscriptionProductInfo };
