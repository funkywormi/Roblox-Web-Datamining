import { Role } from '../types';
import { getMaxAssignableRank } from './communityOwnership';

/**
 * Returns the ID of the deletable role with the lowest rank, or undefined if
 * none exist.  A role is deletable when its rank is strictly between minRank
 * and maxRank and it is not the base role.
 */
const getLowestDeletableRoleId = (
  roles: Role[],
  minRank: number,
  maxRank: number,
  isOwnerRolesetDeprecated = false
): number | undefined => {
  const maxDeletableRank = getMaxAssignableRank(maxRank, isOwnerRolesetDeprecated);
  const lowest = roles.reduce<Role | undefined>((min, r) => {
    if (r.isBase || r.rank <= minRank || r.rank > maxDeletableRank) return min;
    if (!min || r.rank < min.rank) return r;
    return min;
  }, undefined);
  return lowest?.id;
};

export default getLowestDeletableRoleId;
