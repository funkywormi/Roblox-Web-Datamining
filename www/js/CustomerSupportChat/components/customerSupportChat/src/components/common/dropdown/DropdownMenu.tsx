import React, { useMemo, useCallback, FC } from "react";
import classNames from "classnames";
import Dropdown from "./Dropdown";
import { Item } from "../../../core/types/common";
import { DateComponent } from "../../../core/types/ageGate";

type DropdownMenuProps = {
  id: string;
  items: Item[];
  setSelectedItem: (item: Item, id: string) => void;
  label?: string;
  errorMessage?: string;
  selectedItem?: Item;
  placeholder?: string;
  showErrorMessage?: boolean;
};

const DropdownMenu: FC<DropdownMenuProps> = ({
  id,
  items,
  label = id,
  errorMessage,
  selectedItem,
  setSelectedItem,
  placeholder,
  showErrorMessage = true,
}) => {
  const handleSelectionChange = useCallback(
    (item: Item) => {
      setSelectedItem(item, id);
    },
    [setSelectedItem, id],
  );

  const defaultLabel = useMemo(() => {
    // Use the provided placeholder or default to "Select {label}..."
    // TODO(mhowell): Localize using partial date component key Select.Default.{label}
    return selectedItem ? selectedItem.name : placeholder || label;
  }, [selectedItem, placeholder, label]);

  const getDropdownCTAStyles = useCallback(() => {
    // Component type specific styling (e.g. birthday selectors)
    switch (id) {
      case DateComponent.Month:
        return classNames("rounded-none rounded-l-lg");
      case DateComponent.Year:
        return classNames("rounded-none rounded-r-lg");
      case DateComponent.Day:
        return classNames("rounded-none");
      default:
        return classNames("rounded-lg");
    }
  }, [id]);

  return (
    <span className="inline-block w-full">
      <Dropdown
        id={id}
        currSelectionLabel={defaultLabel}
        hasSelected={Boolean(selectedItem)}
        className={classNames(getDropdownCTAStyles(), {
          "ring-red-500 ring-1 text-red-500 red-500": errorMessage,
          "ring-gray-100": !errorMessage,
        })}
      >
        {items.map(item => (
          <Dropdown.Item
            key={item.id}
            onSelect={() => {
              handleSelectionChange(item);
            }}
            active={selectedItem?.id === item.id}
          >
            {item.name}
          </Dropdown.Item>
        ))}
      </Dropdown>
      {showErrorMessage && (
        <span hidden={!errorMessage} className="text-red-500 font-normal text-sm mt-2">
          {errorMessage}
        </span>
      )}
    </span>
  );
};

export default DropdownMenu;
