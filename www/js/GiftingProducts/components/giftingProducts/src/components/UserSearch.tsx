import classNames from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { Thumbnail2d } from "roblox-thumbnails";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { translationConfig } from "../translation.config";
import { translations, USER_SEARCH_MAX_CHARACTERS } from "../constants/Constants";
import useUserSearch from "../hooks/useUserSearch";
import { OmniSearchUser } from "../services/userSearchService";

const {
  searchUsername: { key: searchUsername, default: searchUsernameDefault },
  noResultsFound: { key: noResultsFound, default: noResultsFoundDefault },
} = translations;

type UserSearchItemProps = {
  user: OmniSearchUser;
  onSelectUser: (userId: number) => void;
  isFocused?: boolean;
};

const UserSearchItem: React.FC<UserSearchItemProps> = ({ user, onSelectUser, isFocused }) => {
  const userName = user.username ? `@${user.username}` : "";
  const itemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isFocused && itemRef.current) {
      itemRef.current.scrollIntoView({ block: "nearest", behavior: "auto" });
    }
  }, [isFocused]);

  return (
    <button
      ref={itemRef}
      className={classNames("user-search-item", { focused: isFocused })}
      type="button"
      key={user.contentId}
      onClick={() => {
        onSelectUser(user.contentId);
      }}
      role="option"
      id={`user-${user.contentId}`}
      aria-selected={isFocused}
      aria-label={`${user.displayName} ${userName}`}
    >
      <div className="user-search-item-container">
        <div className="user-search-item-thumbnail" aria-hidden="true">
          <Thumbnail2d
            targetId={user.contentId || ""}
            type="AvatarHeadshot"
            size="48x48"
            format="png"
          />
        </div>
        <div className="user-search-item-info">
          <div className="user-search-item-name">{user.displayName}</div>
          {userName && <div className="user-search-item-username">{userName}</div>}
        </div>
      </div>
    </button>
  );
};

type UserSearchProps = {
  onSelectUser: (userId: number) => void;
} & WithTranslationsProps;

const UserSearch: React.FC<UserSearchProps> = ({ onSelectUser, translate }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isSearching, searchText, setSearchText, users, clearSearch } = useUserSearch();
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [users]);

  const handleSelectUser = (userId: number) => {
    onSelectUser(userId);
    clearSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (users.length === 0) return;
    const [user] = users;
    const focusedUser = users[focusedIndex];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => (prev < users.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case "Home":
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setFocusedIndex(users.length - 1);
        break;
      case "Enter":
      case "NumpadEnter":
        e.preventDefault();
        if (user) {
          handleSelectUser(user.contentId);
          break;
        }

        if (focusedUser) {
          handleSelectUser(focusedUser.contentId);
        }
        break;
      case "Escape":
        e.preventDefault();
        clearSearch();
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="user-search-container"
      role="combobox"
      aria-haspopup="listbox"
      aria-controls="user-search-listbox"
      aria-expanded={users.length > 0}
    >
      <div className="user-search-input">
        <input
          ref={inputRef}
          type="search"
          value={searchText}
          className="form-control input-field"
          placeholder={translate(searchUsername) || searchUsernameDefault}
          maxLength={USER_SEARCH_MAX_CHARACTERS}
          autoComplete="off"
          onChange={e => {
            setSearchText(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-activedescendant={
            focusedIndex >= 0 ? `user-${users[focusedIndex]?.contentId ?? ""}` : undefined
          }
          aria-label={translate(searchUsername) || searchUsernameDefault}
        />
        <span className="icon-common-search-sm" aria-hidden="true" />
      </div>
      {users.length > 0 ? (
        <div
          id="user-search-listbox"
          role="listbox"
          className={classNames("user-search-dropdown", { active: true })}
        >
          {users.map((user, index) => (
            <UserSearchItem
              key={user.contentId}
              user={user}
              onSelectUser={handleSelectUser}
              isFocused={index === focusedIndex}
            />
          ))}
        </div>
      ) : (
        !isSearching &&
        searchText.length > 0 && (
          <div
            id="user-search-listbox"
            role="listbox"
            className={classNames("user-search-dropdown", { active: true })}
          >
            <div
              className="user-search-no-results"
              role="option"
              aria-selected="false"
              aria-label={translate(noResultsFound) || noResultsFoundDefault}
            >
              {translate(noResultsFound) || noResultsFoundDefault}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default withTranslations(UserSearch, translationConfig);
