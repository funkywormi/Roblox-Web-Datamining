import { Options } from "youtube-player/dist/types";

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
const youtubePlayerConfigs = (id: string): Options => ({
  width: 768,
  height: 432,
  videoId: id,
  host: "https://www.youtube-nocookie.com",
  playerVars: {
    cc_load_policy: 1,
    modestbranding: 1,
    rel: 0,
  },
});

export default {
  gameplayButtonContainerId,
  gameDetailsCarouselContainerId,
  gameDetailsCarouselContainer,
  carouselTranslationMap,
  carouselConfigs,
  youtubePlayerConfigs,
};
