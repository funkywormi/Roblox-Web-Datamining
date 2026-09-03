import {
  wearableAssetTypes,
  maxAccessories,
  maxLayeredClothing,
  avatarAssetTypeNames,
  layeredClothingGroups,
  layeredClothingGroupLimits,
  layeredClothingAssetOrder,
  advancedEditorLimits,
  dnaLayeredAccessories,
  layeredClothingOrderOffset,
  nonAvatarAssetTypeIds,
  profileBackgroundAssetTypeId,
} from "../constants/assetTypeConstants";

function isAccessoryType(assetTypeName) {
  switch (assetTypeName) {
    case avatarAssetTypeNames.hat:
    case avatarAssetTypeNames.hairAccessory:
    case avatarAssetTypeNames.faceAccessory:
    case avatarAssetTypeNames.neckAccessory:
    case avatarAssetTypeNames.shoulderAccessory:
    case avatarAssetTypeNames.frontAccessory:
    case avatarAssetTypeNames.backAccessory:
    case avatarAssetTypeNames.waistAccessory:
    case avatarAssetTypeNames.hairAccessoryName:
    case avatarAssetTypeNames.faceAccessoryName:
    case avatarAssetTypeNames.neckAccessoryName:
    case avatarAssetTypeNames.shoulderAccessoryName:
    case avatarAssetTypeNames.frontAccessoryName:
    case avatarAssetTypeNames.backAccessoryName:
    case avatarAssetTypeNames.waistAccessoryName:
      return true;
    default:
      return false;
  }
}

function isAnimation(assetTypeName) {
  switch (assetTypeName) {
    case avatarAssetTypeNames.climbAnimation:
    case avatarAssetTypeNames.fallAnimation:
    case avatarAssetTypeNames.jumpAnimation:
    case avatarAssetTypeNames.runAnimation:
    case avatarAssetTypeNames.swimAnimation:
    case avatarAssetTypeNames.walkAnimation:
    case avatarAssetTypeNames.emoteAnimation:
    case avatarAssetTypeNames.idleAnimation:
    case avatarAssetTypeNames.climbAnimationName:
    case avatarAssetTypeNames.fallAnimationName:
    case avatarAssetTypeNames.jumpAnimationName:
    case avatarAssetTypeNames.runAnimationName:
    case avatarAssetTypeNames.swimAnimationName:
    case avatarAssetTypeNames.walkAnimationName:
    case avatarAssetTypeNames.emoteAnimationName:
    case avatarAssetTypeNames.idleAnimationName:
      return true;
    default:
      // all types need it except the animation types which don't have an effect visible in AE
      return false;
  }
}

function isEmote(assetTypeName) {
  switch (assetTypeName) {
    case avatarAssetTypeNames.emoteAnimation:
    case avatarAssetTypeNames.emoteAnimationName:
      return true;
    default:
      return false;
  }
}

function isDynamicHead(assetTypeName) {
  switch (assetTypeName) {
    case avatarAssetTypeNames.dynamicHead:
    case avatarAssetTypeNames.dynamicHeadName:
      return true;
    default:
      return false;
  }
}

function isDynamicHeadInAssetList(assets) {
  let containsDynamicHead = false;
  assets.forEach(asset => {
    if (isDynamicHead(asset.assetType.name)) {
      containsDynamicHead = true;
    }
  });
  return containsDynamicHead;
}

// Asset types that are recognized for sales/catalog purposes but must never be
// part of an avatar definition or worn assets list (e.g. Profile Background).
function isNonAvatarAssetType(assetTypeId) {
  return nonAvatarAssetTypeIds.includes(assetTypeId);
}

function isProfileBackground(assetTypeId) {
  return assetTypeId === profileBackgroundAssetTypeId;
}

function getAssetTypeById(id) {
  let returnAssetType;
  wearableAssetTypes.forEach(assetType => {
    if (assetType.id === id) {
      returnAssetType = assetType;
    }
  });
  return returnAssetType;
}

function getAssetTypeByName(name) {
  let returnAssetType;
  wearableAssetTypes.forEach(assetType => {
    if (assetType.name === name) {
      returnAssetType = assetType;
    }
  });
  return returnAssetType;
}

function getAssetTypeByType(type) {
  let returnAssetType;
  wearableAssetTypes.forEach(assetType => {
    if (assetType.type === type) {
      returnAssetType = assetType;
    }
  });
  return returnAssetType;
}

function getAssetTypeNameById(id) {
  const assetType = getAssetTypeById(id);
  return assetType && assetType.name ? assetType.name : null;
}

function getLayeredClothingAssetOrder(id) {
  return layeredClothingAssetOrder[id];
}

function isLayeredClothing(id, ignoreDnaLayeredAccessories = false) {
  // Hair is a special case where it is layered but often not restricted by LC rules
  if (ignoreDnaLayeredAccessories && dnaLayeredAccessories.includes(id)) {
    return false;
  }
  return getLayeredClothingAssetOrder(id) !== undefined;
}

function getAdvancedAccessoryLimit(id) {
  return advancedEditorLimits[id];
}

function maxOfAssetType(assetTypeId) {
  if (assetTypeId in layeredClothingGroups) {
    const group = layeredClothingGroups[assetTypeId];
    return layeredClothingGroupLimits[group];
  }

  const assetType = getAssetTypeById(assetTypeId);
  const maxNumber = assetType ? assetType.maxNumber : 1;
  return maxNumber;
}

function addAssetToAvatar(
  assetToWear,
  assetList,
  clearAssetsOfSameType = false,
  allowMoreThanMaxPerAsset = false,
) {
  const filteredAssets = [];
  const count = {};
  if (!assetToWear.assetType.name) {
    // eslint-disable-next-line no-param-reassign
    assetToWear.assetType.name = getAssetTypeById(assetToWear.assetType.id).name;
  }
  const isAddingAccessory = isAccessoryType(assetToWear.assetType.name);

  function getBucket(assetType) {
    if (!isAddingAccessory && isAccessoryType(assetType.name)) {
      return "Accessory";
    }

    if (assetType.id in layeredClothingGroups) {
      return layeredClothingGroups[assetType.id];
    }

    return assetType.id;
  }

  function preserveSameTypeAsset(asset) {
    const { assetType } = asset;
    if (!clearAssetsOfSameType || asset === assetToWear) {
      return true;
    }

    if (assetType.id in layeredClothingGroups) {
      if (assetToWear.assetType.id in layeredClothingGroups) {
        return (
          layeredClothingGroups[assetType.id] !== layeredClothingGroups[assetToWear.assetType.id]
        );
      }
      // this is a non LC group item being applied, they cannot be of the same category
      return true;
    }
    if (assetToWear.assetType.id in layeredClothingGroups) {
      return true;
    }
    return assetType.id !== assetToWear.assetType.id;
  }

  // if adding an accessory, use the regular wearing limits
  // otherwise use the 10 accessory limit

  function add(asset) {
    const { assetType } = asset;
    // Non-avatar asset types (e.g. Profile Background) are never added to the
    // avatar / worn assets list - they have separate handling.
    if (isNonAvatarAssetType(assetType.id)) {
      return;
    }
    const max =
      !isAddingAccessory && isAccessoryType(assetType.name)
        ? maxAccessories
        : maxOfAssetType(assetType.id);
    const bucket = getBucket(asset.assetType);
    count[bucket] = typeof count[bucket] === "undefined" ? 0 : count[bucket];
    count.LayeredClothing =
      typeof count.LayeredClothing === "undefined" ? 0 : count.LayeredClothing;

    if (isLayeredClothing(assetType.id, true)) {
      if (count.LayeredClothing <= maxLayeredClothing) {
        count.LayeredClothing += 1;
      } else {
        console.debug(
          `Removed asset ${asset.name} because it exceeded LayeredClothing wearing limits`,
        );
        return;
      }
    }
    if (allowMoreThanMaxPerAsset || count[bucket] < max) {
      if (preserveSameTypeAsset(asset)) {
        count[bucket] += 1;
        filteredAssets.push(asset);
      } else {
        console.debug(`Removed asset ${asset.name} because it is being cleared by the new outfit`);
      }
    } else {
      console.debug(`Removed asset ${asset.name} because it exceeded wearing limits`);
    }
  }

  add(assetToWear);

  assetList.forEach(asset => {
    add(asset);
  });
  return filteredAssets;
}

function removeAssetFromAvatar(assetToRemove, assetList) {
  const filteredAssets = [];

  assetList.forEach(asset => {
    if (asset.id !== assetToRemove.id) {
      filteredAssets.push(asset);
    }
  });

  return filteredAssets;
}

function removeAssetTypesFromAvatar(assetTypeIds, assetList) {
  const filteredAssets = [];

  assetList.forEach(asset => {
    let isExcluded = false;
    assetTypeIds.forEach(assetTypeId => {
      if (asset.assetType.id === assetTypeId) {
        isExcluded = true;
      }
    });
    if (!isExcluded) {
      filteredAssets.push(asset);
    }
  });
  return filteredAssets;
}

const maxNumberOfLayeredClothingItems = maxLayeredClothing;
const maxNumberOfAdvancedAccessoryItems = maxAccessories;
const layeredClothingRefinementOrderOffset = layeredClothingOrderOffset;
function removeLayeredClothingFromAvatar(assetList) {
  const filteredAssets = [];

  assetList.forEach(asset => {
    if (!isLayeredClothing(asset.assetType.id, true)) {
      filteredAssets.push(asset);
    }
  });
  return filteredAssets;
}

function checkDefaultLayerOrders(assetList) {
  let isDefaultOrder = true;

  assetList.forEach(asset => {
    if (isLayeredClothing(asset.assetType.id, true)) {
      if (asset.meta) {
        isDefaultOrder =
          isDefaultOrder && asset.meta.order === getLayeredClothingAssetOrder(asset.assetType.id);
      }
    }
  });
  return isDefaultOrder;
}

function checkAssetEquality(fromAsset, toAsset) {
  return fromAsset.id === toAsset.id;
}

function findAssetInArray(asset, assetList) {
  let index = -1;
  let count = 0;
  assetList.forEach(listAsset => {
    if (checkAssetEquality(asset, listAsset)) {
      index = count;
    }
    count += 1;
  });
  return index;
}

function buildMetaForAsset(assetToAdd, assetList, replaceSameType = true) {
  if (!isLayeredClothing(assetToAdd.assetType.id)) {
    return assetToAdd;
  }
  let meta;
  if (checkDefaultLayerOrders(assetList)) {
    meta = {
      order: getLayeredClothingAssetOrder(assetToAdd.assetType.id),
    };
  } else {
    let assetListPosition = 0;
    const defaultOrder = getLayeredClothingAssetOrder(assetToAdd.assetType.id);
    let defaultOrderDifference;
    let proposedOrder;

    assetList.forEach(listAsset => {
      if (isLayeredClothing(listAsset.assetType.id, true)) {
        if (checkAssetEquality(assetToAdd, listAsset)) {
          meta = {
            order: listAsset.meta.order,
          };
        } else if (listAsset.assetType.id === assetToAdd.assetType.id) {
          if (replaceSameType) {
            meta = {
              order: listAsset.meta.order,
            };
          } else {
            defaultOrderDifference = 0;
            proposedOrder = listAsset.meta.order + 1;
          }
        } else {
          const listAssetDefaultPosition = getLayeredClothingAssetOrder(listAsset.assetType.id);
          if (
            listAssetDefaultPosition > defaultOrder &&
            (defaultOrderDifference === undefined ||
              listAssetDefaultPosition - defaultOrder < defaultOrderDifference) &&
            !(
              replaceSameType &&
              layeredClothingGroups[assetToAdd.assetType.id] ===
                layeredClothingGroups[listAsset.assetType.id]
            )
          ) {
            defaultOrderDifference = listAssetDefaultPosition - defaultOrder;
            proposedOrder = listAsset.meta.order - 1;
          }
        }
        assetListPosition += 1;
      }
    });

    if (meta === undefined) {
      if (proposedOrder === undefined) {
        meta = {
          order: assetListPosition,
        };
      } else {
        meta = {
          order: proposedOrder,
        };
      }
    }
  }
  const asset = Object.assign(assetToAdd, { meta });
  return asset;
}

function insertAssetMetaIntoAssetList(assetToAdd, assetList) {
  const filteredAssets = [];
  const layeredClothingAssets = [];
  assetList.forEach(asset => {
    const newAsset = JSON.parse(JSON.stringify(asset));
    if (isLayeredClothing(asset.assetType.id, true)) {
      layeredClothingAssets.push(newAsset);
    }
    filteredAssets.push(newAsset);
  });
  let assetOrdersUnchanged = true;
  let newAssetToAdd;
  layeredClothingAssets.forEach(asset => {
    if (checkAssetEquality(asset, assetToAdd)) {
      newAssetToAdd = asset;
    }
    if (
      !checkAssetEquality(asset, assetToAdd) &&
      assetToAdd.meta &&
      asset.meta.order >= assetToAdd.meta.order
    ) {
      // eslint-disable-next-line no-param-reassign
      asset.meta.order += 1;
      assetOrdersUnchanged = false;
    }
  });
  if (assetToAdd.meta && !assetOrdersUnchanged) {
    newAssetToAdd.meta.order += 1;
  }
  return filteredAssets;
}

function buildMetaForAssets(assetList, preserveMeta, layeredClothingAssetList = undefined) {
  const filteredAssets = [];
  assetList.forEach(asset => {
    // Non-avatar asset types (e.g. Profile Background) are excluded from any
    // avatar definition built by the accoutrement service.
    if (asset.assetType && isNonAvatarAssetType(asset.assetType.id)) {
      return;
    }
    const newAsset = JSON.parse(JSON.stringify(asset));
    if (!asset.empty && isLayeredClothing(asset.assetType.id)) {
      if (
        !(preserveMeta && newAsset.meta) &&
        layeredClothingAssetList &&
        findAssetInArray(asset, layeredClothingAssetList) >= 0
      ) {
        newAsset.meta = {
          order: findAssetInArray(asset, layeredClothingAssetList),
        };
      } else if (!newAsset.meta) {
        newAsset.meta = {
          order: getLayeredClothingAssetOrder(asset.assetType.id),
        };
      }
    }
    filteredAssets.push(newAsset);
  });
  return filteredAssets;
}

function isBodyPart(assetTypeId) {
  return getAssetTypeById(assetTypeId).body;
}

function getCategories() {
  const categories = {};

  wearableAssetTypes.forEach(assetType => {
    if (assetType.category) {
      if (!categories[assetType.category]) {
        categories[assetType.category] = [];
      }
      categories[assetType.category].push(assetType.id);
    }
  });

  return categories;
}

export {
  addAssetToAvatar,
  removeAssetFromAvatar,
  removeAssetTypesFromAvatar,
  removeLayeredClothingFromAvatar,
  getAssetTypeById,
  getAssetTypeByName,
  getAssetTypeByType,
  getAssetTypeNameById,
  getLayeredClothingAssetOrder,
  getAdvancedAccessoryLimit,
  isAccessoryType,
  isAnimation,
  isEmote,
  isLayeredClothing,
  isDynamicHead,
  isDynamicHeadInAssetList,
  isNonAvatarAssetType,
  isProfileBackground,
  buildMetaForAsset,
  insertAssetMetaIntoAssetList,
  buildMetaForAssets,
  maxNumberOfLayeredClothingItems,
  maxNumberOfAdvancedAccessoryItems,
  layeredClothingRefinementOrderOffset,
  isBodyPart,
  getCategories,
};
