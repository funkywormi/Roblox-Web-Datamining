import { useState } from "react";
import { Dropdown, Icon, Menu, MenuItem, MenuSection } from "@rbx/foundation-ui";
import { DropdownItemType } from "../utils/types";
import { useAbuseReportFormData } from "../context/ArwpFormDataProvider";

interface ArwpDropdownProps {
  items: DropdownItemType[];
  prompt: string;
  placeholder: string;
  formDataKey: string;
  isErrorState: boolean;
}

const ArwpDropdown = ({
  prompt,
  placeholder,
  items,
  formDataKey,
  isErrorState,
}: ArwpDropdownProps) => {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);
  const { formData, setFormData } = useAbuseReportFormData();

  const options = items.map(({ label, formDataValue }) => ({
    label,
    value: String(formDataValue),
  }));

  return (
    <Dropdown
      label={prompt}
      size="Medium"
      value={selectedValue}
      placeholder={placeholder}
      hasError={isErrorState}
      onValueChange={value => {
        const newFormDataMap = new Map(formData);
        newFormDataMap.set(formDataKey, value);
        setFormData(newFormDataMap);
        setSelectedValue(value);
      }}
    >
      <Menu>
        <MenuSection>
          {options.map(({ label, value }) => (
            <MenuItem
              key={value}
              title={label}
              value={value}
              trailing={
                selectedValue === value ? <Icon size="Medium" name="icon-filled-check" /> : null
              }
            />
          ))}
        </MenuSection>
      </Menu>
    </Dropdown>
  );
};

export default ArwpDropdown;
