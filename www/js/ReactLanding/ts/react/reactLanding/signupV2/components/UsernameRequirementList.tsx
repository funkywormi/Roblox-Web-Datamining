import React from 'react';
import { Icon } from '@rbx/foundation-ui';
import { UsernameRequirementId } from '../utils/usernameRequirementUtils';

export type UsernameRequirementItem = {
  id: UsernameRequirementId;
  label: string;
  isMet?: boolean;
};

export type UsernameRequirementListProps = {
  id?: string;
  requirements: UsernameRequirementItem[];
  hasEnteredUsername: boolean;
};

const UsernameRequirementList = ({
  id,
  requirements,
  hasEnteredUsername
}: UsernameRequirementListProps): JSX.Element => (
  <div
    id={id}
    className='flex width-full flex-col gap-xxsmall'
    data-testid='username-requirement-list'>
    {requirements.map(({ id: requirementId, label, isMet }) => {
      const isEvaluated = hasEnteredUsername && isMet !== undefined;
      return (
        <span
          key={requirementId}
          role='checkbox'
          aria-checked={isEvaluated ? isMet : 'mixed'}
          aria-disabled
          className={`flex items-center gap-xxsmall text-caption-medium ${
            isEvaluated && !isMet ? 'content-system-alert' : 'content-muted'
          }`}
          data-testid={`username-requirement-${requirementId}`}
          data-met={isMet}>
          <Icon
            name={isMet ? 'icon-regular-check' : 'icon-regular-x'}
            size='XSmall'
            className={isEvaluated ? undefined : 'invisible'}
          />
          {label}
        </span>
      );
    })}
  </div>
);

export default UsernameRequirementList;
