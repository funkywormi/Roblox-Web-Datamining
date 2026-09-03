export type CreditBucket = "0" | "0-5" | "5-10" | "10-25" | "25-50" | "50-100" | "100+";

/** Buckets a credit balance into a low-cardinality range label for telemetry dimensions. */
export const getCreditBucket = (amount: number): CreditBucket => {
  if (amount <= 0) return "0";
  if (amount < 5) return "0-5";
  if (amount < 10) return "5-10";
  if (amount < 25) return "10-25";
  if (amount < 50) return "25-50";
  if (amount < 100) return "50-100";
  return "100+";
};

export default getCreditBucket;
