import type { KeyboardEvent, ReactNode } from "react";
import { TextInput } from "@rbx/foundation-ui";

type SearchHeaderProps = {
  heading: ReactNode;
  value: string;
  placeholder: string;
  isDisabled?: boolean;
  /** Angular's `ng-hide="pageData.inApp"`: the app supplies its own search bar. */
  showInput?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

const SearchHeader = ({
  heading,
  value,
  placeholder,
  isDisabled = false,
  showInput = true,
  onChange,
  onSubmit,
}: SearchHeaderProps): React.JSX.Element => {
  const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-medium">
      <h1 className="text-title-large content-emphasis">{heading}</h1>
      {showInput ? (
        <div className="width-full">
          <TextInput
            aria-label={placeholder}
            className="width-full"
            isDisabled={isDisabled}
            leadingIconName="icon-regular-magnifying-glass"
            onChange={event => {
              onChange(event.currentTarget.value);
            }}
            onKeyUp={onKeyUp}
            placeholder={placeholder}
            size="Large"
            value={value}
          />
        </div>
      ) : null}
    </div>
  );
};

export default SearchHeader;
