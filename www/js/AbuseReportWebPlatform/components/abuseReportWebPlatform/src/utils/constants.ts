import type { AbuseReportLegacyPayloadModel } from "./types";

export const URL_PARAMS = {
  ABUSE_VECTOR: "abuseVector",
  TARGET_ID: "targetId",
  SUBMITTER_ID: "submitterId",
  CUSTOM: "custom",
  DIALOG: "dialog",
};

export const CONTENT_TYPES = {
  TREE_SELECTION: "treeSelection",
  CONFIGURABLE_COMPONENT_LIST: "configurableComponentList",
};

export const TELEMETRY_EVENT_NAME = "DynamicAbuseReportEvent";
export const TELEMETRY_EVENT_CONTEXT = "AbuseReportWebPlatform";
export const TELEMETRY_ENTRY_POINT = "web";

export const ABUSE_VECTOR_PLACE = "place";
export const WEB_CHAT_ABUSE_VECTOR = "web_chat";

export const ACCESSORY = "3d_accessory"; // Default asset type for 3D accessories
export enum REPORT_ENDPOINT {
  V1 = "/abuse-reporting/v1/abuse-report", // New endpoint
  V2 = "/abuse-reporting/v2/abuse-report", // Current endpoint (old)
}

const LEGACY_CATEGORY_TO_V1_CATEGORY: Record<string, string | undefined> = {
  "1": "ABUSE_CATEGORY_SWEARING",
  "2": "ABUSE_CATEGORY_PERSONAL_QUESTION",
  "3": "ABUSE_CATEGORY_BULLYING",
  "4": "ABUSE_CATEGORY_DATING_OR_SEXUAL_CONTENT",
  "5": "ABUSE_CATEGORY_CHEATING",
  "6": "ABUSE_CATEGORY_SCAMMING",
  "7": "ABUSE_CATEGORY_OTHER",
  "8": "ABUSE_CATEGORY_REAL_LIFE_THREATS_AND_SUICIDE_THREATS",
  "9": "ABUSE_CATEGORY_OTHER",
  "12": "ABUSE_CATEGORY_VIOLENCE_OR_TERRORISM",
};

export const convertLegacyCategoryToV1Category = (category: string): string =>
  LEGACY_CATEGORY_TO_V1_CATEGORY[category] ?? category;

/**
 * Mapping of asset type ids to their asset type names. Unfortunately, there's no better way to accomplish this in web-frontend than a hardcoded map.
 * This mapping is only used at the moment for reports coming in from creator-marketplace-store.
 * Source of truth: https://sourcegraph.rbx.com/github.rbx.com/Roblox/studio-toolbox-search/-/blob/services/toolbox-service/src/Enums/CategoryType.cs
 */
export const ASSET_TYPES: Record<string, string> = {
  "1": "Image",
  "3": "Audio",
  "10": "Model",
  "13": "Decal",
  "24": "Animation",
  "38": "Plugin",
  "40": "MeshPart",
  "62": "Video",
  "73": "FontFamily",
  "300": "Music",
  "301": "SoundEffect",
  "302": "UnknownAudio",
  "1001": "Package",
  "1002": "SharedPackage",
};

const CHAT_REPORT_METADATA = {
  payloadIdTag: "targetIdStr",
  targetType: "user",
  endpoint: REPORT_ENDPOINT.V1,
  getCategoryFn: convertLegacyCategoryToV1Category,
  getCustomDataFn: (payload: AbuseReportLegacyPayloadModel) => {
    return {
      COMMUNICATION_CHANNEL_ID: payload.ConversationId ?? "",
    };
  },
};

export const REPORT_VECTOR_METADATA: Record<
  string,
  {
    // Used to override the default passed-in abuseVector
    getOverrideAbuseVectorFn?: (assetTypeName?: string, assetTypeId?: string) => string;
    // What tag name to stick the targetId into
    payloadIdTag: string;
    // Optional tag to stick stringId into
    stringIdTag?: string;
    // Optional target type override for V1 endpoint submissions
    targetType?: string;
    // Optional category conversion for V1 endpoint submissions
    getCategoryFn?: (category: string) => string;
    // Optional custom fields for V1 endpoint submissions
    getCustomDataFn?: (payload: AbuseReportLegacyPayloadModel) => Record<string, unknown>;
    // Optional endpoint override, V2 is default
    endpoint?: REPORT_ENDPOINT;
  }
> = {
  ad_v2: {
    payloadIdTag: "targetIdStr",
    endpoint: REPORT_ENDPOINT.V1,
  },
  asset: {
    /**
     * Assets should have their abuse vector set to their asset type name, except for emotes.
     * @param assetTypeName The asset type name from the payload. This is used to override the abuse vector for certain asset types.
     * @param assetTypeId The asset type id from the payload. This is used to look up the asset type name if assetTypeName is not provided.
     * @returns The overridden abuse vector.
     */
    getOverrideAbuseVectorFn: (assetTypeName?: string, assetTypeId?: string): string => {
      if (assetTypeName) {
        let assetType = assetTypeName ? assetTypeName.toLowerCase() : "";
        // Emotes should be 3d_accessory and not their own abuse vector
        if (assetType === "emoteanimation") {
          assetType = ACCESSORY;
        }
        return assetType;
      }
      if (assetTypeId) {
        return ASSET_TYPES[assetTypeId]?.toLowerCase() ?? "";
      }
      return "";
    },
    payloadIdTag: "REPORT_TARGET_ASSET_ID",
  },
  badge: {
    payloadIdTag: "REPORT_TARGET_BADGE_ID",
  },
  bundle: {
    getOverrideAbuseVectorFn: () => "ugc_bundle",
    payloadIdTag: "UGC_BUNDLE_ID",
  },
  community_looks: {
    payloadIdTag: "REPORT_TARGET_LOOK_ID",
  },
  developerproduct: {
    getOverrideAbuseVectorFn: () => "developer_product",
    payloadIdTag: "REPORT_TARGET_DEVELOPER_PRODUCT_ID",
  },
  group_announcement: {
    payloadIdTag: "targetIdStr",
    stringIdTag: "REPORT_TARGET_GROUP_ID",
    endpoint: REPORT_ENDPOINT.V1,
  },
  group_roleset_v2: {
    payloadIdTag: "targetIdStr",
    stringIdTag: "REPORT_TARGET_GROUP_ID",
    endpoint: REPORT_ENDPOINT.V1,
  },
  ip_license_message: {
    payloadIdTag: "IP_LICENSE_MESSAGE_ID",
  },
  looks: {
    payloadIdTag: "REPORT_TARGET_LOOK_ID",
  },
  notifications: {
    payloadIdTag: "NOTIFICATION_ID",
  },
  place: {
    payloadIdTag: "REPORT_TARGET_ASSET_ID",
  },
  subscriptions: {
    payloadIdTag: "REPORT_TARGET_SUBSCRIPTION_TARGET_KEY",
    stringIdTag: "REPORT_TARGET_ASSET_ID",
  },
  userprofile: {
    getOverrideAbuseVectorFn: () => "user_profile",
    payloadIdTag: "REPORT_TARGET_USER_ID",
  },
  [WEB_CHAT_ABUSE_VECTOR]: CHAT_REPORT_METADATA,
};

/**
 * Selector components are frontend-driven, we need a way to map user input to a specific tag key to generate the report,
 * since we don't want to include tag keys in the BEDUI json.
 */
export const SELECTOR_TAG_KEYS = {
  ABUSE_VECTOR_PLACE: "THUMBNAIL_IDS",
};
