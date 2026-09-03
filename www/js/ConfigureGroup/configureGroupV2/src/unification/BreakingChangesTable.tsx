import type { FC } from 'react';
import React from 'react';
import type { RobloxGroupsApiBreakingChangeRoleEntry } from '@rbx/client-groups/v1';
import {
  IconButton,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableBody,
  TableCell,
} from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import type { GroupRoleColorType } from '../clients/groups';
import TranslationNamespace from '../constants/TranslationNamespace';
import RoleIcon from '../members/components/common/RoleIcon';
import { RoleColorTokenMap } from '../utils/constants';
import {
  AssignSameRolePermission,
  LINKED_OUT_MODAL_SUPPRESSION_QUERY_PARAM,
  type BreakingChangeEntry,
} from '../utils/unificationUtils';

type BreakingChangesTableProps = {
  breakingChanges: BreakingChangeEntry[];
  groupId: number;
  getCreatorHubRoleUrl?: (roleId: string) => string;
  getLegacyRolesUrl?: (groupId: string) => string;
};

type BreakingChangeRow = {
  key: string;
  roleId?: number;
  roleName: string;
  roleColor?: GroupRoleColorType;
  isOrgRole: boolean;
  permissions: string[];
};

const isGroupRoleColor = (value: unknown): value is GroupRoleColorType =>
  typeof value === 'number' && Object.hasOwn(RoleColorTokenMap, value);

const getRoleColor = (
  role: RobloxGroupsApiBreakingChangeRoleEntry,
): GroupRoleColorType | undefined => {
  if (!isGroupRoleColor(role.color)) {
    return undefined;
  }

  return role.color;
};

function getRoleKey(role: RobloxGroupsApiBreakingChangeRoleEntry): string {
  const isOrg = role.isOrgRole ?? false;
  const identifier = role.id != null ? String(role.id) : (role.name ?? '');
  return `${isOrg}:${identifier}`;
}

function buildRows(breakingChanges: BreakingChangeEntry[]): BreakingChangeRow[] {
  const roleMap = new Map<string, RobloxGroupsApiBreakingChangeRoleEntry>();

  // All current breaking change types are permission removals; change.type is not read.
  breakingChanges.forEach((change) => {
    const roles = change.roles ?? [];
    if (roles.length === 0) {
      return;
    }

    roles.forEach((role) => {
      const key = getRoleKey(role);
      const existingRole = roleMap.get(key);
      roleMap.set(key, {
        id: existingRole?.id ?? role.id,
        name: existingRole?.name ?? role.name,
        color: existingRole?.color ?? role.color,
        isOrgRole: existingRole?.isOrgRole ?? role.isOrgRole ?? false,
        permissions: Array.from(
          new Set([...(existingRole?.permissions ?? []), ...(role.permissions ?? [])]),
        ),
      });
    });
  });

  return Array.from(roleMap.values())
    .filter((role) => (role.permissions?.length ?? 0) > 0)
    .map((role) => ({
      key: getRoleKey(role),
      roleId: role.id,
      roleName: role.name ?? '',
      roleColor: getRoleColor(role),
      isOrgRole: role.isOrgRole ?? false,
      permissions: role.permissions ?? [],
    }));
}

function addModalSuppressionQueryParam(url: string): string {
  const hashIndex = url.indexOf('#');
  const baseUrl = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex);
  const separator = baseUrl.includes('?') ? '&' : '?';

  return `${baseUrl}${separator}${LINKED_OUT_MODAL_SUPPRESSION_QUERY_PARAM}=true${hash}`;
}

const BreakingChangesTable: FC<BreakingChangesTableProps> = ({
  breakingChanges,
  groupId,
  getCreatorHubRoleUrl,
  getLegacyRolesUrl,
}) => {
  const { translateWithNamespace } = useTranslation();
  const tGM = (key: string, args?: Record<string, string>) =>
    translateWithNamespace(TranslationNamespace.GroupManagement, key, args);
  const tPerms = (key: string, args?: Record<string, string>) =>
    translateWithNamespace(TranslationNamespace.Permissions, key, args);
  const tGroups = (key: string) => translateWithNamespace(TranslationNamespace.Groups, key);

  const rows = buildRows(breakingChanges);

  return (
    <div className='width-full min-width-0 max-width-full max-height-[380px] clip-x scroll-y [&::-webkit-scrollbar]:width-[12px] [&::-webkit-scrollbar-thumb]:bg-[var(--color-shift-300)] [&::-webkit-scrollbar-thumb]:[border:3px_solid_var(--color-surface-100)] [&::-webkit-scrollbar-thumb]:radius-[10px]'>
      <Table className='flex flex-col max-width-full' variant='Framed'>
        <TableHeader className='flex flex-row min-width-0 max-width-full'>
          <TableHeaderCell className='min-width-0 [flex:1_1_0%]'>
            <span className='text-label-medium content-emphasis'>{tGM('Label.RolesImpacted')}</span>
          </TableHeaderCell>
          <TableHeaderCell className='min-width-0 [flex:2_1_0%]'>
            <span className='text-label-medium content-emphasis'>
              {tGM('Label.BreakingChanges')}
            </span>
          </TableHeaderCell>
        </TableHeader>
        <TableBody className='flex flex-col min-width-0 max-width-full'>
          {rows.map((row) => {
            const translatedPermissions = row.permissions.map((perm) =>
              // Non-org member role can carry Organization.* perms, so route by perm name.
              perm.startsWith('Organization.')
                ? tPerms(
                    `${perm}.Label`,
                    perm === AssignSameRolePermission ? { creatorName: row.roleName } : undefined,
                  )
                : tGroups(`Label.${perm}`),
            );
            const roleUrl = row.isOrgRole
              ? row.roleId === undefined
                ? undefined
                : getCreatorHubRoleUrl?.(row.roleId.toString())
              : getLegacyRolesUrl?.(groupId.toString());
            const linkedOutRoleUrl = roleUrl && addModalSuppressionQueryParam(roleUrl);

            return (
              <TableRow key={row.key} className='flex flex-row min-width-0 max-width-full'>
                <TableCell className='flex flex-row items-center gap-small padding-medium min-width-0 [height:auto] [flex:1_1_0%]'>
                  <RoleIcon roleId={row.roleId} color={row.roleColor} size='Medium' />
                  <span className='min-width-0 text-body-medium content-default grow-1 text-truncate-end'>
                    {row.roleName}
                  </span>
                  {roleUrl && (
                    <IconButton
                      as='a'
                      variant='Utility'
                      size='Small'
                      href={linkedOutRoleUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='shrink-0'
                      icon='icon-regular-chain-link'
                      ariaLabel={row.roleName}
                    />
                  )}
                </TableCell>
                <TableCell className='flex flex-row items-center padding-medium min-width-0 [height:auto] [flex:2_1_0%]'>
                  <span className='text-body-medium content-default min-width-0 [overflow-wrap:anywhere]'>
                    {tGM('Description.PermissionsRemoved', {
                      permissions: translatedPermissions.join(', '),
                    })}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export { BreakingChangesTable };
