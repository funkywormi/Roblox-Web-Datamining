import type { CreditConversionData, RedeemReponse } from "../types/GiftCardTypes";

export const requiresCreditConversion = (
  data: RedeemReponse,
  conversionErrorCode: number,
): boolean => {
  const error = data.errors?.[0];
  if (error?.code !== conversionErrorCode || !error.fieldData) {
    return false;
  }

  try {
    return Boolean((JSON.parse(error.fieldData) as CreditConversionData | undefined)?.grantCredit);
  } catch {
    return false;
  }
};
