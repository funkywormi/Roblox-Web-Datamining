import { HeroUnitBottomRow, TGuiObjectProps } from "@rbx/discovery-sdui-components";
import React, { useMemo } from "react";
import { TSduiCommonProps } from "../system/SduiTypes";

type SduiHeroUnitBottomRowProps = {
  ctaButton: React.ReactNode;
  labelText?: string;
  rightLabelContent?: React.ReactNode;
} & TGuiObjectProps &
  TSduiCommonProps;

const SduiHeroUnitBottomRow = ({
  layoutOrder,
  anchorPoint,
  automaticSize,
  size,
  position,
  zIndex,

  ctaButton,
  labelText,
  rightLabelContent,

  sduiContext,
}: SduiHeroUnitBottomRowProps): JSX.Element => {
  const { tokens } = sduiContext.dependencies;

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
    <HeroUnitBottomRow
      ctaButton={ctaButton}
      labelText={labelText}
      labelTextColor={tokens.Color.Extended.Gray.Gray_400}
      labelTextFontStyle={tokens.Typography.BodySmall}
      rightLabelContent={rightLabelContent}
      containerOverrides={containerOverrides}
    />
  );
};

export default SduiHeroUnitBottomRow;
