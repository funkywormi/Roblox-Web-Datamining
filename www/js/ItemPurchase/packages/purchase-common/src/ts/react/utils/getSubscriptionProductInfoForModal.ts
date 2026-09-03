export default function getSubscriptionProductInfoForModal<T>(
  assetType: string,
  displayPrice: string | undefined,
  subscriptionProductInfo: T | null | undefined
): T | undefined {
  if (assetType === 'Subscription' && displayPrice) {
    return undefined;
  }
  return subscriptionProductInfo || undefined;
}
