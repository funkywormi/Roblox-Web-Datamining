import React from 'react';
import { Icon } from '@rbx/foundation-ui';

type Props = {
  translate: (key: string) => string;
};

const ForumRolesEmptyStateComponent = ({ translate }: Props): JSX.Element => {
  return (
    <div className='group-forums-roles-empty-state' data-testid='forums-roles-empty-state'>
      <div className='group-forums-roles-empty-state-icon-wrapper'>
        <div className='group-forums-roles-empty-state-icon-box' />
        <div className='group-forums-roles-empty-state-icon'>
          <Icon name='icon-regular-person-plus' size='XLarge' />
        </div>
      </div>
      <div className='group-forums-roles-empty-state-text'>
        <div className='text-label-large'>{translate('Header.AddRoles')}</div>
        <div className='text-body-medium text-secondary'>{translate('Description.AddRoles')}</div>
      </div>
    </div>
  );
};

export default ForumRolesEmptyStateComponent;
