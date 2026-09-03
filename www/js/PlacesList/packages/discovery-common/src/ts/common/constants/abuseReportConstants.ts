/**
 * Retrieves the abuse report URL with the specified parameters.
 *
 * @param param0 - An object containing the following properties:
 *   - `targetId`: The Id of the target being reported (could be player, asset, postId, etc.).
 *   - `submitterId`: The Id of the user submitting the report.
 *   - `abuseVector`: The surface where the abuse is occurring (user_profile, group, avatar, etc.).
 * @returns The constructed abuse report URL as a string.
 */
export function getAbuseReportRevampUrl({
  targetId,
  submitterId,
  abuseVector,
  universeId,
  adCreativeAssetId,
}: {
  targetId: string;
  submitterId: string;
  abuseVector: string;
  universeId: string;
  adCreativeAssetId?: string;
}): string {
  const customData: {
    stringId: string;
    adCreativeAssetId?: string;
  } = {
    stringId: universeId,
  };

  if (abuseVector === "ad_v2" && adCreativeAssetId) {
    customData.adCreativeAssetId = adCreativeAssetId;
  }

  const params = new URLSearchParams({
    targetId,
    submitterId,
    abuseVector,
    custom: JSON.stringify(customData),
  });
  return `/report-abuse/?${params.toString()}`;
}
