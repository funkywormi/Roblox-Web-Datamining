import { httpService } from 'core-utilities';
import apiConstants from '../constants/apiEndpoint';

const getHasPremiumMembership = async (profileId: number): Promise<boolean> => {
  const { data }: { data: boolean } = await httpService.get(
    apiConstants.validatePremumMembership(profileId)
  );
  return data;
};

export default {
  getHasPremiumMembership
};
