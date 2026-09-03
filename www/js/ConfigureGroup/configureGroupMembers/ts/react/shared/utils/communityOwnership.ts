import { User, Role } from '../types';

/**
 * Owner-roleset deprecation utilities. Single source of truth for the handful of "is this user
 * the community owner?" / "is this the legacy rank-255 role?" checks that gate behavior under
 * the `IsOwnerRolesetDeprecated` community product feature. Anywhere groups web code would
 * otherwise inline these conditions, it should call one of these helpers instead -- and unit
 * tests live alongside in `communityOwnership.test.ts` so the matrix of (flag on/off) x (rank
 * 255 / not) x (owner / not) is covered in exactly one place.
 *
 * Coordinated with the backend deprecation tracked under GRPS-2162. Once the flag is enabled
 * for a community:
 *   - Ownership is sourced from `Group.OwnerUserId` (no longer "the user holding rank 255").
 *   - The rank-255 role is editable / deletable like any other role.
 *   - Rank 255 is assignable to new roles by admins.
 * Until the flag is enabled, the legacy "rank 255 = locked owner role" contract still applies.
 */

/**
 * True when `user` is the community owner under the post-deprecation contract. Returns false
 * when the flag is off (the legacy rank-255 contract is still in effect, and "owner" is not a
 * per-user attribute), when `ownerUserId` is unknown, or when the user simply isn't the owner.
 *
 * Use this to gate the inline "Owner" pill on member list rows, member cards, forum posts and
 * announcements.
 */
export const isCommunityOwner = (
  user: Pick<User, 'userId'>,
  ownerUserId: number | undefined,
  isOwnerRolesetDeprecated: boolean
): boolean => isOwnerRolesetDeprecated && ownerUserId !== undefined && user.userId === ownerUserId;

/**
 * True when `role` is the rank-255 role on a community whose owner-roleset deprecation flag is
 * still off -- i.e. the role is locked under the legacy "rank 255 = locked owner role" contract.
 * Use this to gate "read-only / locked" UI affordances (configure-roles tabs, role-select
 * dialog filter, etc.) that must not allow edits to the locked owner role.
 *
 * Returns false for rank-255 roles once the flag is on (they're editable like any other role)
 * and false for any non-rank-255 role regardless of the flag.
 */
export const isLockedOwnerRole = (
  role: Pick<Role, 'rank'>,
  maxRank: number,
  isOwnerRolesetDeprecated: boolean
): boolean => role.rank === maxRank && !isOwnerRolesetDeprecated;

/**
 * True when `role` is the (now-editable) rank-255 role on a community whose owner-roleset
 * deprecation flag is on. Use this to gate banners / messaging that surface the post-
 * deprecation state on the rank-255 role itself (e.g. `OwnerDeprecationBanner` on the
 * configure-roles page).
 *
 * Complement of `isLockedOwnerRole` on rank-255 roles: same rank check, opposite flag state.
 */
export const isUnlockedOwnerRole = (
  role: Pick<Role, 'rank'>,
  maxRank: number,
  isOwnerRolesetDeprecated: boolean
): boolean => role.rank === maxRank && isOwnerRolesetDeprecated;

/**
 * Highest rank an admin can assign when creating or editing a role. Pre-deprecation the cap is
 * `maxRank - 1` (rank 255 is reserved for the locked owner role); post-deprecation rank 255 is
 * just another assignable rank.
 */
export const getMaxAssignableRank = (maxRank: number, isOwnerRolesetDeprecated: boolean): number =>
  isOwnerRolesetDeprecated ? maxRank : maxRank - 1;
