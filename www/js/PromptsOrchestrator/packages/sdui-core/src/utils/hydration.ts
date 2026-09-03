import { HydrationContentType } from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/hydration_content_type_pb.js";

type ValidHydrationContentType = Exclude<HydrationContentType, HydrationContentType.INVALID>;

const HYDRATION_CONTENT_TYPE_TO_FIELD_KEY: Record<ValidHydrationContentType, string> = {
  [HydrationContentType.BADGE]: "badge",
  [HydrationContentType.UNIVERSE]: "universe",
  [HydrationContentType.CREATOR]: "creator",
  [HydrationContentType.EVENT]: "event",
  [HydrationContentType.SONG]: "song",
  [HydrationContentType.GAME_PASS]: "gamePass",
  [HydrationContentType.MEDIA_ASSET]: "mediaAsset",
  [HydrationContentType.SOCIAL_LINK]: "socialLink",
  [HydrationContentType.GAME_DEVELOPER_PRODUCT]: "gameDeveloperProduct",
  [HydrationContentType.GAME_SUBSCRIPTION]: "gameSubscription",
  [HydrationContentType.MARKETPLACE_ASSET]: "marketplaceAsset",
  [HydrationContentType.MARKETPLACE_BUNDLE]: "marketplaceBundle",
  [HydrationContentType.MARKETPLACE_LOOK]: "marketplaceLook",
  [HydrationContentType.MARKETPLACE_CATALOG_CATEGORY]: "marketplaceCatalogCategory",
  [HydrationContentType.MARKETPLACE_CATALOG_SORT]: "catalogSort",
  [HydrationContentType.AGE_RECOMMENDATION]: "ageRecommendation",
  [HydrationContentType.UNIVERSE_USER_FOLLOW]: "universeUserFollow",
  [HydrationContentType.UNIVERSE_USER_VOTE]: "universeUserVote",
  [HydrationContentType.USER_PROFILE]: "userProfile",
  [HydrationContentType.UNIVERSE_USER_FAVORITE]: "universeUserFavorite",
  [HydrationContentType.PLAYABILITY]: "playability",
  [HydrationContentType.UNIVERSE_USER_FOLLOW_LIMIT]: "universeUserFollowLimit",
  [HydrationContentType.UNIVERSE_USER_VOTE_FEEDBACK_METADATA]: "universeUserVoteFeedbackMetadata",
  [HydrationContentType.MOMENT]: "moment",
  [HydrationContentType.COMMUNITY]: "community",
  [HydrationContentType.COMMUNITY_USER_MEMBERSHIP]: "communityUserMembership",
  [HydrationContentType.USER_RECOMMENDATION]: "userRecommendation",
  [HydrationContentType.CONTACT]: "contact",
};

export function hydrationContentTypeToFieldKey(type: HydrationContentType): string {
  return (HYDRATION_CONTENT_TYPE_TO_FIELD_KEY as Record<number, string>)[type] ?? "";
}

const FIELD_KEY_TO_HYDRATION_CONTENT_TYPE: Record<string, HydrationContentType> = {};
for (const [numKey, fieldKey] of Object.entries(HYDRATION_CONTENT_TYPE_TO_FIELD_KEY)) {
  FIELD_KEY_TO_HYDRATION_CONTENT_TYPE[fieldKey] = Number(numKey) as HydrationContentType;
}

export function fieldKeyToHydrationContentType(fieldKey: string): HydrationContentType {
  return FIELD_KEY_TO_HYDRATION_CONTENT_TYPE[fieldKey] ?? HydrationContentType.INVALID;
}

export const HYDRATION_FIELD_KEYS: readonly string[] = Object.values(
  HYDRATION_CONTENT_TYPE_TO_FIELD_KEY,
);
