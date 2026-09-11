// Do not import anything here without considering if you need to update the rspack.config.js

const requestContextDataset = (): DOMStringMap | null => {
  const metaTag = document.querySelector<HTMLMetaElement>(`meta[name="request-context-data"]`);
  return metaTag?.dataset ?? null;
};

export const requestCountryCode = (): string => requestContextDataset()?.requestCountryCode ?? "";
