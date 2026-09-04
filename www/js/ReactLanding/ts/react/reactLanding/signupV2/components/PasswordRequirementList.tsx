import React from 'react';
import { Icon } from '@rbx/foundation-ui';
import { PasswordRequirementId } from '../utils/passwordRequirementUtils';

export type PasswordRequirementItem = {
  id: PasswordRequirementId;
  label: string;
  isMet: boolean;
};

export type PasswordRequirementListProps = {
  id?: string;
  requirements: PasswordRequirementItem[];
  // An unmet requirement only reads as an error once there is a password to judge
  hasEnteredPassword: boolean;
};

const PasswordRequirementList = ({
  id,
  requirements,
  hasEnteredPassword
}: PasswordRequirementListProps): JSX.Element => (
  <div
    id={id}
    className='flex width-full flex-col gap-xxsmall'
    data-testid='password-requirement-list'>
    {requirements.map(({ id: requirementId, label, isMet }) => (
      <span
        key={requirementId}
        role='checkbox'
        aria-checked={hasEnteredPassword ? isMet : 'mixed'}
        aria-disabled
        className={`flex items-center gap-xxsmall text-caption-medium ${
          hasEnteredPassword && !isMet ? 'content-system-alert' : 'content-muted'
        }`}
        data-testid={`password-requirement-${requirementId}`}
        data-met={isMet}>
        {/* The mark stays in the layout so the rules do not shift sideways the
            moment the first character lands. */}
        <Icon
          name={isMet ? 'icon-regular-check' : 'icon-regular-x'}
          size='XSmall'
          className={hasEnteredPassword ? undefined : 'invisible'}
        />
        {label}
      </span>
    ))}
  </div>
);

export default PasswordRequirementList;
