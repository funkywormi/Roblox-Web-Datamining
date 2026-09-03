import { useEffect, useRef } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { IconButton, SearchInput } from "@rbx/foundation-ui";
import tradesConstants from "../constants/tradesConstants";

export type InventorySearchProps = {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onOpen: () => void;
  onClose: () => void;
};

/**
 * Item-name search for the inventory panel. Sits collapsed as a circular icon
 * button at the end of the category chip row and expands to take over the row
 * when clicked; the trailing X (or Escape) clears the query and collapses it.
 * Open state belongs to the panel, which hides the chips while the input is up.
 */
export const InventorySearch = ({
  isOpen,
  value,
  onChange,
  onOpen,
  onClose,
}: InventorySearchProps): JSX.Element => {
  const { translate } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const label = translate("Label.Search");
  const closeLabel = translate("Action.Close");

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const close = () => {
    onChange("");
    onClose();
  };

  return (
    <div className={`inventory-search${isOpen ? " is-open" : ""}`}>
      {isOpen ? (
        <SearchInput
          ref={inputRef}
          size="Medium"
          name="inventory-search"
          value={value}
          placeholder={label}
          maxLength={tradesConstants.inventorySearchMaxLength}
          autoComplete="off"
          // No visible `label` — the design shows the placeholder only.
          aria-label={label}
          trailingIconNode={
            <IconButton
              className="inventory-search-clear"
              icon="icon-regular-x"
              ariaLabel={closeLabel}
              variant="Utility"
              size="XSmall"
              isCircular
              onClick={close}
            />
          }
          onChange={event => {
            onChange(event.target.value);
          }}
          onKeyDown={event => {
            if (event.key === "Escape") {
              event.preventDefault();
              close();
            }
          }}
        />
      ) : (
        <IconButton
          className="inventory-search-toggle"
          icon="icon-regular-magnifying-glass"
          ariaLabel={label}
          variant="Utility"
          size="Small"
          isCircular
          onClick={onOpen}
        />
      )}
    </div>
  );
};

export default InventorySearch;
