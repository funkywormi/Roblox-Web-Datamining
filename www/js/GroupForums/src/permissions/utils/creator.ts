import type { CreatorDetails, CreatorGroupDetails } from './types';

export default function findFirstCreator(
  creatorData?: CreatorGroupDetails[],
): CreatorDetails | null {
  if (!creatorData || !creatorData.length) {
    return null;
  }

  for (const group of creatorData) {
    const creator = group.creatorsList.find(({ disabled }) => !disabled);
    if (creator) {
      return creator;
    }
  }
  return null;
}
