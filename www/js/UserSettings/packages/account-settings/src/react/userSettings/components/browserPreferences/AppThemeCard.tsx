import { useTranslation, useTheme } from "@rbx/core-scripts/react";
import { Icon } from "@rbx/foundation-ui";
import { defaultAppTheme, type AppThemeDef } from "../../constants/appThemes";

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
        className="shrink-0 size-800 radius-circle stroke-standard stroke-muted"
        style={{ backgroundColor: def.swatch[colorMode] }}
      />
      <span className="fill basis-0 min-width-0 text-no-wrap text-truncate-end text-body-medium content-default">
        {translate(def.labelKey)}
      </span>
      {def.key !== defaultAppTheme.key && (
        <Icon className="content-muted" name="icon-regular-roblox-plus" />
      )}
    </button>
  );
}
