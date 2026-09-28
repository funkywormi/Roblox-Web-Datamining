import React from "react";
import { Button, IconButton, Popover } from "react-style-guide";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { popoverPadding } from "../../../constants/parentalControls/friendManagementConstants";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";

export const FriendManageMenu = ({
  id,
  profileUrl,
  reportUrl,
  onOpen,
  onViewProfile,
  onBlock,
  onReport,
}: {
  id: string;
  profileUrl: string;
  reportUrl: string;
  onOpen?: () => void;
  onViewProfile?: () => void;
  onBlock: () => void;
  onReport?: () => void;
}): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const { friendManagement } = parentalControlsTranslationConstants;

  return (
    <Popover
      id={id}
      button={
        <IconButton
          className="friend-management-menu"
          iconName="overflow-vertical"
          size={IconButton.sizes.small}
          onClick={() => onOpen?.()}
          altName={translate(commonTranslationConstants.manage)}
        />
      }
      trigger="click"
      containerPadding={popoverPadding}
      placement="bottom"
    >
      <ul className="dropdown-menu" role="menu">
        <li>
          <a href={profileUrl} onClick={onViewProfile}>
            {translate(friendManagement.viewProfile)}
          </a>
        </li>

        <li>
          <Button variant={Button.variants.secondary} onClick={onBlock}>
            {translate(friendManagement.block)}
          </Button>
        </li>

        <li>
          <a href={reportUrl} onClick={onReport}>
            {translate(friendManagement.report)}
          </a>
        </li>
      </ul>
    </Popover>
  );
};

export default FriendManageMenu;
