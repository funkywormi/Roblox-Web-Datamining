import type { HttpPost } from "../providers/types";
import { COMMUTATION_CATEGORIES } from "../utils/constants";

/**
 * Reactivates a user's account if they're eligible for a consequence commutation.
 * Currently only used for the Second Chance educational pass.
 */
const reactivateAccountByCommutation = async (
  apiGatewayUrl: string,
  httpPost: HttpPost,
): Promise<unknown> => {
  return httpPost(`${apiGatewayUrl}/moderation-appeal-service/v2/consequence-commutation`, {
    type: COMMUTATION_CATEGORIES.Educational,
  });
};

export default reactivateAccountByCommutation;
