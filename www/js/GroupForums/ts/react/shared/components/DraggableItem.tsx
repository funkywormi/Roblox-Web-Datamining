import React from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { IconButton } from '@rbx/foundation-ui';
import { groupsConfig } from '../translation.config';
import { useDraggableList } from './DraggableList';

export type DraggableItemProps = {
  className: string;
  children: React.ReactNode;
} & WithTranslationsProps;

const DraggableItem = ({ className, children, translate }: DraggableItemProps): JSX.Element => {
  const draggableList = useDraggableList();
  return (
    <div className={className}>
      {draggableList?.enabled && (
        <IconButton
          ariaLabel={translate('Action.Move')}
          as='button'
          variant='Utility'
          className='drag-icon'
          icon='icon-filled-three-bars-horizontal-triangles-vertical'
          size='Small'
        />
      )}
      {children}
    </div>
  );
};

export default withTranslations(DraggableItem, groupsConfig);
