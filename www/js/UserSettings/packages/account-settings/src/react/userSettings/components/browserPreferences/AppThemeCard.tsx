import React from "react";
import classNames from "classnames";
import { useTranslation } from "@rbx/core-scripts/react";
import type { AppThemeDef } from "../../constants/appThemes";

export default function AppThemeCard({
  theme,
  selected,
  disabled,
  onSelect,
}: {
  theme: AppThemeDef;
  selected: boolean;
  disabled: boolean;
  onSelect: (def: AppThemeDef) => void;
}) {
  const { translate } = useTranslation();

  return (
    <button
      type="button"
      data-testid="app-theme-card"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(theme)}
      className={classNames(
        "flex items-center gap-small width-full padding-medium radius-medium text-align-x-start stroke-standard",
        disabled ? "cursor-default" : "cursor-pointer",
        selected ? "bg-shift-200 stroke-[var(--color-system-neutral)]" : "bg-none stroke-emphasis",
      )}
    >
      <span
        aria-hidden
        className="grow-0 shrink-0 basis-auto size-800 flex radius-circle clip stroke-standard stroke-muted"
      >
        {typeof theme.swatch === "string" ? (
          <div className={classNames("fill", theme.swatch)} />
        ) : (
          <React.Fragment>
            <div className={classNames("fill", theme.swatch.light)} />
            <div className={classNames("fill", theme.swatch.dark)} />
          </React.Fragment>
        )}
      </span>
      <span className="fill text-no-wrap text-truncate-end text-body-medium content-default">
        {translate(theme.labelKey)}
      </span>
    </button>
  );
}
