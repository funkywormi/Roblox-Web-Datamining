const gameplayButtonContainerId = "game-details-play-button-container";
const gameDetailsCarouselContainerId = "game-details-carousel-container";
const gameDetailsCarouselContainer = (): HTMLElement | null =>
  document.getElementById(gameDetailsCarouselContainerId);
const carouselTranslationMap = {
  back: "Action.Back",
  next: "Action.Next",
};
const carouselConfigs = {
  delay: 6000,
};

const carouselErrorCounters = {
  MediaGalleryMediaChangedMissingItem: "MediaGalleryMediaChangedMissingItem",
  MediaGalleryMediaChangedUnknownItemType: "MediaGalleryMediaChangedUnknownItemType",
};

export default {
  gameplayButtonContainerId,
  gameDetailsCarouselContainerId,
  gameDetailsCarouselContainer,
  carouselTranslationMap,
  carouselConfigs,
  carouselErrorCounters,
};
