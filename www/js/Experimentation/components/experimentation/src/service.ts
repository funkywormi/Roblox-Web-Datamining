import "@rbx/core-scripts/global";
import { getBrowserTrackerId } from "@rbx/www-common/browser-tracker";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { userId as getUserId } from "@rbx/core-scripts/meta/user";
import environmentUrls from "@rbx/environment-urls";
import { post } from "./requestTransport";
import {
  DEFAULT_ROBLOX_PROJECT,
  EXPOSED_EVENT_NAME,
  EXPERIMENTATION_TARGET_NAME,
} from "./constants";
import { buildLayerExposureEvent } from "./exposureEvent";
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
      const combinedEvent = buildLayerExposureEvent(
        bulkEnrollmentResponse,
        layerName,
        getUserId() ?? 0,
        getBrowserTrackerId() || "0",
      );

      // Send to event stream
      sendEventWithTarget(
        EXPOSED_EVENT_NAME,
        EXPERIMENTATION_TARGET_NAME,
        combinedEvent,
        targetTypes.WWW,
      );
    }
  }
}
