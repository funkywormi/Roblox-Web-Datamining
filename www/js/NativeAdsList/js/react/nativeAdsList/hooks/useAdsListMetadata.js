const useAdsListMetadata = adsListRootElementId => {
  let groupId;
  let assetId;
  let universeId;
  const isGenericNativeAdsListEnabled = true;
  const isCatalogSearchEnabled = true;

  const element = document.getElementById(adsListRootElementId);
  if (element.dataset) {
    groupId = element.dataset.groupId;
    assetId = element.dataset.assetId;
    universeId = element.dataset.universeId;
  } else {
    groupId = element.getAttribute('data-group-id');
    assetId = element.getAttribute('data-asset-id');
    universeId = element.getAttribute('data-universe-id');
  }

  groupId = groupId ? parseInt(groupId, 10) : null;
  assetId = assetId ? parseInt(assetId, 10) : null;
  universeId = universeId ? parseInt(universeId, 10) : null;

  return {
    groupId,
    assetId,
    universeId,
    isGenericNativeAdsListEnabled,
    isCatalogSearchEnabled
  };
};

export default useAdsListMetadata;
