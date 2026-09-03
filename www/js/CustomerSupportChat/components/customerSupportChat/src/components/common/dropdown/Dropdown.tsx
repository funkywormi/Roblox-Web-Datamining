import React from "react";
import Dropdown from "react-bootstrap/lib/Dropdown";
import MenuItem from "react-bootstrap/lib/MenuItem";
import classNames from "classnames";

interface RobloxDropdownProps {
  id: string;
  hasSelected?: boolean;
  currSelectionLabel?: React.ReactNode;
  icon?: string;
  className?: string;
  children?: React.ReactNode;
}

const RobloxDropdown: React.FC<RobloxDropdownProps> & {
  Item: typeof RobloxDropdownItem;
  Menu: typeof RobloxDropdownMenu;
} = ({ id, hasSelected, currSelectionLabel, icon, children, className, ...otherProps }) => {
  const iconClasses = classNames("dropdown-icon", icon);
  const dropdownClasses = classNames(className, "input-group-btn");
  return (
    <Dropdown {...otherProps} id={id} className={dropdownClasses}>
      <Dropdown.Toggle className="input-dropdown-btn" noCaret>
        {icon && <span className={iconClasses} />}
        <span
          className={classNames("rbx-selection-label whitespace-normal", {
            "font-light": !hasSelected,
          })}
        >
          {currSelectionLabel}
        </span>
        <span className="icon-down-16x16" />
      </Dropdown.Toggle>
      <Dropdown.Menu>{children}</Dropdown.Menu>
    </Dropdown>
  );
};

interface RobloxDropdownItemProps {
  children?: React.ReactNode;
  active: boolean;
  onSelect: () => void;
}

const RobloxDropdownItem: React.FC<RobloxDropdownItemProps> = ({
  children,
  active,
  onSelect,
  ...otherProps
}) => {
  return (
    <MenuItem {...otherProps} onSelect={onSelect} active={active}>
      <span className="whitespace-normal">{children}</span>
    </MenuItem>
  );
};

interface RobloxDropdownMenuProps {
  children?: React.ReactNode;
}

const RobloxDropdownMenu: React.FC<RobloxDropdownMenuProps> = ({ children, ...otherProps }) => {
  return <Dropdown.Menu {...otherProps}>{children}</Dropdown.Menu>;
};

RobloxDropdown.Item = RobloxDropdownItem;
RobloxDropdown.Menu = RobloxDropdownMenu;

export default RobloxDropdown;
