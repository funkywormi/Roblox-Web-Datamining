import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { getBrowserTrackerId } from "@rbx/www-common/browser-tracker";
import { getAuthTicket } from "./getAuthTicket";

export type DeeplinkTokenParams = {
  authTicket?: string;
  btId?: string;
};

export const resolveDeeplinkTokenParams = async (): Promise<DeeplinkTokenParams> => {
  const authTicket = authenticatedUser() != null ? await getAuthTicket() : undefined;
  return { authTicket, btId: getBrowserTrackerId() || undefined };
};
