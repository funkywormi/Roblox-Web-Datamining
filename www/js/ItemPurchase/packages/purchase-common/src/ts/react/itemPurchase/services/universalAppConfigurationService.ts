import { callBehaviour } from '@rbx/core-scripts/guac';

export default {
  getVngBuyRobuxBehavior: () => {
    return callBehaviour<{ shouldShowVng: boolean }>('vng-buy-robux');
  }
};
