import { Guac } from 'Roblox';
import { TIntAuthComplianceResponse } from '../types/intAuthComplianceTypes';

export const getIntAuthCompliancePolicy = async (): Promise<TIntAuthComplianceResponse> => {
  const data = await Guac.callBehaviour<TIntAuthComplianceResponse>('intl-auth-compliance');
  return data;
};

export default {
  getIntAuthCompliancePolicy
};
