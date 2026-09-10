// all functions that call apis relating to landing page
import { callBehaviour } from "@rbx/core-scripts/guac";
import { TContentRatingLogoPolicyResponse } from "@rbx/authentication-common/types/landingTypes";

export const getContentRatingLogoPolicy = async (): Promise<TContentRatingLogoPolicyResponse> => {
  return callBehaviour<TContentRatingLogoPolicyResponse>("content-rating-logo");
};

export default {
  getContentRatingLogoPolicy,
};
