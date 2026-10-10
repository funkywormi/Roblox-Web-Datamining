import { UrlSearchParams } from "@rbx/core-lib/url";
import createDeeplinkToken from "./deferredDeeplinkTokenService";
import { resolveDeeplinkTokenParams } from "./resolveDeeplinkTokenParams";

export const getDownloadLinkParams = async ({
  linkId,
  downloadSource,
}: {
  linkId?: string;
  downloadSource?: string;
}): Promise<UrlSearchParams> => {
  if (linkId == null) {
    return UrlSearchParams.empty;
  }
  const { authTicket, btId } = await resolveDeeplinkTokenParams();
  const token = await createDeeplinkToken(linkId, { authTicket, btId, downloadSource });
  if (!token) {
    return UrlSearchParams.empty;
  }
  return UrlSearchParams.new({ token });
};
