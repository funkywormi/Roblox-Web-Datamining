import type { ReactNode } from "react";
import type { SduiTokenOrLiteral, SduiTextXAlignment } from "@rbx/sdui-core";
import { getTileDetailsStyles } from "./tileDetailsStyleUtils";

type TileDetailsContentProps =
  | { titleText: string; footerComponent?: ReactNode }
  | { footerComponent: ReactNode; titleText?: string };

export type TileDetailsProps = TileDetailsContentProps & {
  containmentPadding?: SduiTokenOrLiteral | null;
  isContained?: boolean;
  titleFont?: SduiTokenOrLiteral | null;
  titleTextXAlignment?: SduiTextXAlignment;
};

/** Title and footer rows (which may include controls) beneath a tile's thumbnail. */
export function TileDetails({
  containmentPadding,
  footerComponent,
  isContained = false,
  titleFont,
  titleText,
  titleTextXAlignment,
}: TileDetailsProps) {
  const hasTitle = titleText != null && titleText !== "";

  const { detailsStyles, titleStyles, footerStyles } = getTileDetailsStyles({
    containmentPadding,
    isContained,
    titleFont,
    titleTextXAlignment,
  });

  return (
    <div data-testid="sdui-tile-bottom-content" {...detailsStyles}>
      {hasTitle ? (
        <div data-testid="sdui-tile-title" {...titleStyles}>
          {titleText}
        </div>
      ) : null}
      {footerComponent != null ? (
        <div data-testid="sdui-tile-footer" {...footerStyles}>
          {footerComponent}
        </div>
      ) : null}
    </div>
  );
}
