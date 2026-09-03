enum IgrsRating {
  ThirteenPlus = "IGRS_RATING_THIRTEEN_PLUS",
  FifteenPlus = "IGRS_RATING_FIFTEEN_PLUS",
  EighteenPlus = "IGRS_RATING_EIGHTEEN_PLUS",
  Unrated = "IGRS_RATING_UNRATED",
}
interface AgeRecommendation {
  displayName: string;
  displayNameWithHeaderShort: string;
  minimumAge: number;
  igrsRating?: IgrsRating;
  igrsRatingDisplayMessage?: string;
}

interface AgeRecommendationDetails {
  summary: AgeRecommendationSummary;
  descriptorUsages: ExperienceDescriptorUsage[] | null;
}

interface AgeRecommendationDetailsResponse {
  ageRecommendationDetails: AgeRecommendationDetails | null;
  headerDisplayName: string;
  headerDisplayNameShort: string;
}

interface AgeRecommendationSummary {
  ageRecommendation: AgeRecommendation | null;
}

interface AssetTextFilterSettingsResponse {
  Profanity?: boolean;
}

interface ExperienceDescriptor {
  name: string;
  displayName: string;
}

interface ExperienceDescriptorUsage {
  contains?: boolean;
  name: string;
  descriptor: ExperienceDescriptor;
}

interface ExperienceGuidelines {
  descriptorDisplayNames: string;
  ageRecommendationBracket: string | undefined | null;
  igrsRating?: IgrsRating;
  igrsRatingDisplayMessage?: string;
}

interface UserGuidelinesMetadata {
  isSurfacingGuidelinesForUserEnabled: boolean;
}

export { IgrsRating };
export type {
  AgeRecommendation,
  AgeRecommendationDetails,
  AgeRecommendationDetailsResponse,
  AgeRecommendationSummary,
  AssetTextFilterSettingsResponse,
  ExperienceDescriptor,
  ExperienceDescriptorUsage,
  ExperienceGuidelines,
  UserGuidelinesMetadata,
};
