import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { Cookies } from "@rbx/core-scripts/legacy/Roblox";
import { getAuthTicket } from "./getAuthTicket";

const readBrowserTrackerId = (): string | undefined => {
  const value = Cookies?.getBrowserTrackerId();
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

export type DeeplinkTokenParams = {
  authTicket?: string;
  btId?: string;
};

export const resolveDeeplinkTokenParams = async (): Promise<DeeplinkTokenParams> => {
  const authTicket = authenticatedUser() != null ? await getAuthTicket() : undefined;
  const btId = readBrowserTrackerId();
  return { authTicket, btId };
};
