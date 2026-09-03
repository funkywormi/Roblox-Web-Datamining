/**
 * Creates a tax object for payment contexts
 * @param taxAmount - The tax amount, can be undefined
 * @param currencyCode - The currency code for the tax
 * @param hasBillingAddress - Whether billing address is present (optional, defaults to true)
 * @returns Tax object or undefined if tax should not be set
 */
export function createTaxData(
  taxAmount: number | undefined,
  currencyCode: string,
  hasBillingAddress = true,
): { amount: number; currencyCode: string } | undefined {
  if (taxAmount !== undefined && hasBillingAddress) {
    return {
      amount: taxAmount,
      currencyCode,
    };
  }
  return undefined;
}
