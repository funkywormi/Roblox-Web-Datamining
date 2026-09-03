import React from "react";
import { CategorySlot, SlotConfiguration, isEmptyCategorySlot } from "../../types";
import SlotItem from "./SlotItem";

interface CategorySlotsProps {
  slots: CategorySlot[];
  slotConfig: SlotConfiguration;
  onSlotClicked: (slot: CategorySlot) => void;
  showSlotUp?: (slot: CategorySlot) => boolean;
  showSlotDown?: (slot: CategorySlot) => boolean;
  onSlotUp?: (slot: CategorySlot) => void;
  onSlotDown?: (slot: CategorySlot) => void;
  translate: (key: string) => string;
  reverseOrder?: boolean;
}

const CategorySlots: React.FC<CategorySlotsProps> = ({
  slots,
  slotConfig,
  onSlotClicked,
  showSlotUp,
  showSlotDown,
  onSlotUp,
  onSlotDown,
  translate,
  reverseOrder = false,
}) => {
  const displaySlots = reverseOrder ? slots.toReversed() : slots;

  return (
    <div className={slotConfig.cssClass}>
      {displaySlots.map((slot, index) => (
        <SlotItem
          key={isEmptyCategorySlot(slot) ? `empty-${index}` : slot.id}
          slot={slot}
          index={index}
          slotConfig={slotConfig}
          onSlotClicked={onSlotClicked}
          showSlotUp={showSlotUp}
          showSlotDown={showSlotDown}
          onSlotUp={onSlotUp}
          onSlotDown={onSlotDown}
          translate={translate}
          reverseOrder={reverseOrder}
        />
      ))}
    </div>
  );
};

export default CategorySlots;
