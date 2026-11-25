"use client";

import React, { useMemo } from "react";
import { useTokens } from "@rbx/core-scripts/react";
import { HeroUnitBottomRow, type TGuiObjectProps } from "@rbx/discovery-sdui-components";
import type { SduiDim2, SduiRendererInjectedProps } from "@rbx/sdui-core";

export interface SduiHeroUnitBottomRowProps extends SduiRendererInjectedProps {
  layoutOrder?: number;
  position?: SduiDim2;
  zIndex?: number;
  ctaButton?: React.ReactNode;
  labelText?: string;
  rightLabelContent?: React.ReactNode;
}

export function SduiHeroUnitBottomRow({
  layoutOrder,
  position,
  zIndex,
  ctaButton,
  labelText,
  rightLabelContent,
}: SduiHeroUnitBottomRowProps): React.JSX.Element | null {
  const tokens = useTokens();

  const containerOverrides = useMemo<TGuiObjectProps | undefined>(() => {
    if (layoutOrder === undefined && position === undefined && zIndex === undefined) {
      return undefined;
    }

    return {
      layoutOrder,
      position,
      zIndex,
    };
  }, [layoutOrder, position, zIndex]);

  if (ctaButton == null && !labelText && rightLabelContent == null) {
    return null;
  }

  return (
    <HeroUnitBottomRow
      ctaButton={ctaButton}
      labelText={labelText}
      labelTextColor={tokens.Color.Extended.Gray.Gray_400}
      labelTextFontStyle={{ ...tokens.Typography.BodySmall, FontFamily: "inherit" }}
      rightLabelContent={rightLabelContent}
      containerOverrides={containerOverrides}
    />
  );
}

export default SduiHeroUnitBottomRow;
