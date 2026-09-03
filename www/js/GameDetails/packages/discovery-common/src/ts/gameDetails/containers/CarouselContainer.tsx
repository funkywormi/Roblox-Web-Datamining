import React, { useCallback, useEffect, useState } from "react";
import { useTheme, withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { createCache, CacheProvider, UIThemeProvider } from "@rbx/ui";
import { usePlayabilityStatus, PlayabilityStatus } from "@rbx/game-play-button";
import { carouselTranslationConfig } from "../translation.config";
import { TCarouselItem, TAssetType } from "../types/carouselTypes";
import useIsEligibleForVideoPreview from "../hooks/useIsEligibleForVideoPreview";
import Carousel from "../components/Carousel";
import carouselService from "../services/carouselService";

const cache = createCache();

export type TCarouselContainerProps = {
  placeName: string;
  placeId: string;
  universeId: string;
  delay: number;
};

const CarouselContainer = ({
  translate,
  placeName,
  placeId,
  universeId,
  delay,
}: TCarouselContainerProps & WithTranslationsProps): React.JSX.Element => {
  const [assets, setAssets] = useState<TCarouselItem[] | undefined>(undefined);
  const [isLoadingAssets, setIsLoadingAssets] = useState<boolean>(true);

  const [failedItemIds, setFailedItemIds] = useState<Set<string>>(new Set());

  const { isPlayable, playabilityStatus, isFetchingPlayability } = usePlayabilityStatus(universeId);

  const { isEligibleForVideoPreview, isLoadingEligibility } =
    useIsEligibleForVideoPreview(universeId);

  useEffect(() => {
    setIsLoadingAssets(true);
    setFailedItemIds(new Set());

    carouselService
      .getUniverseAssetIds(universeId)
      .then(carouselItems => {
        setAssets(carouselItems);
      })
      .catch(() => {
        setAssets([]);
      })
      .finally(() => {
        setIsLoadingAssets(false);
      });
  }, [universeId]);

  const handleItemFailure = useCallback((itemId: string) => {
    setFailedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.add(itemId);
      return newSet;
    });
  }, []);

  /**
   * If IXP is disabled, filter out GamePreviewVideo items.
   * If IXP is enabled and a GamePreviewVideo item exists, move it to the beginning.
   * Do not support multiple GamePreviewVideo items.
   */
  const filteredAssets: TCarouselItem[] = React.useMemo(() => {
    if (!assets) {
      return [];
    }

    const nonFailedAssets = assets.filter(item => !failedItemIds.has(item.id));

    if (!isEligibleForVideoPreview) {
      return nonFailedAssets.filter(item => item.type !== TAssetType.GamePreviewVideo);
    }

    // If video preview is enabled and one exists, it should be moved to the beginning
    // We should only ever show one video preview for the experience
    const videoPreviewItem = nonFailedAssets.find(
      item => item.type === TAssetType.GamePreviewVideo,
    );
    if (videoPreviewItem) {
      return [
        videoPreviewItem,
        ...nonFailedAssets.filter(item => item.type !== TAssetType.GamePreviewVideo),
      ];
    }

    return nonFailedAssets;
  }, [assets, isEligibleForVideoPreview, failedItemIds]);

  if (isLoadingAssets || isLoadingEligibility || isFetchingPlayability) {
    return <div className="shimmer" data-testid="loading" />;
  }

  const isPurchaseGated =
    playabilityStatus === PlayabilityStatus.PurchaseRequired ||
    playabilityStatus === PlayabilityStatus.FiatPurchaseRequired ||
    playabilityStatus === PlayabilityStatus.FiatPurchaseDeviceRestricted ||
    playabilityStatus === PlayabilityStatus.ContextualPlayabilityRegionalAvailability;

  if (filteredAssets.length === 0) {
    // Do not show the default media thumbnails if the experience is not playable,
    // but still show them for purchase-gated experiences
    if (isPlayable !== true && !isPurchaseGated) {
      return (
        <div
          aria-hidden
          className="carousel-image-empty-placeholder"
          data-testid="media-unavailable"
        />
      );
    }

    return (
      <Carousel
        translate={translate}
        delay={delay}
        items={[
          {
            id: placeId,
            type: TAssetType.Place,
            assetId: parseInt(placeId, 10),
          },
        ]}
        placeName={placeName}
        universeId={universeId}
        placeId={placeId}
        handleItemFailure={handleItemFailure}
      />
    );
  }

  return (
    <Carousel
      translate={translate}
      delay={delay}
      items={filteredAssets}
      placeName={placeName}
      universeId={universeId}
      placeId={placeId}
      handleItemFailure={handleItemFailure}
    />
  );
};

const CarouselContainerWithTranslations = withTranslations(
  CarouselContainer,
  carouselTranslationConfig,
);

// Wrap in UIThemeProvider and CacheProvider for @rbx/ui use in @rbx/video-player
const CarouselContainerWithThemeAndTranslations = ({
  ...props
}: TCarouselContainerProps): React.JSX.Element => {
  const theme = useTheme();

  return (
    <CacheProvider cache={cache}>
      <UIThemeProvider
        theme={theme === "dark" ? "foundation-dark" : "foundation-light"}
        cssBaselineMode="disabled"
      >
        <CarouselContainerWithTranslations {...props} />
      </UIThemeProvider>
    </CacheProvider>
  );
};

export default CarouselContainerWithThemeAndTranslations;
