/** Query keys for Plus plan changes. Every key starts with `all()`, so a change can refresh them together. */
export const planChangeQueryKeys = {
  all: () => ["plus-plan-changes"] as const,
  products: () => ["plus-plan-changes", "products"] as const,
  pending: (subscriptionId: string) => ["plus-plan-changes", "pending", subscriptionId] as const,
} as const;
