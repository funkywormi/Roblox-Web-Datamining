import { useTranslation, useTheme } from "@rbx/core-scripts/react";
import type { AppThemeDef } from "../../constants/appThemes";

export default function AppThemeCard({
  def,
  selected,
  disabled,
  onSelect,
}: {
  def: AppThemeDef;
  selected: boolean;
  disabled: boolean;
  onSelect: (def: AppThemeDef) => void;
}) {
  const { translate } = useTranslation();
  const colorMode = useTheme();

  return (
    <button
      type="button"
      data-testid="app-theme-card"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(def)}
      className={`flex items-center gap-small width-full padding-medium radius-medium text-align-x-start stroke-standard ${
        disabled ? "cursor-default" : "cursor-pointer"
      } ${
        selected ? "bg-shift-200 stroke-[var(--color-system-neutral)]" : "bg-none stroke-emphasis"
      }`}
    >
      <span
        aria-hidden
        className="grow-0 shrink-0 basis-auto size-800 radius-circle clip stroke-standard stroke-[var(--color-content-muted)]"
      >
        <span className="block size-full" style={{ backgroundColor: def.swatch[colorMode] }} />
      </span>
      <span className="fill basis-0 min-width-0 text-no-wrap text-truncate-end text-body-medium content-default">
        {translate(def.labelKey)}
      </span>
    </button>
  );
}
