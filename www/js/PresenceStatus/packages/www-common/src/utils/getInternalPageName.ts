export const getInternalPageName = (): string | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }
  const pageMeta = document.querySelector<HTMLMetaElement>('meta[name="page-meta"]');
  return pageMeta?.dataset.internalPageName;
};
