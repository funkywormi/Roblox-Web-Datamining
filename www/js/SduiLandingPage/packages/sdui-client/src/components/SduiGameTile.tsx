import React, { isValidElement } from "react";
import { clsx } from "clsx";
import { Thumbnail2d, ThumbnailFormat } from "@rbx/thumbnails";
import {
  type SduiRendererInjectedProps,
  type SduiResolvedAction,
  type SduiTokenOrLiteral,
  buildFoundationTokenCss,
  getSduiNumeric,
  getSduiToken,
  toHtmlElement,
  parseImageString,
  ActionWrapper,
} from "@rbx/sdui-core";
import "./css/sduiGameTile.css";
import { SDUI_GAME_TILE_DEFAULTS } from "../consts/defaults";

export interface SduiGameTileProps extends SduiRendererInjectedProps {
  // TODO: Support the remaining GameTile schema features
  imageAspectRatio?: number;
  titleText?: string;
  image?: string;
  onActivated?: SduiResolvedAction;
  cornerRadius?: SduiTokenOrLiteral;
  titleLines?: number;
  ctaButtonComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  imageComponent?: React.ReactNode;
  thumbnailOverlayComponent?: React.ReactNode;
  titleComponent?: React.ReactNode;
  thumbnailBackgroundStyle?: string;
  titleFont?: string;
  titleHeadingLevel?: string;
}

/**
 * Client-side game tile. Renders a thumbnail image with title text, an
 * optional footer, and an optional CTA button.
 *
 * Lives in sdui-client (not sdui-core) because it depends on @rbx/thumbnails
 * (Thumbnail2d), which is a browser-only package.
 *
 * Structure:
 *   ActionWrapper      (<a> / <button> / div)
 *     image container  (image | placeholder + overlay)
 *     bottom content   (left: title + footer | right: cta button)
 */
export function SduiGameTile({
  imageAspectRatio = 1,
  titleText,
  image,
  onActivated,
  cornerRadius,
  titleLines = 1,
  ctaButtonComponent,
  footerComponent,
  imageComponent,
  thumbnailOverlayComponent,
  titleComponent,
  thumbnailBackgroundStyle,
  titleFont,
  titleHeadingLevel,
}: SduiGameTileProps) {
  const cornerRadiusPx = getSduiNumeric(cornerRadius);
  const cornerRadiusClass = buildFoundationTokenCss(getSduiToken(cornerRadius));
  const hasActivationHandler = !!onActivated?.onActivated;

  // image node: prefer passed imageComponent, then thumbnail/img, then placeholder
  const parsedImage = typeof image === "string" ? parseImageString(image) : null;

  const imageNode =
    imageComponent ??
    (parsedImage?.kind === "thumbnail" ? (
      <Thumbnail2d
        type={parsedImage.thumbnail.type}
        targetId={parsedImage.thumbnail.targetId}
        format={ThumbnailFormat.webp}
        size={parsedImage.thumbnail.size}
        containerClass="sdui-thumbnail-image-container"
      />
    ) : isValidElement(image) ? (
      image
    ) : typeof image === "string" ? (
      <img
        src={image}
        alt={titleText ?? ""}
        className={cornerRadiusClass}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          ...(!cornerRadiusClass && { borderRadius: cornerRadiusPx }),
        }}
      />
    ) : (
      <div
        data-testid="sdui-tile-placeholder"
        className={cornerRadiusClass}
        style={{
          width: "100%",
          height: "100%",
          aspectRatio: String(imageAspectRatio),
          backgroundColor: thumbnailBackgroundStyle ?? "transparent",
          ...(!cornerRadiusClass && { borderRadius: cornerRadiusPx }),
        }}
      />
    ));

  // title node
  const TitleElement = toHtmlElement(titleHeadingLevel, "div");
  const titleNode =
    titleComponent ??
    (titleText ? (
      <TitleElement
        data-sdui-text="true"
        className={clsx(
          "m-0",
          "p-0",
          buildFoundationTokenCss(titleFont ?? SDUI_GAME_TILE_DEFAULTS.titleFont) ??
            titleFont ??
            "text-title-medium",
          buildFoundationTokenCss(SDUI_GAME_TILE_DEFAULTS.titleColor, "content") ??
            "content-emphasis",
        )}
        style={
          titleLines === 1
            ? {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                wordWrap: "break-word",
                padding: 0,
              }
            : {
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: titleLines,
                WebkitBoxOrient: "vertical",
                padding: 0,
              }
        }
      >
        {titleText}
      </TitleElement>
    ) : null);

  return (
    <ActionWrapper
      data-testid="sdui-game-tile"
      className={clsx("gap-small", hasActivationHandler && "sdui-game-tile-wrapper")}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
      onClick={onActivated?.onActivated}
      href={onActivated?.href}
      ariaLabel={titleText}
    >
      {/* thumbnail */}
      <div
        data-testid="sdui-tile-image-container"
        className={clsx("sdui-tile-image-container", cornerRadiusClass)}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: String(imageAspectRatio),
          overflow: "hidden",
          ...(!cornerRadiusClass && { borderRadius: cornerRadiusPx }),
        }}
      >
        {imageNode}
        {thumbnailOverlayComponent != null ? (
          <div className="sdui-tile-overlay-container" data-testid="sdui-tile-overlay-container">
            {thumbnailOverlayComponent}
          </div>
        ) : null}
      </div>

      {/* title, footer, cta */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 4,
          width: "100%",
        }}
      >
        <div
          style={{
            flexGrow: 1,
            minWidth: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {titleNode}
          {footerComponent}
        </div>
        {ctaButtonComponent != null && (
          <div style={{ flexShrink: 0, display: "flex" }}>{ctaButtonComponent}</div>
        )}
      </div>
    </ActionWrapper>
  );
}
