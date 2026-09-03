import React from 'react';
import { Toggle } from '@rbx/foundation-ui';

export interface GroupSecuritySettingsToggleProps {
  featureName: string;
  label: string;
  description?: string;
  isOn: boolean;
  isDisabled?: boolean;
  onToggle: (newValue: boolean) => void;
}

const GroupSecuritySettingsToggle: React.FC<GroupSecuritySettingsToggleProps> = ({
  featureName,
  label,
  description,
  isOn,
  isDisabled = false,
  onToggle
}) => {
  const descriptionId = `${featureName}-description`;

  return (
    <div className='group-security-settings-toggle-item'>
      <Toggle
        label={label}
        size='Medium'
        placement='End'
        isChecked={isOn}
        isDisabled={isDisabled}
        onCheckedChange={onToggle}
        aria-describedby={description ? descriptionId : undefined}
        data-testid={featureName}
      />
      {description && (
        <p id={descriptionId} className={`text-body-medium ${featureName}-description`}>
          {description}
        </p>
      )}
    </div>
  );
};

export default GroupSecuritySettingsToggle;
