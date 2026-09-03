import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogBody, Button } from '@rbx/foundation-ui';
import type { GroupRolePermissions as ResolvedGroupRolePermissions } from '@rbx/group-management';
import { useQuery } from '@tanstack/react-query';
import { useSystemFeedback } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../../translation.config';
import groupsService from '../../services/groupsService';
import { Role } from '../../types';
import { useConfigurationMetadata } from '../../contexts/ConfigurationMetadataContext';
import { useCommunityProductFeatures } from '../../contexts/CommunityProductFeaturesContext';
import { isLockedOwnerRole } from '../../utils/communityOwnership';
import queryKeys from '../../services/queryKeys';
import RoleIcon from '../RoleIcon';

type Props = {
  groupId: number;
  onSelect: (role: Role) => void;
  onClose: () => void;
  hiddenRoleIds: number[];
  hideGuestRole: boolean;
  hideOwnerRole: boolean;
  isUnified: boolean;
  resolvedRolePermissions: ResolvedGroupRolePermissions;
} & WithTranslationsProps;

const RoleSelectDialog = ({
  groupId,
  onSelect,
  onClose,
  hiddenRoleIds,
  hideGuestRole,
  hideOwnerRole,
  isUnified,
  resolvedRolePermissions,
  translate
}: Props): JSX.Element => {
  const { systemFeedbackService } = useSystemFeedback();
  const [search, setSearch] = useState<string>('');
  const metadata = useConfigurationMetadata();
  const { features } = useCommunityProductFeatures();
  const { maxRank, minRank } = metadata.roleConfiguration;
  const isOwnerRolesetDeprecated = features.IsOwnerRolesetDeprecated;

  const { isLoading: areLegacyRolePermissionsLoading, data: groupRolePermissions } = useQuery({
    queryKey: queryKeys.getAllGroupRolePermissionsKey(groupId),
    queryFn: async () => {
      const response = await groupsService.getAllGroupRolePermissions(groupId);
      return response;
    },
    onError: () => systemFeedbackService.warning(translate('NetworkError')),
    enabled: !isUnified,
    retry: false,
    refetchOnWindowFocus: false
  });

  const { isLoading: areUnifiedRolesLoading, data: unifiedRoles } = useQuery({
    queryKey: queryKeys.getGroupRolesKey(groupId),
    queryFn: async () => groupsService.getGroupRoles({ groupId, includePrivate: true }),
    onError: () => systemFeedbackService.warning(translate('NetworkError')),
    enabled: isUnified,
    retry: false,
    refetchOnWindowFocus: false
  });

  const roles = useMemo(
    () =>
      isUnified
        ? (unifiedRoles ?? [])
            .filter(role => resolvedRolePermissions[role.id]?.canEditPermissions === true)
            .sort((firstRole, secondRole) => secondRole.rank - firstRole.rank)
        : groupRolePermissions?.map(rolePermissions => rolePermissions.role) ?? [],
    [groupRolePermissions, isUnified, resolvedRolePermissions, unifiedRoles]
  );

  const filteredRoles = useMemo(
    () =>
      roles.filter(
        role =>
          !hiddenRoleIds.find(hiddenRoleId => hiddenRoleId === role.id) &&
          !(hideGuestRole && role.rank === minRank) &&
          // `hideOwnerRole` only filters the *locked* rank-255 owner role; once
          // `IsOwnerRolesetDeprecated` is on, rank 255 is just another assignable role.
          !(hideOwnerRole && isLockedOwnerRole(role, maxRank, isOwnerRolesetDeprecated)) &&
          (search.length === 0 || role.name.toLowerCase().includes(search.toLowerCase()))
      ),
    [
      roles,
      hiddenRoleIds,
      search,
      minRank,
      maxRank,
      hideGuestRole,
      hideOwnerRole,
      isOwnerRolesetDeprecated
    ]
  );
  const isLoading = isUnified ? areUnifiedRolesLoading : areLegacyRolePermissionsLoading;

  return (
    <Dialog
      open
      onOpenChange={onClose}
      isModal
      size='Small'
      type='Default'
      hasCloseAffordance
      closeLabel={translate('Action.Close')}>
      <DialogContent>
        <DialogTitle className='role-select-dialog-title-bar-content'>
          {translate('Label.ChooseRole')}
        </DialogTitle>
        <DialogBody className='add-role-dialog'>
          <input
            className='form-control input-field'
            type='text'
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={translate('Label.Search')}
          />
          {isLoading ? (
            <div className='spinner spinner-default' />
          ) : (
            <div className='role-dialog-list-container'>
              <ul className='role-dialog-list'>
                {filteredRoles.length === 0
                  ? translate('Label.NoResults', { searchTerm: search })
                  : filteredRoles.map(role => (
                      <li key={role.id} className='role-dialog-list-item'>
                        <Button
                          key={role.name}
                          size='Small'
                          variant='Utility'
                          onClick={() => onSelect(role)}>
                          <div className='flex items-center'>
                            <RoleIcon role={role} size='Small' />
                            {role.name}
                          </div>
                        </Button>
                      </li>
                    ))}
              </ul>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default withTranslations(RoleSelectDialog, groupsConfig);
