import { Guac } from 'Roblox';

export default {
  getLegalTextDisplayedBehavior: () => {
    return Guac.callBehaviour('legal-text-eea-uk');
  },
  getFiatPaidAccessEnabledBehavior: () => {
    return Promise.resolve({ isFiatPaidAccessEnabled: true });
  }
};
