import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, MoreHorizIcon } from '@rbx/ui';
import constants from '../constants/profileHeaderConstants';

const ProfileDropdown = ({
  buttons,
  translate,
  onDropdownWillOpen
}: {
  buttons: { id: string; label: string; onClick: () => void }[];
  translate: (key: string) => string;
  /**
   * Method called when the dropdown is about to open.
   */
  onDropdownWillOpen?: () => void;
}): JSX.Element => {
  const [anchor, setAnchor] = useState<Element | null>(null);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchor(e.currentTarget);
    if (onDropdownWillOpen) {
      onDropdownWillOpen();
    }
  };

  return (
    <React.Fragment>
      <IconButton
        aria-label={translate(constants.translationKeys.buttons.openDropdown)}
        size='medium'
        variant='default'
        color='default'
        className='profile-header-dropdown'
        onClick={handleOpen}>
        <MoreHorizIcon className='profile-header-more-icon' />
      </IconButton>
      <Menu
        id='profile-header-dropdown-menu'
        variant='menu'
        anchorEl={anchor}
        open={anchor != null}
        onClose={() => setAnchor(null)}>
        {buttons.map(({ id, onClick, label }) => (
          <MenuItem
            onClick={() => {
              setAnchor(null);
              onClick();
            }}
            key={label}
            id={id}>
            <span className='profile-header-dropdown-label'>{translate(label)}</span>
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  );
};

export default ProfileDropdown;
