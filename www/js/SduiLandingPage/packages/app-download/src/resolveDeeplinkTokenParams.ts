import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { Cookies } from "@rbx/core-scripts/legacy/Roblox";
import ExperimentationService from "@rbx/experimentation";
import { getAuthTicket } from "./getAuthTicket";

export const deeplinkFunnelIxpLayerName = "Website.DownloadFunnel";
export const deeplinkTokenIxpKey = "IsDeeplinkTokenEnabled";

const readBrowserTrackerId = (): string | undefined => {
  const value = Cookies?.getBrowserTrackerId();
  return typeof value === "string" && value.length > 0 ? value : undefined;
};

export type DeeplinkTokenParams = {
  authTicket?: string;
  btId?: string;
};

export type ResolveDeeplinkTokenParamsOptions = {
  ixpValues?: Record<string, unknown>;
};

export const resolveDeeplinkTokenParams = async ({
  ixpValues,
}: ResolveDeeplinkTokenParamsOptions = {}): Promise<DeeplinkTokenParams> => {
  let values = ixpValues;
  if (values == null) {
    try {
      values = await ExperimentationService.getAllValuesForLayer(deeplinkFunnelIxpLayerName);
    } catch {
      values = {};
    }
  }

  const isAuthTicketEnabled = values[deeplinkTokenIxpKey] === true;
  const authTicket =
    authenticatedUser() != null && isAuthTicketEnabled ? await getAuthTicket() : undefined;
  const btId = readBrowserTrackerId();

  return { authTicket, btId };
};

export default resolveDeeplinkTokenParams;
