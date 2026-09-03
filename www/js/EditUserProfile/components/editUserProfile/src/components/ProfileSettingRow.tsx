import { Icon, ListItem } from "@rbx/foundation-ui";

interface ProfileSettingRowProps {
  label: string;
  value?: string;
  placeholder?: string;
  onClick: () => void;
  divider?: "Full" | "None";
}

const ProfileSettingRow = ({
  label,
  value,
  placeholder,
  onClick,
  divider = "Full",
}: ProfileSettingRowProps) => {
  const displayValue = value ?? placeholder;

  return (
    <ListItem
      className="profile-setting-row"
      divider={divider}
      isContained
      title={label}
      onSelect={onClick}
      trailing={
        <div className="flex items-center gap-small min-width-0">
          <span className="text-body-medium profile-setting-row-value">{displayValue}</span>
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

export default ProfileSettingRow;
