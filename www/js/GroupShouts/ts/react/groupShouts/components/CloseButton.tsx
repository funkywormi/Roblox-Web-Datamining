import React from 'react';
import classNames from 'classnames';
import { Button } from 'react-style-guide';

type CloseButtonProps = {
  className?: string;
  variant?: 'white';
  onClick: () => void;
};

const CloseButton = ({ className, variant, onClick }: CloseButtonProps): JSX.Element => {
  const iconClassName = variant ? `icon-close-${variant}` : 'icon-close';

  return (
    <Button
      variant={Button.variants.secondary}
      size={Button.sizes.extraSmall}
      width={Button.widths.default}
      className={classNames(className, 'close')}
      onClick={onClick}>
      <span className={iconClassName} />
    </Button>
  );
};

CloseButton.defaultProps = {
  className: undefined,
  variant: undefined
};

export default CloseButton;
