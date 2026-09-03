import {
  delayInMs,
  experienceTranslationsId,
  maxAttempts,
} from "../constants/translations/translationSettingsConstants";

// recursive function to get experience translation element
const getExperienceTranslationsElement = (attempts = 0): null | HTMLElement => {
  const experienceTranslationsDoc = document.getElementById(experienceTranslationsId);
  if (experienceTranslationsDoc === null) {
    if (attempts < maxAttempts) {
      setTimeout(() => {
        return getExperienceTranslationsElement(attempts + 1);
      }, delayInMs);
    }
  }
  return experienceTranslationsDoc;
};

export default getExperienceTranslationsElement;
