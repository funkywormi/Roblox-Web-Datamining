import type { Dispatch, FunctionComponent, SetStateAction } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import type { OnDragEndResponder, OnDragStartResponder } from '@hello-pangea/dnd';
import { Draggable } from '@hello-pangea/dnd';
import { Button } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import { Grid, makeStyles, CircularProgress } from '@rbx/ui';
import type { GroupRoleMetadata } from '../../clients/groups';
import TranslationNamespace from '../../constants/TranslationNamespace';
import useCurrentGroup from '../../hooks/useCurrentGroup';
import { useReorderRole } from '../../queries/rolesQueries';
import {
  DefaultMemberRoleIdNumber,
  DefaultRoleColor,
  GuestRoleRank,
  MaximumRoles,
} from '../../utils/constants';
import { OrganizationsEventName, logOrganizationsEvent } from '../../utils/eventUtils';
import { canUpdateRolePosition } from '../../utils/groupPermissions';
import type { RoleCreationMetadata } from '../../utils/types';
import RolesListDraggableContainer from './RolesListDraggableContainer';
import RolesListRole from './RolesListRole';

const isOrderableRole = (role: RoleCreationMetadata) =>
  role.metadata?.id !== DefaultMemberRoleIdNumber && role.metadata?.rank !== GuestRoleRank;

const useRolesSidebarStyles = makeStyles()((theme) => ({
  container: {
    [theme.breakpoints.down('Medium')]: {
      margin: '32px 0px',
    },
  },
  draggableContainer: {
    display: 'flex',
    width: '100%',
  },
  draggableTooltipWrapper: {
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: '100%',
  },
}));

export type RolesSidebarProps = {
  roles?: RoleCreationMetadata[];
  setRoles: Dispatch<SetStateAction<RoleCreationMetadata[] | undefined>>;
  selectedRole?: RoleCreationMetadata;
  onSelectedRole: (role: GroupRoleMetadata | null, autoSelectTab: boolean) => void;
  loading?: boolean;
  disabled?: boolean;
  isMobile?: boolean;
};

const RolesSidebar: FunctionComponent<React.PropsWithChildren<RolesSidebarProps>> = ({
  roles,
  setRoles,
  selectedRole,
  onSelectedRole,
  loading = false,
  disabled = false,
  isMobile = false,
}) => {
  const [activeDragRoleId, setActiveDragRoleId] = useState<string | null>(null);
  const { translateWithNamespace } = useTranslation();
  const { isOwner, organization, permissions, rolePermissions, unifiedLogger } = useCurrentGroup();
  const displayedRoles = useMemo(() => (roles ?? []).toReversed(), [roles]);
  const orderableDisplayedRoles = useMemo(
    () => displayedRoles.filter(isOrderableRole),
    [displayedRoles],
  );
  const nonOrderableDisplayedRoles = useMemo(
    () => displayedRoles.filter((role) => !isOrderableRole(role)),
    [displayedRoles],
  );

  const {
    classes: { container, buttonContainer, draggableContainer, draggableTooltipWrapper },
  } = useRolesSidebarStyles();

  const { mutate: reorderRole } = useReorderRole();

  const handleSelectRole = useCallback(
    (role: GroupRoleMetadata | null) => {
      onSelectedRole(role, !isMobile);
    },
    [onSelectedRole, isMobile],
  );

  const onDragEnd: OnDragEndResponder = useCallback(
    (result) => {
      setActiveDragRoleId(null);
      if (
        !result.destination ||
        roles === undefined ||
        result.destination.index === result.source.index
      ) {
        return;
      }
      const reorderedOrderableRoles = [...orderableDisplayedRoles];
      const [movedItem] = reorderedOrderableRoles.splice(result.source.index, 1);

      if (!movedItem.metadata?.id || !organization?.id) {
        return;
      }

      reorderedOrderableRoles.splice(result.destination.index, 0, movedItem);

      const nonOrderableRoles = roles.filter((r) => !isOrderableRole(r));
      const newRoles = [...nonOrderableRoles, ...reorderedOrderableRoles.toReversed()];

      const originalRoles = roles;
      setRoles(newRoles);

      const movedItemIndex = newRoles.findIndex(
        (role) => role.metadata?.id === movedItem.metadata?.id,
      );
      const previousRoleId = newRoles[movedItemIndex + 1]?.metadata?.id;
      const nextRoleId = newRoles[movedItemIndex - 1]?.metadata?.id;

      reorderRole(
        {
          groupId: Number(organization.groupId),
          roleId: movedItem.metadata?.id,
          previousRoleId,
          nextRoleId: nextRoleId === DefaultMemberRoleIdNumber ? undefined : nextRoleId,
        },
        { onError: () => setRoles(originalRoles) },
      );
    },
    [roles, orderableDisplayedRoles, setRoles, organization, reorderRole],
  );

  const onDragStart: OnDragStartResponder = useCallback((start) => {
    setActiveDragRoleId(start.draggableId);
  }, []);

  return (
    <Grid
      item
      direction='column'
      alignContent='flex-start'
      className={container}
      data-testid='roles-sidebar'>
      {loading || roles === undefined ? (
        <Grid container justifyContent='center'>
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container className={buttonContainer} gap={1}>
          <div className='width-full'>
            <span className={draggableTooltipWrapper}>
              <RolesListDraggableContainer
                droppableId='rolesList'
                onDragEnd={onDragEnd}
                onDragStart={onDragStart}>
                {orderableDisplayedRoles.map((role, index) => {
                  const { metadata: roleMetadata, isNewRole } = role;
                  if (!roleMetadata?.name || !roleMetadata.id || isNewRole === undefined) {
                    return null;
                  }

                  return !(
                    isOwner || canUpdateRolePosition(rolePermissions?.[roleMetadata.id.toString()])
                  ) ? (
                    <RolesListRole
                      key={roleMetadata.id}
                      roleId={roleMetadata.id?.toString() ?? ''}
                      roleRank={roleMetadata.rank}
                      roleName={roleMetadata.name ?? ''}
                      roleColor={roleMetadata.color ?? DefaultRoleColor}
                      isPrivate={roleMetadata.isPrivate}
                      isNewRole={isNewRole}
                      disabled={disabled}
                      isSelected={selectedRole?.metadata?.id === roleMetadata.id}
                      isMobile={isMobile}
                      onClickRole={() => handleSelectRole(roleMetadata)}
                    />
                  ) : (
                    <Draggable
                      key={roleMetadata.id}
                      draggableId={roleMetadata.id.toString()}
                      index={index}
                      disableInteractiveElementBlocking>
                      {(provided, snapshot) => (
                        <div
                          className={draggableContainer}
                          ref={provided.innerRef}
                          {...provided.draggableProps}>
                          <RolesListRole
                            key={roleMetadata.id}
                            roleId={roleMetadata.id?.toString() ?? ''}
                            roleRank={roleMetadata.rank}
                            roleName={roleMetadata.name ?? ''}
                            roleColor={roleMetadata.color ?? DefaultRoleColor}
                            isPrivate={roleMetadata.isPrivate}
                            isNewRole={isNewRole}
                            disabled={disabled}
                            isSelected={selectedRole?.metadata?.id === roleMetadata.id}
                            isMobile={isMobile}
                            isDragging={snapshot.isDragging}
                            isAnyRoleDragging={activeDragRoleId !== null}
                            onClickRole={() => handleSelectRole(roleMetadata)}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
              </RolesListDraggableContainer>
            </span>

            {nonOrderableDisplayedRoles.map(({ metadata: role, isNewRole }) => {
              if (!role?.name || !role.id || isNewRole === undefined) {
                return null;
              }

              return (
                <RolesListRole
                  key={role.id}
                  roleId={role.id?.toString() ?? ''}
                  roleRank={role.rank}
                  roleName={role.name}
                  roleColor={role.color ?? DefaultRoleColor}
                  isPrivate={role.isPrivate}
                  isNewRole={isNewRole}
                  disabled={disabled}
                  isSelected={selectedRole?.metadata?.id === role.id}
                  isMobile={isMobile}
                  onClickRole={() => handleSelectRole(role)}
                />
              );
            })}
          </div>

          {(isOwner === true || permissions?.canCreateRoles === true) && (
            <Button
              variant='Standard'
              size='Medium'
              className='grow-1'
              onClick={() => {
                handleSelectRole(null);
                logOrganizationsEvent(unifiedLogger, OrganizationsEventName.ClickOrgsCreateRole, {
                  group_id: organization?.groupId ?? '',
                });
              }}
              isDisabled={disabled || (roles ?? []).length >= MaximumRoles}>
              {translateWithNamespace(TranslationNamespace.Groups, 'Action.CreateRole')}
            </Button>
          )}
        </Grid>
      )}
    </Grid>
  );
};

export default RolesSidebar;
