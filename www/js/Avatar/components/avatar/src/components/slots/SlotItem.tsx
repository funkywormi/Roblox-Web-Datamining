import React, { useCallback, useState } from "react";
import classNames from "classnames";
import { Thumbnail2d } from "@rbx/thumbnails";
import { CategorySlot, SlotConfiguration, isEmptyCategorySlot, AssetSlot } from "../../types";

interface SlotItemProps {
  slot: CategorySlot;
  index?: number;
  slotConfig: SlotConfiguration;
  onSlotClicked: (slot: CategorySlot) => void;
  showSlotUp?: (slot: CategorySlot) => boolean;
  showSlotDown?: (slot: CategorySlot) => boolean;
  onSlotUp?: (slot: CategorySlot) => void;
  onSlotDown?: (slot: CategorySlot) => void;
  translate: (key: string) => string;
  reverseOrder?: boolean;
}

const SlotItem: React.FC<SlotItemProps> = ({
  slot,
  slotConfig,
  onSlotClicked,
  showSlotUp,
  showSlotDown,
  onSlotUp,
  onSlotDown,
  translate,
  reverseOrder = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (!isEmptyCategorySlot(slot)) {
      onSlotClicked(slot);
    }
  }, [slot, onSlotClicked]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !isEmptyCategorySlot(slot)) {
        onSlotClicked(slot);
      }
    },
    [slot, onSlotClicked],
  );

  const handleUpClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onSlotUp && !isEmptyCategorySlot(slot)) {
        onSlotUp(slot);
      }
    },
    [slot, onSlotUp],
  );

  const handleDownClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onSlotDown && !isEmptyCategorySlot(slot)) {
        onSlotDown(slot);
      }
    },
    [slot, onSlotDown],
  );

  const tooltipText = slotConfig.tooltipKey ? translate(slotConfig.tooltipKey) : "";
  const isEmpty = isEmptyCategorySlot(slot);
  const assetSlot = isEmpty ? null : slot;
  const canShowReorderControls = slotConfig.showReorderControls && !isEmpty && isHovered;
  const canMoveUp = showSlotUp && !isEmpty && showSlotUp(slot);
  const canMoveDown = showSlotDown && !isEmpty && showSlotDown(slot);

  if (slotConfig.showReorderControls) {
    const isLayeredClothing = slotConfig.id === "layeredClothing";
    const slotClassName = isLayeredClothing ? "layered-clothing-slot" : "slot";

    return (
      <div
        onMouseOver={() => {
          setIsHovered(true);
        }}
        onFocus={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
        onBlur={() => {
          setIsHovered(false);
        }}
        className={classNames({
          "arrangement-buttons-visible": canShowReorderControls,
        })}
      >
        <div
          className={slotClassName}
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          title={tooltipText}
        >
          {isEmpty && slotConfig.emptySlotIcon}
          {assetSlot && (
            <Thumbnail2d targetId={assetSlot.id} type={assetSlot.thumbnailType ?? "Asset"} />
          )}
          {canShowReorderControls && (
            <div className="arrangement-buttons-container react-arrangement-buttons-container">
              {(reverseOrder ? canMoveDown : canMoveUp) && (
                <div
                  className="arrangement-button arrangement-button-up"
                  role="button"
                  tabIndex={0}
                  onClick={reverseOrder ? handleDownClick : handleUpClick}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      (reverseOrder ? handleDownClick : handleUpClick)(
                        e as unknown as React.MouseEvent,
                      );
                    }
                  }}
                >
                  <div className="icon-up" />
                </div>
              )}
              {(reverseOrder ? canMoveUp : canMoveDown) && (
                <div
                  className="arrangement-button arrangement-button-down"
                  role="button"
                  tabIndex={0}
                  onClick={reverseOrder ? handleUpClick : handleDownClick}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      (reverseOrder ? handleUpClick : handleDownClick)(
                        e as unknown as React.MouseEvent,
                      );
                    }
                  }}
                >
                  <div className="icon-down" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const hasCustomIcon = isEmpty && slotConfig.emptySlotIcon;

  return (
    <div
      title={tooltipText}
      className={classNames("slot", {
        "slot-icon": isEmpty && !slotConfig.emptySlotIcon,
      })}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {hasCustomIcon && slotConfig.emptySlotIcon}
      {assetSlot && (
        <Thumbnail2d targetId={assetSlot.id} type={assetSlot.thumbnailType ?? "Asset"} />
      )}
    </div>
  );
};

export default SlotItem;
