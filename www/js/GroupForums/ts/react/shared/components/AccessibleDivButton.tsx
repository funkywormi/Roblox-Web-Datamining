import React from 'react';
import useKeyboardSelectHandler from '../hooks/useKeyboardSelectHandler';

type AccessibleDivButtonProps = {
  onClick?: () => void;
} & React.HTMLAttributes<HTMLDivElement>;

const AccessibleDivButton = ({
  onClick,
  children,
  ...otherProps
}: AccessibleDivButtonProps): JSX.Element => {
  const onKeyDown = useKeyboardSelectHandler(onClick);
  return (
    <div role='button' tabIndex={0} onClick={onClick} onKeyDown={onKeyDown} {...otherProps}>
      {children}
    </div>
  );
};

AccessibleDivButton.defaultProps = {
  onClick: undefined
};

export default AccessibleDivButton;
