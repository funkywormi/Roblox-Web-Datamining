import Intl from "@rbx/core-scripts/intl";
import TranslationResource from "./translationResource";

export default class TranslationResourceProvider {
  static combineTranslationResources(intl, ...translationResources) {
    const resourceMap = translationResources.reduce(
      (newResourceMap, translationResource) =>
        Object.assign(newResourceMap, translationResource.resourceMap),
      {},
    );

    // Keep the nested keys, and also expose each one as `namespace.key`.
    translationResources.forEach(translationResource => {
      const { namespace, resourceMap: sourceMap } = translationResource;
      if (!namespace) {
        return;
      }

      Object.entries(sourceMap).forEach(([key, value]) => {
        resourceMap[`${namespace}.${key}`] = value;
      });
    });

    return new TranslationResource(intl, resourceMap, null);
  }

  constructor(intl = new Intl()) {
    this.intl = intl;
  }

  /*
   * Returns a Translation Resource with getter methods
   * @param namespace {string}
   */
  getTranslationResource(namespace) {
    const { Lang, LangDynamicDefault, LangDynamic } = window.Roblox;

    const resourceMap = {
      ...LangDynamicDefault?.[namespace],
      ...Lang?.[namespace],
      ...LangDynamic?.[namespace],
    };

    if (Object.keys(resourceMap).length === 0) {
      console.warn(`The namespace ${namespace} was not found`);
    }

    return new TranslationResource(this.intl, resourceMap, namespace);
  }

  /*
   * Returns a merged Translation Resource whose namespace is set to null
   * Be care for with the order of all parameters in the case of a key conflict
   * @param translationResources {TranslationResource[]}
   */
  mergeTranslationResources(...translationResources) {
    return TranslationResourceProvider.combineTranslationResources(
      this.intl,
      ...translationResources,
    );
  }
}
