import type { FunctionComponent, ReactNode } from 'react';
import React, { useCallback } from 'react';
import { Toggle } from '@rbx/foundation-ui';
import { Tooltip } from '@rbx/ui';
import { usePermissionsTranslation } from '../providers/TranslationProvider';

const TOOLTIP_LEAVE_TOUCH_DELAY_MS = 3000;

export type PermissionProps = {
  permissionId: string;
  isGranted: boolean;
  canEdit: boolean;
  isInherited: boolean;
  localInheritance?: string;
  onChange: (permissionId: string, isGranted: boolean) => void;
};

const Permission: FunctionComponent<PermissionProps> = ({
  permissionId,
  isGranted,
  isInherited,
  localInheritance,
  canEdit,
  onChange,
}) => {
  const { translate } = usePermissionsTranslation();

  const handleToggleChange = useCallback(
    (isChecked: boolean) => {
      onChange(permissionId, isChecked);
    },
    [onChange, permissionId],
  );

  const isDisabled = !canEdit;
  const isLocallyInherited = !!localInheritance;

  const labelNode = translate(`${permissionId}.Label`);
  const labelString = typeof labelNode === 'string' ? labelNode : undefined;

  const subtextNode = translate(`${permissionId}.Subtext`);
  const subtextString = typeof subtextNode === 'string' ? subtextNode : undefined;

  let tooltipText: ReactNode | undefined;
  if (isDisabled) {
    tooltipText = translate('DisabledPermission.Info');
  } else if (isInherited) {
    tooltipText = translate('InheritedPermission.Info');
  } else if (isLocallyInherited) {
    tooltipText = translate('LocallyInheritedPermission.Info', [], {
      localInheritance: translate(`${localInheritance}.Label`),
    });
  }

  if (!labelString) {
    return null;
  }

  const toggle = (
    <Toggle
      isChecked={isGranted || isInherited || isLocallyInherited}
      isDisabled={isDisabled || isInherited || isLocallyInherited}
      placement='Start'
      size='Medium'
      label={labelString}
      hint={subtextString}
      onCheckedChange={handleToggleChange}
    />
  );

  // Keep the tooltip wrapper mounted always (empty title = no tooltip); swapping between a bare
  // and wrapped toggle remounts it and skips the on/off animation when it flips to inherited.
  return (
    <Tooltip
      arrow
      title={tooltipText ?? ''}
      placement='left'
      enterTouchDelay={0}
      leaveTouchDelay={TOOLTIP_LEAVE_TOUCH_DELAY_MS}>
      <span>{toggle}</span>
    </Tooltip>
  );
};

export { Permission };
