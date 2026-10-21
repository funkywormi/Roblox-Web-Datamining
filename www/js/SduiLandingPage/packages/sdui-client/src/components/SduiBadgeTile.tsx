import React from "react";
import type { SduiTokenOrLiteral } from "@rbx/sdui-core";
import { SduiTile, type SduiTileProps } from "./sduiTile/SduiTile";

const DEFAULT_IMAGE_CORNER_RADIUS: SduiTokenOrLiteral = {
  kind: "numeric",
  value: 1000,
};

const DEFAULT_IMAGE_PADDING: SduiTokenOrLiteral = {
  kind: "token",
  value: "Padding.Medium",
};

export type SduiBadgeTileProps = SduiTileProps;

export function SduiBadgeTile({
  imageCornerRadius,
  imagePadding,
  isContained = true,
  ...tileProps
}: SduiBadgeTileProps): React.JSX.Element {
  return (
    <SduiTile
      {...tileProps}
      imageCornerRadius={imageCornerRadius ?? DEFAULT_IMAGE_CORNER_RADIUS}
      imagePadding={imagePadding ?? DEFAULT_IMAGE_PADDING}
      isContained={isContained}
    />
  );
}
