import { getDismissInterventionUrl, getModerationDetailUrl } from "../shared/url";
import type { UniversalFeatureRestrictionsApi } from "../types/hostConfig";
import type { ModerationDetail } from "../types/api";

/**
 * Generic HTTP primitives injected by the host. They return already-parsed response bodies so the
 * package stays agnostic of the host's transport layer.
 */
export interface UniversalFeatureRestrictionsHttp {
  httpGet: <T>(url: string) => Promise<T>;
  httpPost: (url: string, body: object) => Promise<void>;
}

interface CreateApiOptions extends UniversalFeatureRestrictionsHttp {
  /** Base URL of the user-moderation API (no trailing slash), e.g. environmentUrls.userModerationApi. */
  userModerationApiUrl: string;
}

/**
 * Builds a {@link UniversalFeatureRestrictionsApi} from generic HTTP primitives and the
 * user-moderation base URL. The endpoint URLs come from `shared/url`, and this factory owns the
 * request body shapes, so consumers only inject transport.
 */
export function createUniversalFeatureRestrictionsApi({
  httpGet,
  httpPost,
  userModerationApiUrl,
}: CreateApiOptions): UniversalFeatureRestrictionsApi {
  return {
    fetchModerationDetail: (abuseVector: string) =>
      httpGet<ModerationDetail | null>(getModerationDetailUrl(userModerationApiUrl, abuseVector)),
    dismissIntervention: (interventionId: string) =>
      httpPost(getDismissInterventionUrl(userModerationApiUrl), {
        intervention_id: interventionId,
      }),
  };
}
