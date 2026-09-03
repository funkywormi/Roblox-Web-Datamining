import { useState } from "react";
import {
  Chip,
  Icon,
  Menu,
  MenuItem,
  MenuSection,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@rbx/foundation-ui";

export type DropdownOption = {
  value: string;
  label: string;
};

export type FilterDropdownProps = {
  options: DropdownOption[];
  value: string;
  /**
   * Called on every pick, including a pick of the already-selected option, which
   * callers that fetch per option can treat as a request to reload.
   */
  onSelect: (value: string) => void;
  /** Names the menu for screen readers; the chip is labelled by its own text. */
  ariaLabel: string;
};

/**
 * Single-select filter shown as a chip naming the current selection, which opens
 * a menu of the rest. Foundation's Dropdown is a full-width boxed input, so the
 * chip is the compact form that fits beside the inventory search toggle.
 */
export const FilterDropdown = ({
  options,
  value,
  onSelect,
  ariaLabel,
}: FilterDropdownProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(option => option.value === value);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Chip
          className="filter-dropdown-chip"
          text={selected?.label ?? ""}
          size="Medium"
          trailingIconName="icon-filled-chevron-large-down"
          // Chip is a toggle, but here it opens a menu rather than owning a
          // selection of its own, so "checked" tracks the open menu. Chip sets
          // its own `onClick` after spreading the props it is given, so the
          // trigger's click never reaches it — the toggle has to come from
          // `onCheckedChange`.
          isChecked={isOpen}
          onCheckedChange={setIsOpen}
        />
      </PopoverTrigger>

      <PopoverContent align="start" ariaLabel={ariaLabel} className="filter-dropdown-menu">
        <Menu size="Medium">
          <MenuSection>
            {options.map(option => (
              <MenuItem
                key={option.value}
                value={option.value}
                title={option.label}
                trailing={
                  option.value === value ? (
                    <Icon name="icon-filled-check" size="Small" />
                  ) : undefined
                }
                onSelect={() => {
                  setIsOpen(false);
                  onSelect(option.value);
                }}
              />
            ))}
          </MenuSection>
        </Menu>
      </PopoverContent>
    </Popover>
  );
};

export default FilterDropdown;
