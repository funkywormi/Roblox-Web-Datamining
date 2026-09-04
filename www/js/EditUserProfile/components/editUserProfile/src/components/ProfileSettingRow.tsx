import { ReactNode } from "react";
import { Icon, ListItem } from "@rbx/foundation-ui";

interface ProfileSettingRowProps {
  label: string;
  value?: string;
  placeholder?: string;
  /** Custom trailing content (e.g. a thumbnail). Overrides the text value when set. */
  trailingValue?: ReactNode;
  /**
   * Optional element rendered immediately after the label (e.g. a "New" badge).
   * When set, the label is rendered via the leading slot with the same typography
   * as ListItem's native title so it stays inline with the badge.
   */
  titleBadge?: ReactNode;
  onClick: () => void;
  divider?: "Full" | "None";
}

export const ProfileSettingRow = ({
  label,
  value,
  placeholder,
  trailingValue,
  titleBadge,
  onClick,
  divider = "Full",
}: ProfileSettingRowProps) => {
  const displayValue = value ?? placeholder;

  return (
    <ListItem
      className="profile-setting-row"
      divider={divider}
      isContained
      title={titleBadge ? undefined : label}
      leading={
        titleBadge ? (
          <div className="flex items-center gap-small">
            <span className="content-emphasis text-align-x-start text-title-large">{label}</span>
            {titleBadge}
          </div>
        ) : undefined
      }
      onSelect={onClick}
      trailing={
        <div className="flex items-center gap-small min-width-0">
          {trailingValue ?? (
            <span className="text-body-medium profile-setting-row-value">{displayValue}</span>
          )}
          <Icon
            name="icon-regular-chevron-large-right"
            size="Small"
            className="shrink-0"
            data-testid="profile-setting-row-chevron"
          />
        </div>
      }
    />
  );
};
