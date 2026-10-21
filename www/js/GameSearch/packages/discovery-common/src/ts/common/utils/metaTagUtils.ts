const ENABLED_VALUE = "true";

const getMetaDataset = (metaName: string): DOMStringMap | undefined =>
  document.querySelector<HTMLMetaElement>(`meta[name="${metaName}"]`)?.dataset;

export const readEnabledAttribute = (
  metaName: string,
  datasetKey: string,
  options: { defaultValue?: boolean } = {},
): boolean => {
  const { defaultValue = false } = options;

  const value = getMetaDataset(metaName)?.[datasetKey];
  return value === undefined ? defaultValue : value.toLowerCase() === ENABLED_VALUE;
};
