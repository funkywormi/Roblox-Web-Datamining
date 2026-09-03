type TConfig = {
  common: string[];
  feature: string;
};

export const aboutTabTranslationConfig: TConfig = {
  common: [
    "CommonUI.Controls",
    "CommonUI.Features",
    "Common.GameSorts",
    "Feature.ExperienceDetails",
    "Feature.VirtualEvents",
    "Feature.GameLaunchGuestMode",
  ],
  feature: "Feature.GameDetails",
};

export const carouselTranslationConfig: TConfig = {
  common: ["CommonUI.Controls"],
  feature: "Feature.GameDetails",
};

export const playerFeedbackTranslationConfig: TConfig = {
  common: ["CommonUI.Messages"],
  feature: "PlayerFeedbacks.VoteForm",
};

export const socialLinksTranslationConfig: TConfig = {
  common: ["CommonUI.Controls"],
  feature: "Feature.PromotedChannels",
};

export const inviteLinkInvalidModalConfig: TConfig = {
  common: ["Common.VisitGame"],
  feature: "Feature.SocialShare",
};

export const edpUpsellTranslationConfig: TConfig = {
  common: [],
  feature: "Feature.GameDetails",
};

export const unavailableExperienceTranslationConfig: TConfig = {
  common: ["CommonUI.Messages", "CommonUI.Features", "Feature.GameLaunchGuestMode"],
  feature: "Feature.ExperienceDetails",
};

export default {
  aboutTabTranslationConfig,
  carouselTranslationConfig,
  socialLinksTranslationConfig,
  inviteLinkInvalidModalConfig,
  edpUpsellTranslationConfig,
};
