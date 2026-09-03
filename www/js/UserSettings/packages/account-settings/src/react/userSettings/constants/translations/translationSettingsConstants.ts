export enum ExperienceTranslationsOptions {
  On = "On",
  Off = "Off",
}
export const experienceTranslationMappings: { [key in ExperienceTranslationsOptions]: boolean } = {
  [ExperienceTranslationsOptions.On]: true,
  [ExperienceTranslationsOptions.Off]: false,
};
export const experienceTranslationsLabels = {
  on: "Label.ExperienceTranslationsOn",
  off: "Label.ExperienceTranslationsOff",
};
export const experienceTranslationsOptions = [
  {
    key: experienceTranslationsLabels.on,
    label: experienceTranslationsLabels.on,
    value: ExperienceTranslationsOptions.On,
  },
  {
    key: experienceTranslationsLabels.off,
    label: experienceTranslationsLabels.off,
    value: ExperienceTranslationsOptions.Off,
  },
];
export const experienceTranslationsId = "experience-translations";
export const maxAttempts = 5;
export const delayInMs = 250;
export const experienceTranslationsPlaceholder = "Experience Translations";
