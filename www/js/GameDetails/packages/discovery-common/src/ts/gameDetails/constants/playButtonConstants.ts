const gameDetailsPlayButtonContainerId = "game-details-play-button-container";
const gameDetailsPlayButtonContainer = (): HTMLElement | null =>
  document.getElementById(gameDetailsPlayButtonContainerId);

export default {
  gameDetailsPlayButtonContainerId,
  gameDetailsPlayButtonContainer,
};
