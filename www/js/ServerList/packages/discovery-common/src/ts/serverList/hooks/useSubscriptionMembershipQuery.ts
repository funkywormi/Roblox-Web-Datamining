import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { ProductType } from "@rbx/client-subscriptions-api/v1";
import { subscriptionsV2Api } from "../clients/subscriptions";

const DEFAULT_PRODUCT_TYPE = ProductType.Blackbird;

type SubscriptionMembershipQueryKey = readonly ["subscription-membership", ProductType];

type SubscriptionMembershipQueryOptions = Omit<
  UseQueryOptions<boolean, Error, boolean, SubscriptionMembershipQueryKey>,
  "queryKey" | "queryFn"
>;

// Shared query for active Plus membership. productType is positional (cache key);
// options forwards to useQuery for enabled / refetchInterval / select / etc.
export const useSubscriptionMembershipQuery = (
  productType: ProductType = DEFAULT_PRODUCT_TYPE,
  options?: SubscriptionMembershipQueryOptions,
) =>
  useQuery<boolean, Error, boolean, SubscriptionMembershipQueryKey>({
    queryKey: ["subscription-membership", productType],
    queryFn: async () => {
      const { subscriptions } = await subscriptionsV2Api.subscriptionsV2ListSubscriptions({
        productType,
        expirationTimestampMsStart: Date.now(),
        resultsPerPage: 1,
      });
      return subscriptions.length > 0;
    },
    retry: 2,
    retryDelay: 100,
    ...options,
  });
