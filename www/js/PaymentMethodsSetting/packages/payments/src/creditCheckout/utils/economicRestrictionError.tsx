import { TranslateFunction } from "react-utilities";

type EconomicRestrictionInfo = {
  expirationTimeInMinutes: number;
  failureReason: string;
};

type EconomicRestrictionError = {
  data: EconomicRestrictionInfo;
};

export function isEconomicRestrictionError(object: unknown): object is EconomicRestrictionError {
  const economicRestrictionError = object as EconomicRestrictionError;
  return (
    economicRestrictionError.data !== undefined &&
    economicRestrictionError.data.expirationTimeInMinutes !== undefined &&
    economicRestrictionError.data.failureReason !== undefined
  );
}

type TEconomicRestrictionErrorMsgProps = {
  translate: TranslateFunction;
  violation: string;
  timeoutDurationInMinutes: number;
};

export enum ViolationLabel {
  FraudPaymentAuthorizationAttempt = "FraudPaymentAuthorizationAttempt",
  FraudVirtualEconomyAbuse = "FraudVirtualEconomyAbuse",
  FraudAbuseOfAffiliateSystem = "FraudAbuseOfAffiliateSystem",
  FraudAttemptedUnauthorizedPaymentMethodUse = "FraudAttemptedUnauthorizedPaymentMethodUse",
  FraudRepeatedRefundRequests = "FraudRepeatedRefundRequests",
  FraudSuspiciousRefundRequests = "FraudSuspiciousRefundRequests",
  FraudUnauthorizedPurchase = "FraudUnauthorizedPurchase",
  FraudUseOfUnauthorizedOffPlatformTransactions = "FraudUseOfUnauthorizedOffPlatformTransactions",
  FraudUseOfUnauthorizedPaymentMethod = "FraudUseOfUnauthorizedPaymentMethod",
  FraudSuspiciousAccountPatterns = "FraudSuspiciousAccountPatterns",
  FraudChargeback = "FraudChargeback",
}

function getViolationLabel(translate: TranslateFunction, violation: string) {
  switch (violation) {
    case ViolationLabel.FraudPaymentAuthorizationAttempt:
      return translate("Label.Sublabel.FraudPaymentAbuse");
    case ViolationLabel.FraudVirtualEconomyAbuse:
      return translate("Label.Sublabel.FraudVirtualEconomyAbuse");
    case ViolationLabel.FraudAbuseOfAffiliateSystem:
      return translate("Label.Sublabel.FraudAbuseOfTheAffiliateSystem");
    case ViolationLabel.FraudAttemptedUnauthorizedPaymentMethodUse:
      return translate("Label.Sublabel.FraudAttemptedUnauthorizedPaymentMethodUse");
    case ViolationLabel.FraudRepeatedRefundRequests:
      return translate("Label.Sublabel.FraudRepeatedRefundRequests");
    case ViolationLabel.FraudSuspiciousRefundRequests:
      return translate("Label.Sublabel.FraudSuspiciousRefundRequests");
    case ViolationLabel.FraudUnauthorizedPurchase:
      return translate("Label.Sublabel.FraudUnauthorizedPurchase");
    case ViolationLabel.FraudUseOfUnauthorizedOffPlatformTransactions:
      return translate("Label.Sublabel.FraudUseOfUnauthorizedOffPlatformTransactions");
    case ViolationLabel.FraudUseOfUnauthorizedPaymentMethod:
      return translate("Label.Sublabel.FraudUseOfUnauthorizedPaymentMethod");
    case ViolationLabel.FraudSuspiciousAccountPatterns:
      return translate("Label.Sublabel.FraudSuspiciousAccountPatterns");
    case ViolationLabel.FraudChargeback:
      return translate("Label.AbuseType.Chargeback");
    default:
      return translate("Label.Sublabel.FraudPaymentAbuse");
  }
}

export function getEconomicRestrictionErrorMsg({
  translate,
  violation,
  timeoutDurationInMinutes,
}: TEconomicRestrictionErrorMsgProps): string {
  const timeoutInHours = Math.ceil(timeoutDurationInMinutes / 60);
  if (timeoutInHours > 24) {
    const timeoutInDays = Math.ceil(timeoutInHours / 24);
    return translate("Text.EconomicRestrictionsDays", {
      violation: getViolationLabel(translate, violation),
      day: timeoutInDays,
    });
  }
  return translate("Text.EconomicRestrictionsHours", {
    violation: getViolationLabel(translate, violation),
    hour: timeoutInHours,
  });
}
