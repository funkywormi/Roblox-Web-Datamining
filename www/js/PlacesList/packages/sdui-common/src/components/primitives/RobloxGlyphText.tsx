"use client";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { Icon } from "@rbx/foundation-ui";
import { useSduiTranslate } from "@rbx/sdui-core/client";

interface RobloxGlyph {
  testId: string;
  /** Translation key for the accessible name, if one exists. */
  labelKey?: string;
  fallbackLabel: string;
  renderIcon: () => ReactNode;
}

// Scales with the surrounding text like the app glyph; matches the Games page (20px badge at 16px text).
const BADGE_SIZE: CSSProperties = { width: "1.25em", height: "1.25em" };
const CURRENCY_SIZE: CSSProperties = { width: "1em", height: "1em" };

/**
 * Private-use glyphs the server embeds in display strings. The app's engine font draws them;
 * web fonts have no glyph for them, so each is replaced with the matching Foundation icon.
 */
const ROBLOX_GLYPHS: Readonly<Record<string, RobloxGlyph>> = {
  "\uE000": {
    testId: "sdui-verified-badge",
    // `Feature.ProfileBadges` key, shared with the www-common verified badge.
    labelKey: "Creator.VerifiedBadgeIconAccessibilityText",
    fallbackLabel: "Verified Badge Icon",
    renderIcon: () => (
      <Fragment>
        <Icon
          name="icon-filled-verified-backplate"
          className="content-system-emphasis"
          style={BADGE_SIZE}
        />
        <Icon
          name="icon-filled-verified-check"
          className="absolute"
          style={{ ...BADGE_SIZE, color: "white" }}
        />
      </Fragment>
    ),
  },
  "\uE001": {
    testId: "sdui-premium-glyph",
    fallbackLabel: "Premium",
    renderIcon: () => <Icon name="icon-filled-premium" style={CURRENCY_SIZE} />,
  },
  "\uE002": {
    testId: "sdui-robux-glyph",
    fallbackLabel: "Robux",
    renderIcon: () => <Icon name="icon-filled-robux" style={CURRENCY_SIZE} />,
  },
};

const ROBLOX_GLYPH_CHARACTERS = `[${Object.keys(ROBLOX_GLYPHS).join("")}]`;
const ROBLOX_GLYPH_PATTERN = new RegExp(ROBLOX_GLYPH_CHARACTERS);
const ROBLOX_GLYPHS_GLOBAL_PATTERN = new RegExp(ROBLOX_GLYPH_CHARACTERS, "g");

function RobloxGlyphIcon({ glyph }: { glyph: RobloxGlyph }) {
  const translate = useSduiTranslate();
  const translatedLabel = glyph.labelKey != null ? translate?.(glyph.labelKey) : undefined;
  const label = translatedLabel?.length ? translatedLabel : glyph.fallbackLabel;
  return (
    <span
      data-testid={glyph.testId}
      role="img"
      aria-label={label}
      title={label}
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ verticalAlign: "middle" }}
    >
      {glyph.renderIcon()}
    </span>
  );
}

export function hasRobloxGlyph(text: string): boolean {
  return text.search(ROBLOX_GLYPH_PATTERN) !== -1;
}

/** Removes Roblox glyphs, e.g. for an `aria-label` that can't hold the icons. */
export function stripRobloxGlyphs(text: string): string {
  return text.replace(ROBLOX_GLYPHS_GLOBAL_PATTERN, "").trimEnd();
}

/** Renders `text`, replacing each Roblox glyph with its inline icon. */
export function renderRobloxGlyphText(text: string): ReactNode {
  const glyphIndex = text.search(ROBLOX_GLYPH_PATTERN);
  const glyph = glyphIndex === -1 ? undefined : ROBLOX_GLYPHS[text.charAt(glyphIndex)];
  if (!glyph) {
    return text;
  }
  return (
    <Fragment>
      {text.slice(0, glyphIndex)}
      <RobloxGlyphIcon glyph={glyph} />
      {renderRobloxGlyphText(text.slice(glyphIndex + 1))}
    </Fragment>
  );
}
