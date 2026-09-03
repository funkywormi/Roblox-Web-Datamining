import { CSSProperties, JSX } from "react";
import { Icon } from "@rbx/foundation-ui";

// The Foundation `<Badge>` component hardcodes its inner `<Icon size="XSmall">`
// (16px) regardless of the pill size, so we render the circle ourselves to get
// a larger glyph.
//
// Colors invert between themes (per mock):
//   - Light theme: black circle, white glyph
//   - Dark theme:  white circle, black glyph
// `--color-content-emphasis` and `--color-surface-100` are theme-aware tokens
// that resolve in opposite directions, so swapping them between background and
// foreground produces the inversion automatically.
//
// Insets (`top: 16px`, `left: 16px`) align the badge with the thumbnail's
// rounded corner per the mock.
const wrapperStyle: CSSProperties = {
  position: "absolute",
  top: "16px",
  left: "16px",
  zIndex: 1,
  width: 32,
  height: 32,
  borderRadius: "9999px",
  backgroundColor: "var(--color-content-emphasis)",
  color: "var(--color-surface-100)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function FaeStatusBadge(): JSX.Element {
  return (
    <div style={wrapperStyle}>
      <Icon name="icon-regular-lock-closed" size="Medium" />
    </div>
  );
}

export default FaeStatusBadge;
