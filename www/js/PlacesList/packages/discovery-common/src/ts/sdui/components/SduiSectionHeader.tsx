import React, { useMemo } from "react";
import {
  MaybeLinkActionWrapper,
  SectionHeader,
  TGuiObjectProps,
  TTypographyToken,
  TWebTextElement,
} from "@rbx/discovery-sdui-components";
import { TSduiCommonProps } from "../system/SduiTypes";
import { TSduiParsedAction } from "../system/SduiActionParserRegistry";
import GamesInfoTooltip from "../../common/components/GamesInfoTooltip";

type TSduiSectionHeaderProps = {
  // Called when title component (text or icon) is activated.
  // Also called when the entire component is activated (subtitle, icon, or
  // empty space) if there is no higher priority callback (onSubtitleActivated)
  onTitleActivated?: TSduiParsedAction;
  // Title text
  titleText?: string;
  // Title text color. Defaults to Color.Content.Emphasis
  titleColor?: string;
  // Title font styles (Font, LetterSpacing, FontFamily, FontWeight, FontSize, and
  // LineHeight). Defaults to Typography.HeadingSmall
  titleFontStyle?: TTypographyToken;
  // Gap between title text and title icon. Has no effect if icon is not
  // provided. Defaults to Gap.XXSmall
  titleGap?: number;
  // Class name of title icon to render (optional)
  titleIcon?: string;
  // Width and height of title icon. Defaults to Size.Size_600
  titleIconWidth?: number;
  // Web text element to render for the title
  titleWebTextElement?: TWebTextElement;
  // Replaces title
  // Overrides titleText, titleTextColor, titleFontStyle, titleGap,
  // titleIcon, and titleIconWidth
  // Does not override onTitleActivated
  titleComponent?: React.ReactNode;

  // Called when subtitle component (text or icon) is activated.
  onSubtitleActivated?: TSduiParsedAction;
  // Subtitle text
  subtitleText?: string;
  // Subtitle text color. Defaults to Color.Content.Default
  subtitleColor?: string;
  // Subtitle font styles (Font, LetterSpacing, FontFamily, FontWeight, FontSize, and
  // LineHeight). Defaults to Typography.BodyMedium
  subtitleFontStyle?: TTypographyToken;
  // Gap between subtitle text and title icon. Has no effect if icon is not
  // provided. Defaults to Gap.XXSmall
  subtitleGap?: number;
  // Class name of subtitle icon to render (optional)
  subtitleIcon?: string;
  // Width and height of subtitle icon. Defaults to Size.Size_400
  subtitleIconWidth?: number;
  // Web text element to render for the subtitle
  subtitleWebTextElement?: TWebTextElement;
  // Replaces subtitle
  // Overrides subtitle, subtitleTextColor, subtitleFontStyle, subtitleGap,
  // subtitleIcon, subtitleIconWidth, and onSubtitleActivated
  subtitleComponent?: React.ReactNode;

  // Gap between title and subtitle. Has no effect if subtitle is not provided.
  // Defaults to Gap.XXSmall
  verticalGap?: number;

  // Tooltip text to display on info icon
  infoText?: string;
  // Called when info icon is activated
  onInfoIconActivated?: TSduiParsedAction;
  // Replaces info icon
  // Overrides infoText and onInfoIconActivated
  iconComponent?: React.ReactNode;
} & TGuiObjectProps &
  TSduiCommonProps;

const SduiSectionHeader = ({
  layoutOrder,
  anchorPoint,
  automaticSize,
  size,
  position,
  zIndex,

  onTitleActivated,
  titleText,
  titleColor,
  titleFontStyle,
  titleGap,
  titleIcon,
  titleIconWidth,
  titleWebTextElement,
  titleComponent,

  onSubtitleActivated,
  subtitleText,
  subtitleColor,
  subtitleFontStyle,
  subtitleGap,
  subtitleIcon,
  subtitleIconWidth,
  subtitleWebTextElement,
  subtitleComponent,

  verticalGap,

  infoText,
  onInfoIconActivated,
  iconComponent,

  sduiContext,
}: TSduiSectionHeaderProps): JSX.Element => {
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

  const icon = useMemo(() => {
    if (iconComponent) {
      return iconComponent;
    }

    if (infoText) {
      return (
        <MaybeLinkActionWrapper
          callback={onInfoIconActivated?.onActivated}
          linkPath={onInfoIconActivated?.linkPath}
          ariaLabel={infoText}
        >
          <GamesInfoTooltip tooltipText={infoText} placement="left" centerIcon />
        </MaybeLinkActionWrapper>
      );
    }

    return undefined;
  }, [iconComponent, infoText, onInfoIconActivated]);

  return (
    <SectionHeader
      onTitleActivated={onTitleActivated?.onActivated}
      titleLinkPath={onTitleActivated?.linkPath}
      titleText={titleText}
      titleTextColor={titleColor ?? tokens.Color.Content.Emphasis}
      titleFontStyle={titleFontStyle ?? tokens.Typography.HeadingSmall}
      titleGap={titleGap ?? tokens.Gap.XXSmall}
      titleIconClassName={titleIcon}
      titleIconWidth={titleIconWidth ?? tokens.Size.Size_600}
      titleWebTextElement={titleWebTextElement}
      titleComponent={titleComponent}
      onSubtitleActivated={onSubtitleActivated?.onActivated}
      subtitleLinkPath={onSubtitleActivated?.linkPath}
      subtitleText={subtitleText}
      subtitleTextColor={subtitleColor ?? tokens.Color.Content.Default}
      subtitleFontStyle={subtitleFontStyle ?? tokens.Typography.BodyMedium}
      subtitleGap={subtitleGap ?? tokens.Gap.XXSmall}
      subtitleIconClassName={subtitleIcon}
      subtitleIconWidth={subtitleIconWidth ?? tokens.Size.Size_400}
      subtitleWebTextElement={subtitleWebTextElement}
      subtitleComponent={subtitleComponent}
      verticalGap={verticalGap ?? tokens.Gap.XXSmall}
      iconComponent={icon}
      containerOverrides={containerOverrides}
    />
  );
};

export default SduiSectionHeader;
