import { PUNISHMENT_TYPE, VERIFICATION_CATEGORIES } from "./constants";

export default function canReactivate(
  punishmentTypeDescription: PUNISHMENT_TYPE,
  endDate: string,
  verificationCategory: string,
): boolean {
  if (
    verificationCategory === VERIFICATION_CATEGORIES.Email ||
    verificationCategory === VERIFICATION_CATEGORIES.VPC
  ) {
    return true;
  }

  const endDateTimeObject = new Date(endDate);
  const isPastEndDate = endDateTimeObject < new Date();

  return (
    punishmentTypeDescription === PUNISHMENT_TYPE.Warn ||
    (punishmentTypeDescription !== PUNISHMENT_TYPE.Delete && isPastEndDate)
  );
}
