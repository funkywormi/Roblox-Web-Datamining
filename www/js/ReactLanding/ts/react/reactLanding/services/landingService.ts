// all functions that call apis relating to landing page
import { Guac } from 'Roblox';
import { TContentRatingLogoPolicyResponse } from '../../common/types/landingTypes';

export const getContentRatingLogoPolicy = async (): Promise<TContentRatingLogoPolicyResponse> => {
  return Guac.callBehaviour<TContentRatingLogoPolicyResponse>('content-rating-logo');
};

export default {
  getContentRatingLogoPolicy
};
