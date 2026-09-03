import type { JSX } from "react";
import { Icon } from "@rbx/foundation-ui";
import "./itemCard.css";

// The Foundation `<Badge>` component hardcodes its inner `<Icon size="XSmall">`
// (16px) regardless of the pill size, so we render the circle ourselves to get
// a larger glyph.
//
// Colors invert between themes (per mock): light theme uses a dark circle with a
// light glyph, dark theme the reverse. The `bg-inverse-surface-100` /
// `content-inverse-emphasis` tokens are theme-aware and resolve in opposite
// directions, producing that inversion automatically.
//
// Positioning (top-left inset + z-index) lives in `www-item-card-fae-badge` (see
// itemCard.css), matching the other thumbnail overlays.
function FaeStatusBadge(): JSX.Element {
  return (
    <div className="www-item-card-fae-badge size-800 radius-circle flex items-center justify-center bg-inverse-surface-100 content-inverse-emphasis">
      <Icon name="icon-regular-lock-closed" size="Medium" />
    </div>
  );
}

export default FaeStatusBadge;
