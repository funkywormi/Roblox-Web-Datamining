import type Locale from '../enums/Locale';
import type LocaleInfo from '../interfaces/LocaleInfo';
import type TranslationResource from '../interfaces/TranslationResource';
import type TranslationResourceProvider from '../interfaces/TranslationResourceProvider';

type TranslationResourceCache = {
  [key in Locale]?: { [key: string]: TranslationResource };
};
type TranslationResourceRequestCache = { [key: string]: Promise<TranslationResource> };

export default abstract class TranslationResourceProviderBase implements TranslationResourceProvider {
  private translationResourceCache: TranslationResourceCache;

  private translationResourceRequestCache: TranslationResourceRequestCache;

  abstract loadRuntimeLocaleInfo(): Promise<LocaleInfo>;

  protected constructor(
    public defaultLocaleInfo: LocaleInfo,
    public fallbackLocale = defaultLocaleInfo.locale,
  ) {
    this.translationResourceCache = {};
    this.translationResourceRequestCache = {};
  }

  protected abstract fetchTranslationResource(
    namespace: string,
    locale: Locale,
  ): Promise<TranslationResource>;

  loadTranslationResources(namespaces: string[], locale: Locale): Promise<TranslationResource[]> {
    return Promise.all(
      namespaces.map(async (namespace) => {
        try {
          return await this.loadTranslationResource(namespace, locale);
        } catch {
          // eslint-disable-next-line no-console
          console.warn(`Failed to retrieve namespace ${namespace} for locale ${locale}`);
          return {};
        }
      }),
    );
  }

  getTranslationResources(namespaces: string[], locale: Locale): TranslationResource[] | null {
    if (
      !namespaces.every((namespace) => {
        const resource = this.tryGetTranslationResourceFromCache(namespace, locale);
        return typeof resource !== 'undefined';
      })
    ) {
      return null;
    }

    return namespaces.map((namespace) => {
      const resource = this.tryGetTranslationResourceFromCache(namespace, locale);
      return resource ?? {};
    });
  }

  protected async loadTranslationResource(
    namespace: string,
    locale: Locale,
  ): Promise<TranslationResource> {
    // * Lookup from resource cache
    const resourceFromCache = this.tryGetTranslationResourceFromCache(namespace, locale);
    if (resourceFromCache) {
      return resourceFromCache;
    }

    // * Lookup from request cache
    const requestCacheKey = `${locale}-${namespace}`;
    if (Object.hasOwn(this.translationResourceRequestCache, requestCacheKey)) {
      return this.translationResourceRequestCache[requestCacheKey];
    }

    let translationResource: TranslationResource = {};
    try {
      // * Create the request and put it into the request cache
      const translationResourceRequest = this.fetchTranslationResourceWithFallback(
        namespace,
        locale,
      );
      this.translationResourceRequestCache[requestCacheKey] = translationResourceRequest;

      // * Wait for the response
      translationResource = await translationResourceRequest;

      // * Populate the resource cache
      if (this.translationResourceCache[locale] == null) {
        this.translationResourceCache[locale] = {};
      }

      // * NOTE(@zwang, 08/05/24): this can't be null/undefined because of the check above, latest
      // * TypeScript version will be able to infer this automatically
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.translationResourceCache[locale]![namespace] = translationResource;
    } catch {
      // eslint-disable-next-line no-console
      console.warn(`Failed to retrieve translation resources of ${namespace} for ${locale}`);
    } finally {
      // * clean up the request cache
      delete this.translationResourceRequestCache[requestCacheKey];
    }

    return translationResource;
  }

  private tryGetTranslationResourceFromCache(
    namespace: string,
    locale: Locale,
  ): TranslationResource | undefined {
    return this.translationResourceCache[locale]?.[namespace];
  }

  private async fetchTranslationResourceWithFallback(
    namespace: string,
    locale: Locale,
  ): Promise<TranslationResource> {
    let translationResource: TranslationResource = {};
    try {
      translationResource = await this.fetchTranslationResource(namespace, locale);
    } catch {
      // eslint-disable-next-line no-console
      console.warn(`Failed to retrieve translation resources of ${namespace} for ${locale}`);
    }

    // * if a non-fallback locale is being fetched, check if fallback is needed
    if (locale !== this.fallbackLocale) {
      if (
        Object.values(translationResource).some((translation) => translation == null) ||
        Object.keys(translationResource).length === 0
      ) {
        try {
          const fallbackLocaleResource = await this.loadTranslationResource(
            namespace,
            this.fallbackLocale,
          );

          return Object.keys({
            ...fallbackLocaleResource,
            ...translationResource,
          }).reduce<TranslationResource>((mergedResource, key) => {
            Object.assign(mergedResource, {
              [key]: translationResource[key] ?? fallbackLocaleResource[key],
            });
            return mergedResource;
          }, {});
        } catch {
          return translationResource;
        }
      }
    }

    return translationResource;
  }
}
