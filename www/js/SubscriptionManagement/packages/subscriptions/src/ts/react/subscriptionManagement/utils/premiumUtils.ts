import { PremiumSubscription } from '../../../core/types/premiumSubscription';
import { PeriodType } from '../../../core/types/subscriptionEnums';
import { ROBLOX_ANNUAL_PREMIUM } from '../constants/constants';

const isAnnualPremium = (subscription: PremiumSubscription) => {
  return (
    subscription.name.toLowerCase().includes('12 months') ||
    subscription.name.toLowerCase().includes('annual')
  );
};

export const premiumPeriod = (subscription: PremiumSubscription): PeriodType => {
  if (isAnnualPremium(subscription)) {
    return PeriodType.YEAR;
  }
  return PeriodType.MONTH;
};

export const premiumName = (subscription: PremiumSubscription): string => {
  if (isAnnualPremium(subscription)) {
    return ROBLOX_ANNUAL_PREMIUM;
  }
  return subscription.name;
};
