import { useCommunityProductFeatures } from '../contexts/CommunityProductFeaturesContext';
import { isCommunityOwner } from '../utils/communityOwnership';
import useGroupOwner from './useGroupOwner';

/**
 * Composes `useGroupOwner(groupId)` (cached owner lookup) with the
 * `IsOwnerRolesetDeprecated` community product feature flag and the `isCommunityOwner` util into
 * one boolean. Use this at single-user surfaces (member rows, forum posts, announcements) to
 * decide whether to render the "Owner" pill alongside the user's name -- e.g.
 *
 *   const isOwner = useIsCommunityOwner(user.userId, groupId);
 *   return <>{name} {isOwner && <OwnerPill />}</>;
 *
 * For surfaces that iterate users inside a callback (where hooks can't be called per-item, like
 * `MembersListDialog`'s `userDisplayNameTrailingLabel`), call `useGroupOwner` +
 * `useCommunityProductFeatures` once at the top and pass the values through `isCommunityOwner`
 * per row instead.
 *
 * Requires both `QueryClientProvider` (for the owner fetch) and
 * `CommunityProductFeaturesContextProvider` (for the flag) ancestors.
 */
const useIsCommunityOwner = (userId: number, groupId: number): boolean => {
  const ownerUserId = useGroupOwner(groupId);
  const { features } = useCommunityProductFeatures();
  return isCommunityOwner({ userId }, ownerUserId, features.IsOwnerRolesetDeprecated);
};

export default useIsCommunityOwner;
