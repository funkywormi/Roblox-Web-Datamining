type TConfig = {
  common: string[];
  feature: string;
};

export const aboutTabTranslationConfig: TConfig = {
  common: ["CommonUI.Controls"],
  feature: "Feature.GameDetails",
};

export const gearTranslationConfig: TConfig = {
  common: [],
  feature: "Feature.GameGearOptionsDisplay",
};

export const carouselTranslationConfig: string[] = ["CommonUI.Controls", "Feature.GameDetails"];

export const socialLinksTranslationConfig: TConfig = {
  common: ["CommonUI.Controls"],
  feature: "Feature.PromotedChannels",
};

export const inviteLinkInvalidModalConfig: TConfig = {
  common: ["Common.VisitGame"],
  feature: "Feature.SocialShare",
};

export default {
  gearTranslationConfig,
  aboutTabTranslationConfig,
  carouselTranslationConfig,
  socialLinksTranslationConfig,
  inviteLinkInvalidModalConfig,
};
