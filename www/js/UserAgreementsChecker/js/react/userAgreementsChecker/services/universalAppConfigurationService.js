import { Guac } from 'Roblox';

export default {
  getCooldownPeriodInMs() {
    return Guac.callBehaviour('user-agreements-policy');
  }
};
