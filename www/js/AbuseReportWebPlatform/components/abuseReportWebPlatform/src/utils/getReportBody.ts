import { AbuseReportLegacyPayloadModel, TagMap } from "./types";
import convertReportCategoryValueToString from "./convertReportCategoryValueToString";
import { REPORT_ENDPOINT, REPORT_VECTOR_METADATA } from "./constants";
import { ReportTag } from "../context/ArwpFormDataProvider";

const WEBSITE = "website"; // Default entry point for reports

/**
 * Constructs the report body for V1 endpoint submissions.
 */
const constructV1ReportBody = ({
  abuseVector,
  payload,
  submitterId,
}: {
  abuseVector: string;
  payload: AbuseReportLegacyPayloadModel;
  submitterId: number;
}): Record<string, unknown> => {
  const metadata = REPORT_VECTOR_METADATA[abuseVector.toLowerCase()];
  if (!metadata) {
    return {};
  }
  const reportedAbuseVector = metadata.getOverrideAbuseVectorFn
    ? metadata.getOverrideAbuseVectorFn(payload.AssetType, payload.AssetTypeId)
    : abuseVector.toLowerCase();
  if (!reportedAbuseVector) {
    return {};
  }
  const custom = {
    ...(metadata.stringIdTag && {
      [metadata.stringIdTag]: payload.StringId,
    }),
    ...(metadata.getCustomDataFn?.(payload) ?? {}),
  };
  const category = metadata.getCategoryFn?.(payload.ReportCategory) ?? payload.ReportCategory;

  return {
    abuseVector: reportedAbuseVector,
    // Backend should have the category set to a string enum, no need to translation
    category,
    comment: payload.Comment,
    submitterId,
    targetType: metadata.targetType ?? abuseVector.toLowerCase(),
    [metadata.payloadIdTag]: payload.Id,
    ...(Object.keys(custom).length > 0 && {
      custom,
    }),
  };
};

/**
 * Constructs the report tags for V2 endpoint submissions.
 */
const constructTags = ({
  abuseVector,
  payload,
  userId,
}: {
  abuseVector: string;
  payload: AbuseReportLegacyPayloadModel;
  userId: string;
}): TagMap => {
  const metadata = REPORT_VECTOR_METADATA[abuseVector.toLowerCase()];
  if (!metadata) {
    return {};
  }
  const reportedAbuseVector = metadata.getOverrideAbuseVectorFn
    ? metadata.getOverrideAbuseVectorFn(payload.AssetType, payload.AssetTypeId)
    : abuseVector.toLowerCase();
  if (!reportedAbuseVector) {
    return {};
  }

  const tags = {
    ENTRY_POINT: {
      valueList: [{ data: WEBSITE }],
    },
    REPORTED_ABUSE_CATEGORY: {
      valueList: [{ data: convertReportCategoryValueToString(payload.ReportCategory) }],
    },
    REPORTED_ABUSE_VECTOR: {
      valueList: [{ data: reportedAbuseVector }],
    },
    REPORTER_COMMENT: {
      valueList: [{ data: payload.Comment }],
    },
    SUBMITTER_USER_ID: {
      valueList: [{ data: userId }],
    },
    [metadata.payloadIdTag]: {
      valueList: [{ data: payload.Id }],
    },
    ...(metadata.stringIdTag && {
      [metadata.stringIdTag]: {
        valueList: [{ data: payload.StringId }],
      },
    }),
  };
  return tags;
};

/**
 * Construct report body from required payload and additionalReportTags, returns empty if the flow uses the old reporting endpoint in subsite.
 */
const getReportBody = (
  abuseVector: string,
  payload: AbuseReportLegacyPayloadModel,
  additionalReportTags: Map<string, ReportTag>,
): TagMap | Record<string, unknown> => {
  // We currently only allow logged in users to submit reports / to hit this code path.
  const userId = window.Roblox.CurrentUser?.userId;
  if (!userId || !abuseVector) return {};

  // If the abuse vector uses the V1 reporting endpoint, we need to construct a different body
  if (REPORT_VECTOR_METADATA[abuseVector.toLowerCase()]?.endpoint === REPORT_ENDPOINT.V1) {
    const submitterId = parseInt(userId, 10);
    if (Number.isNaN(submitterId)) return {};
    return constructV1ReportBody({ abuseVector, payload, submitterId });
  }

  const tags = constructTags({
    abuseVector,
    payload,
    userId,
  });
  // If we failed to construct the required tags, return empty.
  if (Object.keys(tags).length === 0) return {};

  // If we need to add additional tagkeys to the same report, we do that here.
  additionalReportTags.forEach(reportTag => {
    const { TagKey: tagKey, TagValue: tagValue } = reportTag;
    if (tagKey && tagValue) {
      // If the valueArr is comma-separated, we add each value as a separate valueList item.
      const valueArr = tagValue.split(",");
      if (!tags[tagKey]?.valueList) {
        tags[tagKey] = {
          valueList: valueArr.map(value => ({ data: value.trim() })),
        };
      } else {
        tags[tagKey].valueList.push(...valueArr.map(value => ({ data: value.trim() })));
      }
    }
  });

  return tags;
};

export default getReportBody;
