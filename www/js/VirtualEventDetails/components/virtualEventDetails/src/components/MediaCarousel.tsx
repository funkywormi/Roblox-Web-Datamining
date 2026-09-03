import React from "react";

import { withTranslations } from "@rbx/core-scripts/legacy/react-utilities";
import { translation } from "../translation.config";

import carouselConstants from "./Carousel/constants/carouselConstants";

import "../css/virtualEventDetails/virtualEventCarousel.scss";
import "../css/carousel/_carousel.scss";

import Carousel from "./Carousel/containers/Carousel";

function MediaCarousel({
  eventThumbnails,
  universeId,
  placeId,
}: {
  eventThumbnails: number[];
  universeId: string;
  placeId: string;
}) {
  return (
    <div className="media-carousel-container">
      <div className="thumbnail-carousel">
        <Carousel
          universeId={universeId}
          placeId={placeId}
          eventThumbnails={eventThumbnails}
          delay={carouselConstants.carouselConfigs.delay}
        />
      </div>
    </div>
  );
}

export default withTranslations(MediaCarousel, translation);
