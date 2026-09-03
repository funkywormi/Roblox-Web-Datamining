import React, { cloneElement } from 'react';
import { PopoverTrigger } from '@rbx/foundation-ui';

export type MenuTriggerProps = {
  button: JSX.Element;
  onToggle: () => void;
};

/**
 * PopoverTrigger skips its own toggle when the child's onClick default-prevents — which call sites
 * do, so the surrounding link doesn't navigate. Drive the open state ourselves instead.
 */
const MenuTrigger = ({ button, onToggle }: MenuTriggerProps): JSX.Element => {
  const { onClick } = button.props as {
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  };

  return (
    <PopoverTrigger asChild>
      {cloneElement(button, {
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          onClick?.(event);
          event.preventDefault();
          onToggle();
        }
      })}
    </PopoverTrigger>
  );
};

export default MenuTrigger;
