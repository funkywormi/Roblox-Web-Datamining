import type { HttpPost } from "../providers/types";

/**
 * Simple function to reactivate a user's account back to a normal state.
 */
const reactivateAccount = (userModerationApiUrl: string, httpPost: HttpPost): Promise<unknown> =>
  httpPost(`${userModerationApiUrl}/v1/not-approved/reactivate`);

export default reactivateAccount;
