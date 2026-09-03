import React, { ChangeEvent, createRef } from "react";
import { useTranslation } from "react-utilities";
import ClassNames from "classnames";
import commonTranslationConstants from "../../userSettings/constants/contentConstants/commonTranslationConstants";

export const SearchBar = ({
  onSubmit,
  searchInput,
  onSearchInputChange,
  classNames,
}: {
  onSubmit: () => void;
  searchInput: string;
  onSearchInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  classNames?: string;
}): JSX.Element => {
  const { translate } = useTranslation();
  const inputRef = createRef<HTMLInputElement>();

  const clearSearch = () => {
    inputRef?.current?.focus();
    onSearchInputChange({ target: { value: "" } } as ChangeEvent<HTMLInputElement>);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const searchBarClassNames = ClassNames(
    "settings-search col-xs-10 col-sm-6 col-md-6 col-lg-6",
    classNames,
  );

  return (
    <div className={searchBarClassNames} role="search">
      <div className="input-group">
        <form name="search-form" onSubmit={handleSubmit}>
          <div className="form-has-feedback">
            <input
              ref={inputRef}
              type="search"
              name="search-bar"
              id="settings-search-input"
              className="form-control input-field"
              onChange={onSearchInputChange}
              value={searchInput}
              placeholder={translate(commonTranslationConstants.search)}
              maxLength={120}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            {searchInput.length > 0 && (
              <span
                tabIndex={0}
                role="button"
                aria-label="Clear Search"
                onClick={clearSearch}
                onKeyDown={clearSearch}
                className="icon-actions-clear-sm"
              >
                <span />
              </span>
            )}
          </div>
        </form>
        <div className="input-group-btn">
          <button className="input-addon-btn" type="submit">
            <span className="icon-common-search-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
