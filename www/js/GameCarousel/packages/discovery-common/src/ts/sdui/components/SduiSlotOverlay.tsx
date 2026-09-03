import React, { useMemo } from "react";
import { SlotOverlay, TGuiObjectProps } from "@rbx/discovery-sdui-components";

type TSduiSlotOverlayProps = {
  topLeftSlot?: React.ReactNode;
  topMiddleSlot?: React.ReactNode;
  topRightSlot?: React.ReactNode;
  centerLeftSlot?: React.ReactNode;
  centerMiddleSlot?: React.ReactNode;
  centerRightSlot?: React.ReactNode;
  bottomLeftSlot?: React.ReactNode;
  bottomMiddleSlot?: React.ReactNode;
  bottomRightSlot?: React.ReactNode;

  // Padding around slots. Defaults to zero.
  padding?: number;

  children: React.ReactNode;
} & TGuiObjectProps;

const SduiSlotOverlay = ({
  layoutOrder,
  anchorPoint,
  automaticSize,
  size,
  position,
  zIndex,
  topLeftSlot,
  topMiddleSlot,
  topRightSlot,
  centerLeftSlot,
  centerMiddleSlot,
  centerRightSlot,
  bottomLeftSlot,
  bottomMiddleSlot,
  bottomRightSlot,
  padding,
  children,
}: TSduiSlotOverlayProps): JSX.Element => {
  const containerOverrides: TGuiObjectProps = useMemo(() => {
    return {
      layoutOrder,
      anchorPoint,
      automaticSize,
      size,
      position,
      zIndex,
    };
  }, [layoutOrder, anchorPoint, automaticSize, size, position, zIndex]);

  return (
    <SlotOverlay
      topLeftSlot={topLeftSlot}
      topMiddleSlot={topMiddleSlot}
      topRightSlot={topRightSlot}
      centerLeftSlot={centerLeftSlot}
      centerMiddleSlot={centerMiddleSlot}
      centerRightSlot={centerRightSlot}
      bottomLeftSlot={bottomLeftSlot}
      bottomMiddleSlot={bottomMiddleSlot}
      bottomRightSlot={bottomRightSlot}
      padding={padding}
      containerOverrides={containerOverrides}
    >
      {children}
    </SlotOverlay>
  );
};

export default SduiSlotOverlay;
