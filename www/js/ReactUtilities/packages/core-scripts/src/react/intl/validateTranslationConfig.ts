import { TranslationConfig } from "../intl";

const validNamespace = (namespace: string): boolean => namespace.split(".").length === 2;

const isStringArray = (arr: unknown): arr is string[] =>
  Array.isArray(arr) && arr.every(item => typeof item === "string");

type LegacyTranslationConfig = {
  common: string[];
  feature?: string;
  features?: string[];
};

const validateLegacyTranslationConfig = (config: LegacyTranslationConfig) => {
  const { common, feature, features } = config;
  if (
    !isStringArray(common) ||
    // Only one of feature or features should be defined.
    (feature !== undefined && features !== undefined) ||
    (feature != null && typeof feature !== "string") ||
    // features should be an array
    (features != null && !isStringArray(features))
  ) {
    throw new Error("Invalid namespaces config!");
  }

  return [...common, ...(feature == null ? [] : [feature]), ...(features ?? [])].filter(
    validNamespace,
  );
};

export const validateTranslationConfig = (config: TranslationConfig): string[] => {
  if (Array.isArray(config)) {
    if (isStringArray(config)) {
      return config.filter(validNamespace);
    }
    throw new TypeError("Translation Config must be an array of strings.");
  } else {
    return validateLegacyTranslationConfig(config);
  }
};
