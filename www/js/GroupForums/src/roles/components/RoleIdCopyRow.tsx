import type { FunctionComponent } from 'react';
import React, { useCallback } from 'react';
import { useTranslation } from '@rbx/intl';
import { FileCopyOutlinedIcon, Grid, IconButton, Tooltip } from '@rbx/ui';
import TranslationNamespace from '../../constants/TranslationNamespace';
import useCurrentGroup from '../../hooks/useCurrentGroup';

export type RoleIdCopyRowProps = {
  roleId: number;
};

/**
 * Shows the role's id with a button to copy it to the clipboard, so developers can use it with the
 * in-engine group APIs without opening the network console. Rendered on the role Permissions and
 * Settings tabs.
 */
const RoleIdCopyRow: FunctionComponent<RoleIdCopyRowProps> = ({ roleId }) => {
  const { translateWithNamespace } = useTranslation();
  const { showToast } = useCurrentGroup();

  const copyRoleIdLabel = translateWithNamespace(
    TranslationNamespace.GroupManagement,
    'Action.CopyRoleId',
  );

  const handleCopyRoleId = useCallback(() => {
    void navigator.clipboard.writeText(roleId.toString()).then(() => {
      showToast(
        translateWithNamespace(TranslationNamespace.GroupManagement, 'Message.RoleIdCopied'),
      );
    });
  }, [roleId, showToast, translateWithNamespace]);

  return (
    <Grid container item XSmall={12} alignItems='center' gap={1}>
      <span className='text-caption-medium content-emphasis'>
        {translateWithNamespace(TranslationNamespace.GroupManagement, 'Label.RoleId')}: {roleId}
      </span>
      <Tooltip title={copyRoleIdLabel}>
        <IconButton
          aria-label={copyRoleIdLabel}
          size='small'
          color='default'
          onClick={handleCopyRoleId}>
          <FileCopyOutlinedIcon fontSize='small' />
        </IconButton>
      </Tooltip>
    </Grid>
  );
};

export default RoleIdCopyRow;
