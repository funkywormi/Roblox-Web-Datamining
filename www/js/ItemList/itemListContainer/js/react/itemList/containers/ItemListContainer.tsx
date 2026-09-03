// We check for undefined values within the code
/* eslint-disable react/require-default-props */
import React from 'react';
import { createSystemFeedback } from 'react-style-guide';
import { TDetailEntry, TItemDetailRequestEntry } from 'Roblox';
import ItemListCarousel from '../components/ItemListCarousel';
import { TItemCardSource } from '../../analytics/axTrackingEvents';

type TItemListContainerProps = {
  items: Array<TItemDetailRequestEntry>;
  purchasable: boolean;
  selectable?: boolean;
  defaultSelected?: boolean;
  backgroundVisualContainer?: boolean;
  titleText: string;
  wrapItems: boolean;
  onSelectedItemsChanged?: (
    selectedItems: Array<TDetailEntry>,
    ownershipRecord: Record<string, boolean>
  ) => void;
  showDefaultBody?: boolean;
  onDefaultBodySelectChanged?: (useDefaultBody: boolean) => void;
  showCreatorName?: boolean;
  showPrice?: boolean;
  showItemType?: boolean;
  checkOwnership?: boolean;
  defaultPermanentTimedOption?: boolean;
  source?: string;
};

export const ItemListContainer = ({
  items,
  purchasable,
  selectable,
  defaultSelected,
  backgroundVisualContainer,
  titleText,
  wrapItems,
  onSelectedItemsChanged,
  showDefaultBody,
  onDefaultBodySelectChanged,
  showCreatorName,
  showPrice,
  showItemType,
  checkOwnership,
  defaultPermanentTimedOption,
  source
}: TItemListContainerProps): JSX.Element => {
  const [SystemFeedback, systemFeedbackService] = createSystemFeedback();
  let isSelectableBasedOnParams = selectable !== undefined ? selectable : false;
  if (purchasable) {
    isSelectableBasedOnParams = true;
  }
  return (
    <div
      className={`item-list${purchasable ? ' purchasable' : ''}${wrapItems ? ' wrap-items' : ''}`}>
      <ItemListCarousel
        items={items}
        selectable={isSelectableBasedOnParams}
        defaultSelected={defaultSelected !== undefined ? defaultSelected : true}
        purchasable={purchasable}
        backgroundVisualContainer={backgroundVisualContainer || false}
        titleText={titleText}
        onSelectedItemsChanged={onSelectedItemsChanged}
        systemFeedbackService={systemFeedbackService}
        showDefaultBody={showDefaultBody}
        onDefaultBodySelectChanged={onDefaultBodySelectChanged}
        showCreatorName={showCreatorName !== undefined ? showCreatorName : true}
        showPrice={showPrice !== undefined ? showPrice : true}
        showItemType={showItemType !== undefined ? showItemType : false}
        checkOwnership={checkOwnership}
        defaultPermanentTimedOption={defaultPermanentTimedOption}
        itemCardSource={source as TItemCardSource | undefined}
      />
      <SystemFeedback />
    </div>
  );
};

export default ItemListContainer;
