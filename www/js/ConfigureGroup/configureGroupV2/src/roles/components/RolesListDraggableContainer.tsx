import type { PropsWithChildren, FC } from 'react';
import React from 'react';
import type {
  DroppableProvided,
  OnDragEndResponder,
  OnDragStartResponder,
} from '@hello-pangea/dnd';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

type TRolesListDraggableContainerProps = {
  onDragEnd: OnDragEndResponder;
  onDragStart?: OnDragStartResponder;
  droppableId: string;
};

const RolesListDraggableContainer: FC<PropsWithChildren<TRolesListDraggableContainerProps>> = ({
  onDragEnd,
  onDragStart,
  droppableId,
  children,
}) => {
  return (
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <Droppable droppableId={droppableId}>
        {(provided: DroppableProvided) => (
          <div
            style={{ maxWidth: '100%', width: '100%' }}
            ref={provided.innerRef}
            {...provided.droppableProps}>
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default RolesListDraggableContainer;
