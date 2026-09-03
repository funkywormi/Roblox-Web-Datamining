import environmentUrls from "@rbx/environment-urls";

const gameDetailsPlayerFeedbackBannerContainerId = "game-details-feedback-banner-container";
const gameDetailsPlayerFeedbackBannerContainer = (): HTMLElement | null =>
  document.getElementById(gameDetailsPlayerFeedbackBannerContainerId);
const tosUrl = `${environmentUrls.websiteUrl}/info/terms`;

export default {
  gameDetailsPlayerFeedbackBannerContainerId,
  gameDetailsPlayerFeedbackBannerContainer,
  tosUrl,
};
