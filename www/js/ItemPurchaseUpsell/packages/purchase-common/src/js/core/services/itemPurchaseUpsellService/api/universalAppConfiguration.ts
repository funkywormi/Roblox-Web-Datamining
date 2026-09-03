import { Guac } from '@rbx/legacy-webapp-types/Roblox';
import { VngGuacResponse } from '../constants/serviceTypeDefinitions';

export default async function getShouldShowVng(): Promise<boolean> {
  try {
    const response = await Guac.callBehaviour<VngGuacResponse>('vng-buy-robux');
    return Promise.resolve(response.shouldShowVng);
  } catch (e) {
    return Promise.reject(e);
  }
}
