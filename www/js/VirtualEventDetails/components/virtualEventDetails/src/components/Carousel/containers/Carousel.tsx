import React, { useEffect, useState } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { carouselTranslationConfig } from "../translation.config";
import { TCarouselItem, TAssetType, TCarouselAssetItem } from "../types/carouselTypes";
import CarouselComponent from "../components/Carousel";
import carouselService from "../services/carouselService";

const parseThumbnails = (thumbnails: number[]): TCarouselItem[] => {
  return thumbnails.map(thumbnail => {
    const carouselItem: TCarouselAssetItem = { type: TAssetType.Image, assetId: thumbnail };
    return carouselItem;
  });
};

export type TCarouselProps = {
  eventThumbnails: number[];
  placeId: string;
  universeId: string;
  delay: number;
};

export const Carousel = ({
  translate,
  eventThumbnails,
  placeId,
  universeId,
  delay,
}: TCarouselProps & WithTranslationsProps): JSX.Element => {
  const [assets, setAssets] = useState<TCarouselItem[] | undefined>(undefined);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const carouselItems =
          eventThumbnails.length > 0
            ? parseThumbnails(eventThumbnails)
            : await carouselService.getUniverseAssetIds(universeId);
        setAssets(carouselItems);
      } catch {
        setAssets([]);
      }
    };

    // eslint-disable-next-line no-void
    void fetchAssets();
  }, [eventThumbnails, universeId]);

  if (assets === undefined) {
    return <div className="shimmer" data-testid="loading" />;
  }

  if (assets.length === 0) {
    return (
      <CarouselComponent
        translate={translate}
        delay={delay}
        items={[
          {
            type: TAssetType.Place,
            assetId: parseInt(placeId, 10),
          },
        ]}
      />
    );
  }

  return <CarouselComponent translate={translate} delay={delay} items={assets} />;
};

export default withTranslations(Carousel, carouselTranslationConfig);
