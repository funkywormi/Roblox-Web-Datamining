import { callBehaviour } from "@rbx/core-scripts/guac";
import { TCookiePolicy } from "../types/cookiePolicyTypes";

const getCookiePolicy = async (): Promise<TCookiePolicy> => {
  const cookiePolicy = await callBehaviour<TCookiePolicy>("cookie-policy");
  return cookiePolicy;
};

export default { getCookiePolicy };
