import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Toggle } from '@rbx/foundation-ui';
import { groupsConfig } from '../translation.config';
import configureGroupUtils from '../utils/configureGroupUtils';
import { PermissionConfigurationState } from '../types';
import ConditionalTooltip from './ConditionalTooltip';

export type ConfigurePermissionsSectionProps = {
  isChannelPermissions: boolean;
  permissionsConfiguration: Record<string, PermissionConfigurationState>;
  togglePermission: (permissionName: string, value: boolean) => void;
} & WithTranslationsProps;

const ConfigureRolePermissionsSection = ({
  isChannelPermissions,
  permissionsConfiguration,
  togglePermission,
  translate
}: ConfigurePermissionsSectionProps): JSX.Element => {
  return (
    <div className='group-config-permissions-section'>
      {Object.entries(permissionsConfiguration).map(([key, { isEnabled, canEdit }]) => {
        const translationKey = configureGroupUtils.getTranslationKeyForPermission(
          key,
          isChannelPermissions
        );
        const isDisabled = canEdit !== undefined ? !canEdit : false;
        const tooltipId = `${key}-disabled-permission-tooltip`;
        return (
          translationKey && (
            <div className='group-config-permissions-section-row' key={key}>
              <ConditionalTooltip
                id={tooltipId}
                content={translate('Group.DisabledPermission.Info')}
                position='left-center'
                enabled={isDisabled}>
                <Toggle
                  isChecked={isEnabled}
                  isDisabled={isDisabled}
                  label={translate(translationKey)}
                  onCheckedChange={() => togglePermission(key, !isEnabled)}
                  size='Medium'
                  placement='End'
                  aria-describedby={isDisabled ? tooltipId : undefined}
                />
              </ConditionalTooltip>
            </div>
          )
        );
      })}
    </div>
  );
};

export default withTranslations(ConfigureRolePermissionsSection, groupsConfig);
