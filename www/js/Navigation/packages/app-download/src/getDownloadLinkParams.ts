import createDeeplinkToken from "./deferredDeeplinkTokenService";
import { resolveDeeplinkTokenParams } from "./resolveDeeplinkTokenParams";

/**
 * Search params to append to a direct download URL: `{ token }`, or `{}` when there is no token.
 *
 * This is a plain object rather than a `UrlSearchParams` on purpose. On .NET pages
 * `@rbx/core-lib/url` is a runtime external while `@rbx/core-lib/url/any` is bundled, so a
 * `UrlSearchParams` from one copy fails `instanceof` in the other and gets appended as
 * `searchParams=token%3D…`. Plain objects work with every copy.
 */
export type DownloadLinkParams = Readonly<{ token: string } | Record<string, never>>;

export const getDownloadLinkParams = async ({
  linkId,
  downloadSource,
}: {
  linkId?: string;
  downloadSource?: string;
}): Promise<DownloadLinkParams> => {
  if (linkId == null) {
    return {};
  }
  const { authTicket, btId } = await resolveDeeplinkTokenParams();
  const token = await createDeeplinkToken(linkId, { authTicket, btId, downloadSource });
  if (!token) {
    return {};
  }
  return { token };
};
