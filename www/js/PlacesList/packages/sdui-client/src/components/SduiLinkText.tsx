"use client";
import { Fragment, useMemo, type ReactNode } from "react";
import { clsx } from "clsx";
import { ActionWrapper, renderRobloxGlyphText } from "@rbx/sdui-common";
import { buildFoundationTokenCss, type SduiResolvedAction } from "@rbx/sdui-core";
import { SduiText, type SduiTextProps } from "./SduiText";

// There can only be one link within the component (one shared `onActivated` actions)
// Also, translations need to match the hardcoded {linkStart} {linkEnd} text for it to work.
const LINK_START_DELIMITER = "{linkStart}";
const LINK_END_DELIMITER = "{linkEnd}";
const DEFAULT_LINK_STYLE = "Color.Content.Link";

interface LinkTextSegment {
  key: number;
  isLink: boolean;
  text: string;
}

export interface SduiLinkTextProps extends SduiTextProps {
  onActivated?: SduiResolvedAction;
  linkStyle?: string;
  isLinkBold?: boolean;
  isLinkUnderlined?: boolean;
}

function splitLinkText(text: string): LinkTextSegment[] {
  const segments: LinkTextSegment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const startIndex = text.indexOf(LINK_START_DELIMITER, cursor);
    if (startIndex === -1) break;

    const linkTextStart = startIndex + LINK_START_DELIMITER.length;
    const endIndex = text.indexOf(LINK_END_DELIMITER, linkTextStart);
    if (endIndex === -1) break;

    if (startIndex > cursor) {
      segments.push({ key: cursor, isLink: false, text: text.slice(cursor, startIndex) });
    }
    segments.push({ key: startIndex, isLink: true, text: text.slice(linkTextStart, endIndex) });
    cursor = endIndex + LINK_END_DELIMITER.length;
  }

  if (segments.length === 0) return [{ key: 0, isLink: false, text }];
  if (cursor < text.length) {
    segments.push({ key: cursor, isLink: false, text: text.slice(cursor) });
  }
  return segments;
}

function LinkAction({ action, children }: { action?: SduiResolvedAction; children: ReactNode }) {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  if (action == null) return <Fragment>{children}</Fragment>;
  return (
    <ActionWrapper
      href={action.href}
      target={action.target}
      clientNavigation={action.clientNavigation}
      onClick={action.onActivated}
    >
      {children}
    </ActionWrapper>
  );
}

/** Text with `{linkStart}`/`{linkEnd}` sections styled as links. Only the link sections are interactive. */
export function SduiLinkText({
  text = "",
  onActivated,
  linkStyle,
  isLinkBold,
  isLinkUnderlined,
  ...textProps
}: SduiLinkTextProps) {
  const segments = useMemo(() => splitLinkText(text), [text]);
  const linkClassName = clsx(
    buildFoundationTokenCss(linkStyle ?? DEFAULT_LINK_STYLE, "content"),
    isLinkUnderlined === true && "underline",
  );

  // With no link section, the whole text is the link, as on app.
  const content: ReactNode = segments.some(segment => segment.isLink) ? (
    segments.map(segment =>
      segment.isLink ? (
        <LinkAction key={segment.key} action={onActivated}>
          <span data-testid="sdui-link-text-link" className={linkClassName}>
            {isLinkBold !== false ? (
              <strong>{renderRobloxGlyphText(segment.text)}</strong>
            ) : (
              renderRobloxGlyphText(segment.text)
            )}
          </span>
        </LinkAction>
      ) : (
        <Fragment key={segment.key}>{renderRobloxGlyphText(segment.text)}</Fragment>
      ),
    )
  ) : (
    <LinkAction action={onActivated}>{renderRobloxGlyphText(text)}</LinkAction>
  );

  return <SduiText {...textProps}>{content}</SduiText>;
}
