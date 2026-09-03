import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "@rbx/core-scripts/http";
import {
  Thumbnail,
  ThumbnailFormat,
  ThumbnailGameThumbnailSize,
  ThumbnailStates,
  ThumbnailTypes,
  thumbnailService,
} from "@rbx/thumbnails";
import { fireImageLoadFailTelemetryCounter } from "../utils/discoveryCommonTelemetryCounters";

export type TValidatedThumbnailOverride =
  | { status: "none" }
  | { status: "loading" }
  | { status: "override"; getThumbnail: () => Promise<AxiosResponse<Thumbnail>> }
  | { status: "fallback" };

type TValidatedThumbnailOverrideResult = Extract<
  TValidatedThumbnailOverride,
  { status: "override" } | { status: "fallback" }
>;

type TUseValidatedThumbnailOverrideParams = {
  assetId: number | null;
  size: ThumbnailGameThumbnailSize | undefined;
  topicId: string | undefined;
  telemetrySource: string;
};

const queryKey = "validatedThumbnailOverride";

const useValidatedThumbnailOverride = ({
  assetId,
  size,
  topicId,
  telemetrySource,
}: TUseValidatedThumbnailOverrideParams): TValidatedThumbnailOverride => {
  const isEnabled = assetId !== null && size !== undefined;

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, assetId, size],
    enabled: isEnabled,
    queryFn: async (): Promise<TValidatedThumbnailOverrideResult> => {
      const fireFailureTelemetry = () => {
        fireImageLoadFailTelemetryCounter(telemetrySource, {
          topicId: topicId ?? "unknown",
        });
      };

      try {
        const response = await thumbnailService.getThumbnailImage(
          ThumbnailTypes.assetThumbnail,
          size!,
          ThumbnailFormat.jpeg,
          assetId!,
        );

        // thumbnailService response shape not exported as a stable type
        const { thumbnail } = response as { thumbnail?: Thumbnail };
        if (!thumbnail || thumbnail.state !== ThumbnailStates.complete || !thumbnail.imageUrl) {
          fireFailureTelemetry();
          return { status: "fallback" };
        }

        return {
          status: "override",
          getThumbnail: () => Promise.resolve({ data: thumbnail } as AxiosResponse<Thumbnail>),
        };
      } catch (error: unknown) {
        console.error(error);
        fireFailureTelemetry();
        return { status: "fallback" };
      }
    },
  });

  return useMemo((): TValidatedThumbnailOverride => {
    if (!isEnabled) {
      return { status: "none" };
    }
    if (isLoading) {
      return { status: "loading" };
    }
    return data ?? { status: "fallback" };
  }, [isEnabled, isLoading, data]);
};

export default useValidatedThumbnailOverride;
