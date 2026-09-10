import "@rbx/core-scripts/global";
import { post } from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import {
  DEFAULT_ROBLOX_PROJECT,
  EXPOSED_EVENT_NAME,
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
import { BulkEnrollmentResponse } from "./models/bulkEnrollmentResponse";

export type ExperimentationInputValue = string | number | boolean;
export type ExperimentationInputs = Record<string, ExperimentationInputValue>;

export default class ExperimentationService {
  private projectLayerMetadataMaps: Map<string, BulkEnrollmentResponse>[];

  constructor() {
    this.projectLayerMetadataMaps = [];
  }

  public getAllValuesForLayer(
    layerName: string,
    projectId = DEFAULT_ROBLOX_PROJECT,
    inputs?: ExperimentationInputs,
  ): Promise<Record<string, unknown>> {
    // Build request to IXP
    const urlConfig = {
      url: `${environmentUrls.apiGatewayUrl}/product-experimentation-platform/v1/projects/${projectId}/values`,
      withCredentials: true,
    };

    const requestBody = {
      layers: {
        [layerName]: inputs ?? {},
      },
    };

    return post<BulkEnrollmentResponse>(urlConfig, requestBody).then(response => {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (response?.data) {
        // Parse layer parameters out of bulk enrollment response
        const bulkEnrollmentResponse = response.data;
        const metadataKey = inputs
          ? ExperimentationService.getInputMetadataKey(layerName, inputs)
          : layerName;
        return this.registerLayerMetadataAndGetParameters(
          bulkEnrollmentResponse,
          layerName,
          metadataKey,
          projectId,
          inputs !== undefined,
        );
      }
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return Promise.reject();
    });
  }

  public logLayerExposure(
    layerName: string,
    projectId = DEFAULT_ROBLOX_PROJECT,
    inputs?: ExperimentationInputs,
  ): void {
    const metadataKey = inputs
      ? ExperimentationService.getInputMetadataKey(layerName, inputs)
      : layerName;
    this.logLayerExposureForMetadataKey(layerName, metadataKey, projectId);
  }

  private static getInputMetadataKey(layerName: string, inputs: ExperimentationInputs): string {
    const sortedInputs = Object.entries(inputs).sort(([leftKey], [rightKey]) =>
      leftKey.localeCompare(rightKey),
    );
    return `${layerName}:${JSON.stringify(sortedInputs)}`;
  }

  private registerLayerMetadataAndGetParameters(
    bulkEnrollmentResponse: BulkEnrollmentResponse,
    layerName: string,
    metadataKey: string,
    projectId: number,
    clearUnassignedMetadata = false,
  ): Record<string, unknown> {
    const layerMetadataMap =
      this.projectLayerMetadataMaps[projectId] ?? new Map<string, BulkEnrollmentResponse>();
    this.projectLayerMetadataMaps[projectId] = layerMetadataMap;

    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const layerResponse = bulkEnrollmentResponse.layers[layerName]!;
    if (layerResponse.experimentName) {
      layerMetadataMap.set(metadataKey, bulkEnrollmentResponse);
    } else if (clearUnassignedMetadata) {
      layerMetadataMap.delete(metadataKey);
    }

    return layerResponse.parameters;
  }

  private logLayerExposureForMetadataKey(
    layerName: string,
    metadataKey: string,
    projectId: number,
  ): void {
    const bulkEnrollmentResponse = this.projectLayerMetadataMaps[projectId]?.get(metadataKey);

    if (bulkEnrollmentResponse) {
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const bulkEnrollmentLayerResponse = bulkEnrollmentResponse.layers[layerName]!;
      const { CurrentUser, Cookies } = window.Roblox;
      const userId = CurrentUser?.isAuthenticated ? CurrentUser.userId : 0;
      const cookieResult = Cookies?.getBrowserTrackerId();
      // TODO: this will always be false => 0
      const browserTrackerId = typeof cookieResult === "number" ? cookieResult : 0;

      // Build base event
      const baseEvent: Record<string, string> = {
        uid: userId.toString(),
        btid: browserTrackerId.toString(),
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

      // Send to event stream
      const { EventStream } = window.Roblox;
      if (EventStream != null) {
        EventStream.SendEventWithTarget(
          EXPOSED_EVENT_NAME,
          EXPERIMENTATION_TARGET_NAME,
          combinedEvent,
          EventStream.TargetTypes.WWW,
        );
      }
    }
  }
}
