import type { CreatorDetails, CreatorGroupDetails } from './types';

export default function findFirstCreator(
  creatorData?: CreatorGroupDetails[],
): CreatorDetails | null {
  if (!creatorData || !creatorData.length) {
    return null;
  }

  for (const group of creatorData) {
    if (group.creatorsList && group.creatorsList.length) {
      return group.creatorsList[0];
    }
  }
  return null;
}
