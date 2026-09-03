import { PaymentProvider } from '../types/subscriptionEnums';

const REAL_PROVIDERS: PaymentProvider[] = (
  Object.values(PaymentProvider) as PaymentProvider[]
).filter(v => v !== PaymentProvider.INVALID);

/** Lowercase → canonical enum for real payment providers only. */
const PAYMENT_PROVIDER_BY_LOWER = new Map<string, PaymentProvider>(
  REAL_PROVIDERS.map(value => [value.toLowerCase(), value])
);

/**
 * Maps a subscription API `paymentProvider` to a {@link PaymentProvider} enum or `undefined`.
 * Returns the canonical enum for known providers (case-insensitive).
 * Everything else — `null`, empty, `"Internal"`, `"Invalid"`, or unrecognized — returns
 * `undefined` (meaning no external payment provider).
 */
export function normalizeSubscriptionPaymentProvider(
  raw: PaymentProvider | string | null | undefined
): PaymentProvider | undefined {
  return PAYMENT_PROVIDER_BY_LOWER.get(raw?.toLowerCase() ?? '');
}
