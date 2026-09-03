import { AttributionRow, TTypographyToken, TWebTextElement } from "@rbx/discovery-sdui-components";
import React from "react";
import { TSduiCommonProps } from "../system/SduiTypes";

type SduiAttributionRowProps = TSduiCommonProps & {
  title: string;
  titleFontStyle?: TTypographyToken;
  titleWebTextElement?: TWebTextElement;
  subtitle?: string;
  subtitleFontStyle?: TTypographyToken;
  subtitleWebTextElement?: TWebTextElement;
  titleSubtitleGap?: number;
  subtitleMaxLines?: number;
  height?: number;
  rightButtonContent?: React.ReactNode;
  image?: React.ReactNode;
  titleMaxLines?: number;
};

const SduiAttributionRow = ({
  sduiContext,
  title,
  titleFontStyle,
  titleWebTextElement,
  subtitle,
  subtitleFontStyle,
  subtitleWebTextElement,
  titleSubtitleGap,
  subtitleMaxLines,
  height,
  rightButtonContent,
  image,
  titleMaxLines,
}: SduiAttributionRowProps): JSX.Element => {
  const { tokens } = sduiContext.dependencies;
  return (
    <AttributionRow
      title={title}
      subtitle={subtitle}
      textColor={tokens.Color.Content.Emphasis}
      titleFontStyle={titleFontStyle ?? tokens.Typography.TitleMedium}
      subtitleFontStyle={subtitleFontStyle ?? tokens.Typography.BodyMedium}
      titleWebTextElement={titleWebTextElement}
      subtitleWebTextElement={subtitleWebTextElement}
      titleSubtitleGap={titleSubtitleGap}
      subtitleMaxLines={subtitleMaxLines}
      rightButtonContent={rightButtonContent}
      imageComponent={image}
      height={height}
      titleMaxLines={titleMaxLines}
    />
  );
};

export default SduiAttributionRow;
