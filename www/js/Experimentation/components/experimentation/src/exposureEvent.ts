import {
  EXPOSURE_LOGGING_LAYER_NAME_KEY,
  EXPOSURE_LOGGING_EXPERIMENT_NAME_KEY,
  EXPOSURE_LOGGING_IS_AUDIENCE_SPECIFIED_KEY,
  EXPOSURE_LOGGING_IS_AUDIENCE_MEMBER_KEY,
  EXPOSURE_LOGGING_USER_AGENT_KEY,
  EXPOSURE_LOGGING_PLATFORM_TYPE_KEY,
  EXPOSURE_LOGGING_PLATFORM_TYPE_ID_KEY,
  EXPOSURE_LOGGING_ASSIGNED_SEGMENT_KEY,
  EXPOSURE_LOGGING_ASSIGNED_EXPERIMENT_VARIABLES_VARIANT_KEY,
  EXPOSURE_LOGGING_PRIMARY_UNIT_VARIABLE_KEY,
  EXPOSURE_LOGGING_PRIMARY_UNIT_VALUE_KEY,
  EXPOSURE_LOGGING_PRIMARY_UNIT_ALLOC_VARIABLE_KEY,
  EXPOSURE_LOGGING_PRIMARY_UNIT_ALLOC_VALUE_KEY,
  EXPOSURE_LOGGING_HOLDOUT_GROUP_EXPERIMENT_NAME_KEY,
  EXPERIMENTATION_TARGET_NAME,
} from "./constants";
import type { BulkEnrollmentResponse } from "./models/bulkEnrollmentResponse";

export const buildLayerExposureEvent = (
  bulkEnrollmentResponse: BulkEnrollmentResponse,
  layerName: string,
  userId: number,
  browserTrackerId: string,
): Record<string, string> => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const bulkEnrollmentLayerResponse = bulkEnrollmentResponse.layers[layerName]!;

  // Build base event
  const baseEvent: Record<string, string> = {
    uid: userId.toString(),
    btid: browserTrackerId,
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    project: bulkEnrollmentResponse.projectId?.toString(),
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    version: bulkEnrollmentResponse.version?.toString(),
    ts: Date.now().toString(), // The timestamp (ms since Unix epoch)
    lt: new Date().toISOString(), // The last timestamp (ISO date string)
    target: EXPERIMENTATION_TARGET_NAME,
  };

  // Build exposure event with data from bulk enrollment response and bulk enrollment layer response
  const exposureEvent: Record<string, string> = {
    [EXPOSURE_LOGGING_LAYER_NAME_KEY]: layerName,
    [EXPOSURE_LOGGING_EXPERIMENT_NAME_KEY]: bulkEnrollmentLayerResponse.experimentName,
    [EXPOSURE_LOGGING_IS_AUDIENCE_SPECIFIED_KEY]:
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      bulkEnrollmentLayerResponse.isAudienceSpecified?.toString(),
    [EXPOSURE_LOGGING_IS_AUDIENCE_MEMBER_KEY]:
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      bulkEnrollmentLayerResponse.isAudienceMember?.toString()!,
    [EXPOSURE_LOGGING_USER_AGENT_KEY]: bulkEnrollmentResponse.userAgent,
    [EXPOSURE_LOGGING_PLATFORM_TYPE_KEY]: bulkEnrollmentResponse.platformType,
    [EXPOSURE_LOGGING_PLATFORM_TYPE_ID_KEY]:
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      bulkEnrollmentResponse.platformTypeId?.toString(),
    [EXPOSURE_LOGGING_ASSIGNED_SEGMENT_KEY]:
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      bulkEnrollmentLayerResponse.segment?.toString(),
    [EXPOSURE_LOGGING_ASSIGNED_EXPERIMENT_VARIABLES_VARIANT_KEY]:
      bulkEnrollmentLayerResponse.experimentVariant,
    [EXPOSURE_LOGGING_PRIMARY_UNIT_VARIABLE_KEY]: bulkEnrollmentLayerResponse.primaryUnit,
    [EXPOSURE_LOGGING_PRIMARY_UNIT_VALUE_KEY]:
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      bulkEnrollmentLayerResponse.primaryUnitValue?.toString()!,
    [EXPOSURE_LOGGING_PRIMARY_UNIT_ALLOC_VARIABLE_KEY]: bulkEnrollmentLayerResponse.primaryUnit,
    [EXPOSURE_LOGGING_PRIMARY_UNIT_ALLOC_VALUE_KEY]:
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
      bulkEnrollmentLayerResponse.primaryUnitValue?.toString()!,
    [EXPOSURE_LOGGING_HOLDOUT_GROUP_EXPERIMENT_NAME_KEY]:
      bulkEnrollmentLayerResponse.holdoutGroupExperimentName,
  };

  const combinedEvent = {
    ...baseEvent,
    ...exposureEvent,
  };

  // Sanitize combined event
  Object.keys(combinedEvent).forEach(key => {
    combinedEvent[key] = combinedEvent[key] ?? "";
  });

  return combinedEvent;
};
