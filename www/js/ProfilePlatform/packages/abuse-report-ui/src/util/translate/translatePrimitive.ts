import type { Intl } from "@rbx/core-scripts/legacy/Roblox";

// Lifted form @rbx/core-scripts/intl/translationResources/translationResource.js
// with some minor modification to pass in intl and resource map.
export const translatePrimitive = (
  resourceMap: Record<string, string>,
  intl: Intl,
  key: string,
  params?: Record<string, string>,
): string => {
  if (!key || typeof key !== "string") {
    throw new TypeError("Parameter 'key' must be provided and it should be a string");
  }

  let translatedText = resourceMap[key] ?? "";
  // if the key is not found, throw error on dev environments
  if (!translatedText) {
    console.warn(
      `The translation key '${key}' not found. Please check for a missing string or a typo.`,
    );
  }

  // params, when provided, should be a plain object
  if (typeof params !== "undefined") {
    // need to check for null
    if (typeof params === "object" && !Array.isArray(params)) {
      translatedText = translatedText ? intl.f(translatedText, params) : "";
    } else {
      console.error("Second parameter must be either a plain object when provided");
      // avoid raw templated string to be directly returned to the consumer,
      // also enable them to do simple if check
      translatedText = "";
    }
  }

  return translatedText;
};
