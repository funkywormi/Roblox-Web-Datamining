import { Guac } from 'Roblox';
import { TGetWebProfileUIPolicyResponse } from '../types/profileHeaderTypes';

const getPolicies = async (): Promise<TGetWebProfileUIPolicyResponse> => {
  const { data }: { data: TGetWebProfileUIPolicyResponse } = await Guac.callBehaviour(
    'web-profile-ui'
  );
  return data;
};

export default {
  getPolicies
};
