const gameDetailsUnavailableContainerId = "game-details-unavailable-container";

const gameDetailsUnavailableContainer = (): HTMLElement | null =>
  document.getElementById(gameDetailsUnavailableContainerId);

export default {
  gameDetailsUnavailableContainerId,
  gameDetailsUnavailableContainer,
};
