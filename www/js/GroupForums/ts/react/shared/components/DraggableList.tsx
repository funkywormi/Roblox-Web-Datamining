import React, { useCallback, useState, useContext, createContext } from 'react';

type DraggableListContextState = {
  enabled: boolean;
};

export const DraggableListContext = createContext<DraggableListContextState | undefined>(undefined);

export const useDraggableList = (): DraggableListContextState | null => {
  const resource = useContext(DraggableListContext);
  if (!resource) {
    return null;
  }
  return resource;
};

export type DraggableListProps<T> = {
  enabled: boolean;
  items: T[];
  getItemId: (item: T) => string;
  handleItemsOrderChange: (items: T[]) => void;
  renderItem: (item: T) => JSX.Element;
};

const PLACEHOLDER_AFTER_CLASS_NAME = 'draggable-list-placeholder-above';
const PLACEHOLDER_BEFORE_CLASS_NAME = 'draggable-list-placeholder-below';

type TargetPlacement = 'before' | 'after';

export function DraggableList<T>({
  enabled,
  items,
  getItemId,
  handleItemsOrderChange,
  renderItem
}: DraggableListProps<T>): JSX.Element {
  const [targetElement, setTargetElement] = useState<Element>();
  const [targetRect, setTargetRect] = useState<DOMRect>();
  const [targetIdx, setTargetIdx] = useState<number>();
  const [targetPlacement, setTargetPlacement] = useState<TargetPlacement>();

  const handleDragOver = useCallback(
    (event: React.DragEvent, idx: number) => {
      event.preventDefault();

      let currentTargetElement = targetElement;
      let currentTargetRect = targetRect;

      // check if dragging over a new element
      if (targetElement !== event.currentTarget) {
        currentTargetElement = event.currentTarget;
        currentTargetRect = event.currentTarget.getBoundingClientRect();
        setTargetElement(currentTargetElement);
        setTargetRect(currentTargetRect);
        setTargetIdx(idx);
      }

      if (currentTargetRect !== undefined && currentTargetElement !== undefined) {
        const deltaY = event.clientY - currentTargetRect.y;
        const currentTargetPlacement = deltaY < 0.5 * currentTargetRect.height ? 'before' : 'after';

        // check if where we are placing the dragged element has changed and update the styling if so
        if (currentTargetPlacement !== targetPlacement || currentTargetElement !== targetElement) {
          if (currentTargetPlacement === 'before') {
            currentTargetElement.classList.remove(PLACEHOLDER_BEFORE_CLASS_NAME);
            currentTargetElement.classList.add(PLACEHOLDER_AFTER_CLASS_NAME);
          } else if (currentTargetPlacement === 'after') {
            currentTargetElement.classList.remove(PLACEHOLDER_AFTER_CLASS_NAME);
            currentTargetElement.classList.add(PLACEHOLDER_BEFORE_CLASS_NAME);
          }
          setTargetPlacement(currentTargetPlacement);
        }
      }
    },
    [targetRect, targetElement, targetPlacement]
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    setTargetIdx(undefined);
    setTargetElement(undefined);
    event.currentTarget.classList.remove(
      PLACEHOLDER_AFTER_CLASS_NAME,
      PLACEHOLDER_BEFORE_CLASS_NAME
    );
  }, []);

  const handleDragEnd = useCallback(
    (event: React.DragEvent, idx: number) => {
      event.preventDefault();

      // check if no drop target
      if (targetIdx === undefined) return;

      // put the dragged item into the correct target spot
      const newItems = [...items];
      const [itemToMove] = newItems.splice(idx, 1);
      const placementIdx = targetIdx + (targetPlacement === 'after' ? 1 : 0);
      if (idx < placementIdx) {
        newItems.splice(placementIdx - 1, 0, itemToMove);
      } else {
        newItems.splice(placementIdx, 0, itemToMove);
      }
      handleItemsOrderChange(newItems);

      // Remove the styling from dragging
      targetElement?.classList.remove(PLACEHOLDER_AFTER_CLASS_NAME, PLACEHOLDER_BEFORE_CLASS_NAME);
    },
    [items, targetIdx, handleItemsOrderChange, targetElement, targetPlacement]
  );

  const handleDragStart = useCallback((event: React.DragEvent) => {
    // Changes the mouse cursor used for drag-and-drop
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <DraggableListContext.Provider value={{ enabled }}>
      {items.map((item, index) => (
        <div
          draggable={enabled}
          onDragOver={event => handleDragOver(event, index)}
          onDragEnd={event => handleDragEnd(event, index)}
          onDragLeave={event => handleDragLeave(event)}
          onDragStart={event => handleDragStart(event)}
          key={getItemId(item)}>
          {renderItem(item)}
        </div>
      ))}
    </DraggableListContext.Provider>
  );
}
