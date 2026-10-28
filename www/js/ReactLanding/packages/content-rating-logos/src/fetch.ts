import { callBehaviour } from "@rbx/core-scripts/guac";

type TContentRatingLogoPolicyResponse = {
  displayBrazilRatingLogo: boolean;
  displayItalyRatingLogo: boolean;
};

export const getContentRatingLogoPolicy = (): Promise<TContentRatingLogoPolicyResponse> =>
  callBehaviour<TContentRatingLogoPolicyResponse>("content-rating-logo");
