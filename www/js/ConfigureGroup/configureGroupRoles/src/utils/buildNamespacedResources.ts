import type NamespacedResources from '../interfaces/NamespacedResources';
import type TranslationResource from '../interfaces/TranslationResource';

export function buildNamespacedResources(
  resources: TranslationResource[],
  namespaces?: string[],
): NamespacedResources {
  if (Array.isArray(namespaces)) {
    return namespaces.reduce<NamespacedResources>((result, namespace, i) => {
      result[namespace] = resources[i];
      return result;
    }, {});
  }
  // no-namespace keys are stored under '' namespace
  return {
    '': resources.reduce<TranslationResource>(
      (result, resource) => Object.assign(result, resource),
      {},
    ),
  };
}
