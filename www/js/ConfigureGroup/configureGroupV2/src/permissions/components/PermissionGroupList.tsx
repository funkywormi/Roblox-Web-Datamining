import type { FunctionComponent } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { Chip } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import { Alert, Button, CircularProgress, Grid, makeStyles, StickyFooter } from '@rbx/ui';
import ErrorState from '../../components/ErrorState';
import TranslationNamespace from '../../constants/TranslationNamespace';
import useCurrentGroup from '../../hooks/useCurrentGroup';
import { useGetGroupInfo } from '../../queries';
import { useGetGroupProductFeatures } from '../../queries/rolesQueries';
import { GroupManagementSurface } from '../../utils/types';
import usePermissions from '../hooks/usePermissions';
import { usePermissionsTranslation } from '../providers/TranslationProvider';
import { usePermissionsUiConfig } from '../providers/UIConfigProvider';
import {
  canPermissionChange,
  computeEffectiveGrants,
  deriveExplicitGrants,
  findUpdatedPermissions,
} from '../utils/permission';
import {
  ORDERED_PERMISSION_TABS_COMMUNITY,
  ORDERED_PERMISSION_TABS_CREATION,
  PERMISSION_TAB_GROUP_IDS,
  PermissionTab,
} from '../utils/tabConfig';
import type { CreatorDetails, EntityDetails, PermissionRequest } from '../utils/types';
import { CreatorTypes, EntityTypes } from '../utils/types';
import { PermissionGroup } from './PermissionGroup';
import { SaveConfirmationDialog } from './SaveConfirmationDialog';

export type PermissionGroupListProps = {
  entity?: EntityDetails;
  creator?: CreatorDetails;
  selectedTab?: PermissionTab;
  onSelectedTabChange?: (tab: PermissionTab) => void;
};

const FORUM_BUG_REPORTER_PERMISSION_ID = 'Group.ForumBugReporter';
const UNIVERSE_TICKET_REVIEWER_PERMISSION_ID = 'Universe.TicketReviewer';
const GUEST_ROLE_PERMISSION_ID = 'Group.AnnouncementViewer';

const usePermissionsContainerStyles = makeStyles()((theme) => ({
  rootClass: {
    display: 'grid',
    gap: theme.spacing(2),
  },
  footerButton: {
    margin: `0 ${theme.spacing(1)} 0 0`,
  },
  stickyFooter: {
    paddingLeft: 0,
    paddingRight: 0,
    '&&': {
      backgroundColor: theme.palette.surface[0],
      backdropFilter: 'none',
    },
    '&& > div': {
      flexDirection: 'row',
    },
    '&& button': {
      width: 'auto',
    },
  },
}));

const PermissionGroupList: FunctionComponent<PermissionGroupListProps> = ({
  creator,
  entity,
  selectedTab,
  onSelectedTabChange,
}) => {
  const {
    classes: { rootClass, footerButton, stickyFooter },
  } = usePermissionsContainerStyles();
  const { showConfirmationOnSave, showUniverseTicketReviewerPermission } = usePermissionsUiConfig();
  const { translate, displayMessage } = usePermissionsTranslation();
  const { translateWithNamespace } = useTranslation();
  const { organization, surface, isOrganizationLoading } = useCurrentGroup();

  const {
    isPending,
    isError,
    isSaving,
    metadata,
    permissionData: initialPermissions,
    savePermissions,
    refetch: refetchPermissions,
  } = usePermissions(creator, entity);

  const isGroupEntity = entity?.type === EntityTypes.GROUP;
  const { data: productFeatures } = useGetGroupProductFeatures(
    isGroupEntity && organization?.groupId ? Number(organization.groupId) : undefined,
  );
  // Missing data during loading or failure hides only the gated permission. Cached data remains
  // usable after a background refresh failure.
  const showForumBugReporterPermission =
    isGroupEntity && productFeatures?.forumsAttachmentsCreate === true;
  const showMemberCount = isGroupEntity && creator?.type === CreatorTypes.MEMBER_ROLE;
  const groupInfoQuery = useGetGroupInfo(showMemberCount ? organization?.groupId : undefined);
  const memberCount = showMemberCount ? (groupInfoQuery.data?.memberCount ?? 0) : undefined;

  // The user's explicit grant intent is the source of truth; the effective grant map is derived
  // from it. Tracking intent directly (rather than inferring it from the effective map on each
  // toggle) keeps an explicitly-granted child intact when a parent is toggled on then back off.
  const [explicitGrants, setExplicitGrants] = useState<Set<string>>(() =>
    initialPermissions ? deriveExplicitGrants(initialPermissions, metadata) : new Set(),
  );
  const [trackedInitialPermissions, setTrackedInitialPermissions] = useState(initialPermissions);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [internalSelectedTab, setInternalSelectedTab] = useState<PermissionTab>(
    PermissionTab.GENERAL,
  );
  const activeTab = selectedTab ?? internalSelectedTab;
  const isGuestRole = creator?.type === CreatorTypes.GUEST_ROLE;
  const isReadOnly = creator?.disabled === true;

  if (trackedInitialPermissions !== initialPermissions && initialPermissions != null) {
    setTrackedInitialPermissions(initialPermissions);
    setExplicitGrants(deriveExplicitGrants(initialPermissions, metadata));
  }

  const permissionData = useMemo(
    () =>
      initialPermissions
        ? computeEffectiveGrants(explicitGrants, metadata, Object.keys(initialPermissions))
        : undefined,
    [explicitGrants, metadata, initialPermissions],
  );

  const visibleMetadata = useMemo(() => {
    const featureFilteredMetadata = (metadata ?? [])
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (permission) =>
            (permission.permissionId !== FORUM_BUG_REPORTER_PERMISSION_ID ||
              showForumBugReporterPermission) &&
            (permission.permissionId !== UNIVERSE_TICKET_REVIEWER_PERMISSION_ID ||
              showUniverseTicketReviewerPermission === true),
        ),
      }))
      .filter((group) => group.permissions.length > 0);

    return isGuestRole
      ? featureFilteredMetadata
          .map((group) => ({
            ...group,
            permissions: group.permissions.filter(
              (permission) => permission.permissionId === GUEST_ROLE_PERMISSION_ID,
            ),
          }))
          .filter((group) => group.permissions.length > 0)
      : featureFilteredMetadata;
  }, [isGuestRole, metadata, showForumBugReporterPermission, showUniverseTicketReviewerPermission]);

  const onPermissionChange = useCallback((permissionId: string, isGranted: boolean) => {
    setExplicitGrants((prev) => {
      const next = new Set(prev);
      if (isGranted) {
        next.add(permissionId);
      } else {
        next.delete(permissionId);
      }
      return next;
    });
  }, []);

  const persistPermissions = useCallback(
    (permissionRequest: Record<string, PermissionRequest>) => {
      try {
        savePermissions(permissionRequest);
      } catch {
        displayMessage(translate('Messages.ErrorSavingPermissions'), true);
      }
    },
    [savePermissions, displayMessage, translate],
  );

  const maybePromptAndPersist = useCallback(() => {
    if (!permissionData) {
      displayMessage(translate('Messages.ErrorSavingPermissions'), true);
      return;
    }
    if (showConfirmationOnSave) {
      setShowSaveConfirmation(true);
    } else {
      persistPermissions(permissionData);
    }
  }, [
    displayMessage,
    translate,
    showConfirmationOnSave,
    setShowSaveConfirmation,
    persistPermissions,
    permissionData,
  ]);

  const discardUnsavedChanges = useCallback(() => {
    setExplicitGrants(
      initialPermissions ? deriveExplicitGrants(initialPermissions, metadata) : new Set(),
    );
  }, [initialPermissions, metadata]);

  const closeDialogAndDiscardUnsavedChanges = useCallback(() => {
    setShowSaveConfirmation(false);
    discardUnsavedChanges();
  }, [setShowSaveConfirmation, discardUnsavedChanges]);

  const closeDialogAndPersist = useCallback(() => {
    if (!permissionData) {
      displayMessage(translate('Messages.ErrorSavingPermissions'), true);
      return;
    }
    setShowSaveConfirmation(false);
    persistPermissions(permissionData);
  }, [setShowSaveConfirmation, persistPermissions, permissionData, displayMessage, translate]);

  if (isError) {
    return <ErrorState onRetry={refetchPermissions} />;
  }

  if (
    isPending ||
    isOrganizationLoading ||
    !entity ||
    !creator ||
    !metadata ||
    !initialPermissions ||
    !permissionData
  ) {
    return (
      <Grid container justifyContent='center' mt={10}>
        <CircularProgress />
      </Grid>
    );
  }

  const isAnyEditable =
    !isReadOnly &&
    visibleMetadata.some((group) =>
      group.permissions.some((permission) => {
        const initialPermission = initialPermissions[permission.permissionId];
        return initialPermission ? canPermissionChange(initialPermission) : false;
      }),
    );
  const { selected, unselected } = findUpdatedPermissions(initialPermissions, permissionData);

  let info;
  if (entity?.type === EntityTypes.GROUP && creator.type === CreatorTypes.MEMBER_ROLE) {
    info = memberCount
      ? translate(`PermissionGroup.${creator.type}.Info`, [], {
          numMembers: String(memberCount),
        })
      : null;
  } else {
    info = translate(`PermissionGroup.${creator.type}.Info`);
  }
  const cancelActionLabel = translate('Action.Cancel');
  const saveActionLabel = translate('Action.Save');

  const showTabChips = isGroupEntity && !isGuestRole;

  const filteredMetadata = showTabChips
    ? visibleMetadata.filter((group) => PERMISSION_TAB_GROUP_IDS[activeTab].has(group.groupId))
    : visibleMetadata;

  return (
    <Grid className={rootClass} data-testid='permission-group-list'>
      {info && (
        <Alert severity='info' variant='standard'>
          {info}
        </Alert>
      )}

      {showTabChips && (
        <Grid container justifyContent='left'>
          {(surface === GroupManagementSurface.Community
            ? ORDERED_PERMISSION_TABS_COMMUNITY
            : ORDERED_PERMISSION_TABS_CREATION
          ).map((tab) => (
            <Grid pr={1} key={tab}>
              <Chip
                isChecked={activeTab === tab}
                text={translateWithNamespace(
                  TranslationNamespace.GroupManagement,
                  `Group.Chip.${tab}.Label`,
                )}
                onCheckedChange={() => {
                  setInternalSelectedTab(tab);
                  onSelectedTabChange?.(tab);
                }}
                size='Medium'
                variant='Standard'
                data-testid={`permission-tab-chip-${tab}`}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ul className='flex flex-col [gap:12px]' style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filteredMetadata.map((permissionGroup) => (
          <PermissionGroup
            key={permissionGroup.groupId}
            metadata={permissionGroup}
            initialSelections={initialPermissions}
            currentSelections={permissionData}
            isReadOnly={isReadOnly}
            onPermissionChange={onPermissionChange}
          />
        ))}
      </ul>
      {isAnyEditable && (
        <StickyFooter
          classes={{ root: stickyFooter }}
          primary={{
            variant: 'outlined',
            size: 'medium',
            color: 'primary',
            onClick: discardUnsavedChanges,
            disabled: isPending || isSaving || (selected.length === 0 && unselected.length === 0),
            label: typeof cancelActionLabel === 'string' ? cancelActionLabel : '',
          }}
          secondary={{
            variant: 'contained',
            size: 'medium',
            loading: isPending || isSaving,
            disabled: selected.length === 0 && unselected.length === 0,
            onClick: maybePromptAndPersist,
            label: typeof saveActionLabel === 'string' ? saveActionLabel : '',
          }}
        />
      )}
      {isAnyEditable && (
        <Grid container>
          <Button
            data-testid='permission-save-button'
            variant='contained'
            size='medium'
            loading={isPending || isSaving}
            disabled={selected.length === 0 && unselected.length === 0}
            onClick={maybePromptAndPersist}
            className={footerButton}>
            {saveActionLabel}
          </Button>
          <Button
            data-testid='permission-cancel-button'
            variant='outlined'
            color='primary'
            size='medium'
            disabled={isPending || isSaving || (selected.length === 0 && unselected.length === 0)}
            onClick={discardUnsavedChanges}
            className={footerButton}>
            {cancelActionLabel}
          </Button>
        </Grid>
      )}
      {showConfirmationOnSave && (
        <SaveConfirmationDialog
          isOpen={showSaveConfirmation}
          grantedList={selected}
          revokedList={unselected}
          onCancel={closeDialogAndDiscardUnsavedChanges}
          onConfirm={closeDialogAndPersist}
        />
      )}
    </Grid>
  );
};

export { PermissionGroupList };
