import classNames from "classnames";
import React, { useCallback, useState } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { translationConfig } from "../translation.config";
import { translations } from "../constants/Constants";
import "../css/giftMessageDropdown.scss";

const {
  includeMessage: { key: includeMessage, default: includeMessageDefault },
} = translations;

type GiftMessageDropdownProps = {
  selectedMessage: string;
  messages: string[];
  onSelectGiftMessage: (giftMessageTranslationKey: string) => void;
} & WithTranslationsProps;

const GiftMessageDropdown: React.FC<GiftMessageDropdownProps> = ({
  selectedMessage,
  messages,
  onSelectGiftMessage,
  translate,
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const handleDropdownClick = useCallback(() => {
    setShowDropdown(!showDropdown);
  }, [showDropdown]);
  const handleMessageClick = useCallback(
    (message: string) => {
      setShowDropdown(false);
      onSelectGiftMessage(message);
    },
    [onSelectGiftMessage],
  );

  return (
    <div className="gift-message-dropdown">
      <label id="gift-message-dropdown-label" htmlFor="gift-message-dropdown-button">
        {translate(includeMessage) || includeMessageDefault}
      </label>
      <button
        id="gift-message-dropdown-button"
        type="button"
        role="combobox"
        className="select-button"
        aria-labelledby="gift-message-dropdown-button"
        aria-describedby="gift-message-dropdown-label"
        aria-haspopup="listbox"
        aria-expanded={showDropdown}
        aria-controls="gift-message-dropdown"
        onClick={handleDropdownClick}
      >
        <p>{translate(selectedMessage)}</p>
        <span className={showDropdown ? "icon-up" : "icon-down"} />
      </button>
      <div
        id="gift-message-dropdown"
        role="listbox"
        className={classNames("select-dropdown", { active: showDropdown })}
      >
        {messages.map(giftMessage => (
          <button
            type="button"
            key={giftMessage}
            onClick={() => {
              handleMessageClick(giftMessage);
            }}
          >
            <p>{translate(giftMessage)}</p>
            {selectedMessage === giftMessage && <span className="icon-checkmark" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default withTranslations(GiftMessageDropdown, translationConfig);
