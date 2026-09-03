import React from 'react';
import classNames from 'classnames';
import { Button } from 'react-style-guide';

type Props = {
  className?: string;
  label: string;
  variant?: string;
  size?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  iconURL?: string;
  openInNewTab?: boolean;
};

const LinkableButton = ({
  className,
  label,
  variant = Button.variants.primary,
  size = Button.sizes.medium,
  href,
  onClick,
  disabled,
  iconURL,
  openInNewTab
}: Props): JSX.Element => {
  const Component = href ? 'a' : 'button';
  const linkProps = href
    ? { href, target: openInNewTab ? '_blank' : '_self', rel: 'noopener' }
    : {};

  return (
    <Component
      className={classNames(className, `btn-${variant}-${size}`)}
      onClick={onClick}
      disabled={disabled}
      role='button'
      {...linkProps}>
      <span className='linkable-button-content-container'>
        {iconURL && <img src={iconURL} alt='' className='linkable-button-content-container-icon' />}
        {label}
      </span>
    </Component>
  );
};

LinkableButton.defaultProps = {
  variant: Button.variants.primary,
  size: Button.sizes.medium,
  href: undefined,
  onClick: undefined,
  disabled: false,
  iconURL: undefined,
  openInNewTab: true
};

export default LinkableButton;
