import React from 'react';
import classNames from 'classnames';
import { Button } from '@rbx/foundation-ui';
import { buttonVariants } from '../constants/buttonConstants';

type IdvButtonProps = {
  variant?: keyof typeof buttonVariants;
  className?: string;
  isDisabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

function IdvButton({
  variant = 'primary',
  className,
  isDisabled = false,
  onClick,
  children
}: IdvButtonProps): React.JSX.Element {
  return (
    <Button
      variant='Standard'
      size='Medium'
      className={classNames('idv-button', `idv-button-${variant}`, className)}
      isDisabled={isDisabled}
      onClick={onClick}>
      {children}
    </Button>
  );
}

export default IdvButton;
