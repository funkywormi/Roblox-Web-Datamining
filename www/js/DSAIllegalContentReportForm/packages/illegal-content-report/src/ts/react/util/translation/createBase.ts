import {
  Intl,
  RobloxIntlInstance,
  RobloxTranslationResource,
  TranslationResourceProvider
} from "@rbx/legacy-webapp-types/Roblox";
import { TranslationConfig } from "@rbx/core-scripts/legacy/react-utilities";

/**
 * Pulling this function out of the hook, mainly to simplify testing by making
 * it simpler to mock this function.
 * I looked further down the tree and trying to test with `TranslationResourceProvider` etc
 * seemed like it wasn't worth the effort.
 */
export const createTranslationBase = (
  translationConfig: TranslationConfig
): {
  resource: RobloxTranslationResource;
  intl: RobloxIntlInstance;
} => {
  const intl = new Intl();

  if (Array.isArray(translationConfig)) {

    const translationProvider = new TranslationResourceProvider(intl);
    const languageResources = translationConfig
      .filter(namespace => !!namespace)
      .map(namespace => translationProvider.getTranslationResource(namespace));

    const mergedLanguageResources = translationProvider.mergeTranslationResources(
      ...languageResources
    );

    return { resource: mergedLanguageResources, intl };
  }

  const { common, feature } = translationConfig;
  const translationProvider = new TranslationResourceProvider(intl);
  const languageResources = [...common, feature]
  .filter(namespace => !!namespace)
    .map(namespace => translationProvider.getTranslationResource(namespace));

  const mergedLanguageResources = translationProvider.mergeTranslationResources(
    ...languageResources
  );
  return { resource: mergedLanguageResources, intl };
};

/** Adding this here to get nice typing when using the mock */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const testAddTranslationData = (_data: { [key: string]: string }): void => undefined;
