import { callBehaviour } from '@rbx/core-scripts/guac';
import { VngGuacResponse } from '../constants/serviceTypeDefinitions';

export default async function getShouldShowVng(): Promise<boolean> {
  try {
    const response = await callBehaviour<VngGuacResponse>('vng-buy-robux');
    return Promise.resolve(response.shouldShowVng);
  } catch (e) {
    return Promise.reject(e);
  }
}
