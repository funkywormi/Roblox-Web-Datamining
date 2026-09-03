import type { AgeBadgeControl } from "../util/ageBadgeUtil";

interface Props {
  variant: AgeBadgeControl;
}

// Colors come from Foundation semantic tokens that auto-swap on
// .light-theme / .dark-theme. For the Kids variant, a sibling PR scopes
// overrides onto --color-content-emphasis and --color-surface-0 so the same
// two utilities resolve to the Kids brand values (`Color/Kids/Content/Emphasis`
// and `Color/Kids/Surface/Surface_0` in Figma) without any variant branching
// here.
const CLASSES =
  "rbx-age-badge items-center justify-center select-none height-400 padding-x-xsmall radius-small text-label-small margin-left-[6px] bg-[var(--color-content-emphasis)] content-[var(--color-surface-0)]";

export default function AgeBadge({ variant }: Props) {
  return <span className={CLASSES}>{variant === "Kids" ? "KIDS" : "SELECT"}</span>;
}
