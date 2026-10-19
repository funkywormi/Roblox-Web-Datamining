/** Query keys for Plus plan changes. Every key starts with `all()`, so a change can refresh them together. */
export const planChangeQueryKeys = {
  all: () => ["plus-plan-changes"] as const,
  products: () => ["plus-plan-changes", "products"] as const,
  // Set after a cancel when this page has no package list to put back.
  productsRefresh: () => ["plus-plan-changes", "products-refresh"] as const,
  pending: (subscriptionId: string) => ["plus-plan-changes", "pending", subscriptionId] as const,
  product: (productId: string) => ["plus-plan-changes", "product", productId] as const,
} as const;
