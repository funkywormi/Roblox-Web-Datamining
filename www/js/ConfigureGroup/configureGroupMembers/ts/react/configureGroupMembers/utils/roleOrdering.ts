import { AssignedRole } from '../../shared/types';

/**
 * Inserts `newRole` into `currentRoles` at the position that keeps the list ordered by
 * descending LexoRank. `roleOrderMap` is keyed by role id and sourced from the group's ascending
 * LexoRank order. A role that is absent from the map is treated as lowest priority (sorts to the
 * end).
 *
 * Pure: returns a new array and never mutates its inputs.
 */
// eslint-disable-next-line import/prefer-default-export
export const insertRoleInOrder = (
  currentRoles: Array<AssignedRole>,
  newRole: AssignedRole,
  roleOrderMap: Map<number, number>
): Array<AssignedRole> => {
  const result = [...currentRoles];
  const newRoleOrder = roleOrderMap.get(newRole.id) ?? Number.NEGATIVE_INFINITY;

  for (let i = 0; i < result.length; i += 1) {
    const existingOrder = roleOrderMap.get(result[i].id) ?? Number.NEGATIVE_INFINITY;
    if (existingOrder <= newRoleOrder) {
      result.splice(i, 0, newRole);
      return result;
    }
  }

  result.push(newRole);
  return result;
};
