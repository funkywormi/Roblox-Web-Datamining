import { AxiosPromise, httpService } from "core-utilities";
import { callBehaviour } from "@rbx/core-scripts/guac";
import catalogConstants from "../constants/catalogConstants";

export type VngBuyRobuxPolicyResponse = {
  shouldShowVng: boolean;
};

export type AppPolicyBehaviorResponse = {
  EnableContinuousLoad: boolean;
};

class UniversalAppConfigurationService {
  static getVngBuyRobuxPolicy(): Promise<VngBuyRobuxPolicyResponse> {
    return callBehaviour<VngBuyRobuxPolicyResponse>("vng-buy-robux");
  }

  static getAppPolicy(): Promise<AppPolicyBehaviorResponse> {
    return callBehaviour<AppPolicyBehaviorResponse>("app-policy");
  }
}

export default UniversalAppConfigurationService;
