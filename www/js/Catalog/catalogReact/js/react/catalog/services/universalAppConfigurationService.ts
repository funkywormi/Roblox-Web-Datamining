import { AxiosPromise, httpService } from 'core-utilities';
import { Guac } from 'Roblox';
import catalogConstants from '../constants/catalogConstants';

export type VngBuyRobuxPolicyResponse = {
  shouldShowVng: boolean;
};

export type AppPolicyBehaviorResponse = {
  EnableContinuousLoad: boolean;
};

class UniversalAppConfigurationService {
  static getVngBuyRobuxPolicy(): Promise<VngBuyRobuxPolicyResponse> {
    return Guac.callBehaviour<VngBuyRobuxPolicyResponse>('vng-buy-robux');
  }

  static getAppPolicy(): Promise<AppPolicyBehaviorResponse> {
    return Guac.callBehaviour<AppPolicyBehaviorResponse>('app-policy');
  }
}

export default UniversalAppConfigurationService;
