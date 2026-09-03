import React, { useCallback, useState, useMemo } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import {
  IconButton,
  Menu,
  MenuItem,
  MenuSection,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@rbx/foundation-ui';
import '../../../../css/tailwind.css';
import { CurrentUser } from 'Roblox';
import type { GroupRolePermissions as ResolvedGroupRolePermissions } from '@rbx/group-management';
import { groupsConfig } from '../translation.config';
import { Group } from '../../shared/types';
import { ForumCategory } from '../types';
import CreateOrUpdateForumCategoryDialog from './dialogs/CreateOrUpdateForumCategoryDialog';
import DeleteForumCategoryDialog from './dialogs/DeleteForumCategoryDialog';
import ArchiveForumCategoryDialog from './dialogs/ArchiveForumCategoryDialog';
import GroupForumsCategoryConfigSectionExpanded from './GroupForumsCategoryConfigSectionExpanded';
import DraggableItem from '../../shared/components/DraggableItem';

export type GroupForumsCategoryConfigSectionProps = {
  group: Group;
  forumCategory: ForumCategory;
  refetchForumCategories: () => Promise<void>;
  isDeleteDisabled?: boolean;
  isArchiveDisabled?: boolean;
  displayPermissionsConfig: boolean;
  canManageCategory: boolean;
  canManageRolePermissions: boolean;
  isUnified: boolean;
  resolvedRolePermissions: ResolvedGroupRolePermissions;
} & WithTranslationsProps;

const GroupForumsCategoryConfigSection = ({
  group,
  forumCategory,
  refetchForumCategories,
  isDeleteDisabled = false,
  isArchiveDisabled = false,
  displayPermissionsConfig = false,
  canManageCategory,
  canManageRolePermissions,
  isUnified,
  resolvedRolePermissions,
  translate
}: GroupForumsCategoryConfigSectionProps): JSX.Element | null => {
  const [isRenameForumCategoryDialogVisible, setIsRenameForumCategoryDialogVisible] = useState(
    false
  );
  const [isDeleteForumCategoryDialogVisible, setIsDeleteForumCategoryDialogVisible] = useState(
    false
  );
  const [isArchiveForumCategoryDialogVisible, setIsArchiveForumCategoryDialogVisible] = useState(
    false
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isArchived = useMemo(() => {
    return forumCategory.archivedBy != null;
  }, [forumCategory.archivedBy]);

  const canEditPermissions = useMemo(
    () =>
      displayPermissionsConfig &&
      (isUnified
        ? canManageRolePermissions
        : !isArchived && group.owner?.userId === Number(CurrentUser.userId)),
    [canManageRolePermissions, displayPermissionsConfig, group, isArchived, isUnified]
  );

  const showRenameButton = useMemo(() => {
    return !isArchived;
  }, [isArchived]);

  const showArchiveButton = useMemo(() => {
    return !isArchiveDisabled;
  }, [isArchiveDisabled]);

  const showDeleteButton = useMemo(() => {
    return !isDeleteDisabled;
  }, [isDeleteDisabled]);

  const showRenameForumCategoryDialog = useCallback(() => {
    setIsRenameForumCategoryDialogVisible(true);
  }, [setIsRenameForumCategoryDialogVisible]);

  const hideRenameForumCategoryDialog = useCallback(() => {
    setIsRenameForumCategoryDialogVisible(false);
  }, [setIsRenameForumCategoryDialogVisible]);

  const showDeleteForumCategoryDialog = useCallback(() => {
    setIsDeleteForumCategoryDialogVisible(true);
  }, [setIsDeleteForumCategoryDialogVisible]);

  const hideDeleteForumCategoryDialog = useCallback(() => {
    setIsDeleteForumCategoryDialogVisible(false);
  }, [setIsDeleteForumCategoryDialogVisible]);

  const showArchiveForumCategoryDialog = useCallback(() => {
    setIsArchiveForumCategoryDialogVisible(true);
  }, [setIsArchiveForumCategoryDialogVisible]);

  const hideArchiveForumCategoryDialog = useCallback(() => {
    setIsArchiveForumCategoryDialogVisible(false);
  }, [setIsArchiveForumCategoryDialogVisible]);

  const toggleIsExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded, setIsExpanded]);

  const selectMenuItem = useCallback((action: () => void) => {
    setIsMenuOpen(false);
    action();
  }, []);

  return (
    <React.Fragment>
      {isRenameForumCategoryDialogVisible && (
        <CreateOrUpdateForumCategoryDialog
          groupId={group.id}
          forumCategory={forumCategory}
          onSuccess={refetchForumCategories}
          onClose={hideRenameForumCategoryDialog}
        />
      )}
      {isDeleteForumCategoryDialogVisible && (
        <DeleteForumCategoryDialog
          groupId={group.id}
          forumCategory={forumCategory}
          onSuccess={refetchForumCategories}
          onClose={hideDeleteForumCategoryDialog}
        />
      )}
      {isArchiveForumCategoryDialogVisible && (
        <ArchiveForumCategoryDialog
          groupId={group.id}
          forumCategory={forumCategory}
          onSuccess={refetchForumCategories}
          onClose={hideArchiveForumCategoryDialog}
        />
      )}
      <div className='group-forums-config-category border-bottom'>
        <div
          className={`group-forums-config-category-header ${
            isArchived ? 'archived-category' : 'unarchived-category'
          }`}>
          <DraggableItem className='group-forums-config-category-name font-bold'>
            {forumCategory.name}
          </DraggableItem>
          <div className='group-forums-config-category-icons'>
            {canManageCategory && (
              <Popover open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <PopoverTrigger asChild>
                  <IconButton
                    icon='icon-filled-three-dots-horizontal'
                    variant='Utility'
                    size='Small'
                    ariaLabel={translate('Action.More')}
                  />
                </PopoverTrigger>
                <PopoverContent
                  ariaLabel={translate('Label.OverflowMenu')}
                  side='bottom'
                  align='end'>
                  <Menu className='group-forums-config-dropdown-menu' size='Medium'>
                    <MenuSection>
                      {showRenameButton && (
                        <MenuItem
                          value='rename'
                          title={translate('Action.RenameForumCategory')}
                          onSelect={() => selectMenuItem(showRenameForumCategoryDialog)}
                        />
                      )}
                      {showArchiveButton && (
                        <MenuItem
                          value='archive'
                          title={translate(
                            isArchived
                              ? 'Action.UnarchiveForumCategory'
                              : 'Action.ArchiveForumCategory'
                          )}
                          onSelect={() => selectMenuItem(showArchiveForumCategoryDialog)}
                        />
                      )}
                      {showDeleteButton && (
                        <MenuItem
                          value='delete'
                          title={translate('Action.DeleteForumCategory')}
                          onSelect={() => selectMenuItem(showDeleteForumCategoryDialog)}
                        />
                      )}
                    </MenuSection>
                  </Menu>
                </PopoverContent>
              </Popover>
            )}
            {canEditPermissions && (
              <IconButton
                as='button'
                icon={
                  isExpanded ? 'icon-filled-chevron-large-up' : 'icon-filled-chevron-large-down'
                }
                variant='Utility'
                size='Small'
                ariaLabel={translate('Action.More')}
                onClick={toggleIsExpanded}
              />
            )}
          </div>
        </div>
        {isExpanded && (
          <GroupForumsCategoryConfigSectionExpanded
            group={group}
            forumCategory={forumCategory}
            refetchForumCategories={refetchForumCategories}
            canManageCategory={canManageCategory}
            isUnified={isUnified}
            resolvedRolePermissions={resolvedRolePermissions}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default withTranslations(GroupForumsCategoryConfigSection, groupsConfig);
