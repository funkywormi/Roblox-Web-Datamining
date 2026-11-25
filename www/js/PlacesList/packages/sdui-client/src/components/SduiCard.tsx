import type { SduiRendererInjectedProps, SduiTokenOrLiteral } from "@rbx/sdui-core";
import { getCardStyles } from "./cardStyleUtils";

export interface SduiCardProps extends SduiRendererInjectedProps {
  // TODO: Support the remaining Card schema features (imageStyle ColorStyleProp
  // resolution, focus_navigation_actions_component).
  titleText?: string;
  descriptionText?: string;
  /**
   * Nested CTA from CardSchema `cta_button_component` (typically a BUTTON
   * template). Flat `cta_*` props are not consumed on web — use the nested
   * slot (same pattern as GameTile).
   */
  ctaButtonComponent?: React.ReactNode;
  /**
   * Nested image from CardSchema `image_component` (typically an IMAGE
   * template). The flat `image` string prop is not consumed on web — templates
   * nest an image/media component here (same pattern as the CTA).
   */
  imageComponent?: React.ReactNode;
  /**
   * From CardSchema `Int32Prop corner_radius` (px) or a `Radius.*` token.
   * Normalized at the registry via `makeTokenOrLiteralPropParser("Radius.Medium")`.
   */
  cornerRadius?: SduiTokenOrLiteral | null;
  /** Normalized at the registry via `makeTokenOrLiteralPropParser`. */
  backgroundStyle?: SduiTokenOrLiteral | null;
  descriptionMaxLines?: number;
  testId?: string;
}

/** Card for `UI_COMPONENT_TYPE_CARD`: left content column (title, description,
 * nested CTA) plus a fixed-width nested image column on the right. Fully
 * server-renderable — both the CTA and image arrive as pre-built nested nodes. */
export function SduiCard({
  titleText,
  descriptionText,
  ctaButtonComponent,
  imageComponent,
  cornerRadius,
  backgroundStyle,
  descriptionMaxLines,
  testId = "sdui-card",
}: SduiCardProps) {
  const {
    containerStyles,
    contentStyles,
    textStackStyles,
    titleStyles,
    descriptionStyles,
    ctaStyles,
    imageColumnStyles,
  } = getCardStyles({ cornerRadius, backgroundStyle, descriptionMaxLines });

  return (
    <div data-testid={testId} {...containerStyles}>
      <div {...contentStyles}>
        <div {...textStackStyles}>
          {titleText ? (
            <div data-testid="sdui-card-title" {...titleStyles}>
              {titleText}
            </div>
          ) : null}
          {descriptionText ? (
            <div data-testid="sdui-card-description" {...descriptionStyles}>
              {descriptionText}
            </div>
          ) : null}
        </div>
        {ctaButtonComponent != null ? (
          <div data-testid="sdui-card-cta" {...ctaStyles}>
            {ctaButtonComponent}
          </div>
        ) : null}
      </div>
      {imageComponent != null ? (
        <div data-testid="sdui-card-image" {...imageColumnStyles}>
          {imageComponent}
        </div>
      ) : null}
    </div>
  );
}
