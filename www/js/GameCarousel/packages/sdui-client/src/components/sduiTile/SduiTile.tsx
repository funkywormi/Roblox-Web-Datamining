import React from "react";
import {
  asNonEmptyString,
  type SduiRendererInjectedProps,
  type SduiResolvedAction,
  type SduiTokenOrLiteral,
  type SduiTextXAlignment,
} from "@rbx/sdui-core";
import { ActionWrapper } from "@rbx/sdui-common";
import { getSduiTileStyles } from "./sduiTileStyleUtils";
import { TileDetails } from "./TileDetails";
import { TileThumbnail } from "./TileThumbnail";
import "./sduiTile.css";

export interface SduiTileProps extends SduiRendererInjectedProps {
  containmentPadding?: SduiTokenOrLiteral | null;
  cornerRadius?: SduiTokenOrLiteral | null;
  footerComponent?: React.ReactNode;
  image?: string;
  imageComponent?: React.ReactNode;
  imageAspectRatio?: number;
  imageCornerRadius?: SduiTokenOrLiteral | null;
  imagePadding?: SduiTokenOrLiteral | null;
  isContained?: boolean;
  onActivated?: SduiResolvedAction;
  thumbnailBackgroundStyle?: SduiTokenOrLiteral | null;
  thumbnailOverlayComponent?: React.ReactNode;
  thumbnailPadding?: SduiTokenOrLiteral | null;
  titleFont?: SduiTokenOrLiteral | null;
  titleText?: string;
  titleTextXAlignment?: SduiTextXAlignment;
  ariaLabel?: string;
}

export function SduiTile({
  containmentPadding,
  cornerRadius,
  footerComponent,
  image,
  imageComponent,
  imageAspectRatio,
  imageCornerRadius,
  imagePadding,
  isContained = false,
  onActivated,
  thumbnailBackgroundStyle,
  thumbnailOverlayComponent,
  thumbnailPadding,
  titleFont,
  titleText,
  titleTextXAlignment,
  ariaLabel,
}: SduiTileProps) {
  const { rootStyles, activationStyles, visualStyles } = getSduiTileStyles({
    cornerRadius,
    isContained,
  });

  // The control's only child is aria-hidden, so an empty label would leave
  // the button or link unnamed. Fall through an empty ariaLabel to the title.
  const activationLabel = asNonEmptyString(ariaLabel) ?? asNonEmptyString(titleText);
  const hasActivation = onActivated != null && activationLabel != null;
  const hasTitle = titleText != null && titleText !== "";
  const hasFooter = footerComponent != null;

  return (
    <div data-testid="sdui-tile" {...rootStyles}>
      {hasActivation ? (
        <ActionWrapper
          {...activationStyles}
          onClick={onActivated.onActivated}
          href={onActivated.href}
          clientNavigation={onActivated.clientNavigation}
          ariaLabel={activationLabel}
        >
          <span aria-hidden="true" />
        </ActionWrapper>
      ) : null}

      <div data-testid="sdui-tile-visual" {...visualStyles}>
        <TileThumbnail
          cornerRadius={cornerRadius}
          image={image}
          imageAspectRatio={imageAspectRatio}
          imageComponent={imageComponent}
          imageCornerRadius={imageCornerRadius}
          imagePadding={imagePadding}
          isContained={isContained}
          thumbnailBackgroundStyle={thumbnailBackgroundStyle}
          thumbnailOverlayComponent={thumbnailOverlayComponent}
          thumbnailPadding={thumbnailPadding}
        />

        {(hasTitle || hasFooter) && (
          <TileDetails
            containmentPadding={containmentPadding}
            footerComponent={footerComponent}
            isContained={isContained}
            titleFont={titleFont}
            titleText={titleText}
            titleTextXAlignment={titleTextXAlignment}
          />
        )}
      </div>
    </div>
  );
}
