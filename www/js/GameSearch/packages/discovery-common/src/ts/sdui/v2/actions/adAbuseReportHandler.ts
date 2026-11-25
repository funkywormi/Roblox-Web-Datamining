import { getCurrentUser } from "@rbx/www-common/user";
import { readParam } from "@rbx/sdui-core";
import { getAbuseReportRevampUrl } from "../../../common/constants/abuseReportConstants";

/**
 * Ad reports from a sponsored game tile, in the URL the non-SDUI web game tile
 * sends: the universe goes in `custom.stringId`, as the report page reads it.
 */
export function openAdAbuseReportResolveHref(
  actionParams: Record<string, unknown>,
): string | undefined {
  const targetId = readParam(actionParams, "targetId", "target_id");
  const abuseVector = readParam(actionParams, "abuseVector", "abuse_vector");
  const submitterId = getCurrentUser()?.id;
  if (!targetId || !abuseVector || submitterId == null) {
    return undefined;
  }
  return getAbuseReportRevampUrl({
    targetId,
    abuseVector,
    submitterId: String(submitterId),
    universeId: readParam(actionParams, "universeId", "universe_id") ?? "",
    adCreativeAssetId: readParam(actionParams, "adCreativeAssetId", "ad_creative_asset_id"),
  });
}
