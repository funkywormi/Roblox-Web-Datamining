import avatarConstants from "../constants/avatarConstants";

function hasInvalidOutfitName(data: any, isRenameOutfit: boolean): boolean {
  let invalidOutfitName = false;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const errors = data?.data?.errors || data?.errors;
  if (errors) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    for (let i = 0; i < errors.length; i++) {
      const errorCode = isRenameOutfit
        ? avatarConstants.outfits.outfitErrorCodes.renameOutfitInvalidOutfitName
        : avatarConstants.outfits.outfitErrorCodes.createOutfitInvalidOutfitName;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (errors[i].code === errorCode) {
        invalidOutfitName = true;
      }
    }
  }
  return invalidOutfitName;
}

export default hasInvalidOutfitName;
