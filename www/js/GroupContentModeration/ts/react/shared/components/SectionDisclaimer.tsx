import React from 'react';
import classNames from 'classnames';
import { Button } from '@rbx/foundation-ui';

type SectionDisclaimerProps = {
  className?: string;
  iconClassName: string;
  heading?: string;
  message: string;
  buttonText?: string;
  onClick?: () => void;
};

const SectionDisclaimer = ({
  className,
  iconClassName,
  heading,
  message,
  buttonText,
  onClick
}: SectionDisclaimerProps): JSX.Element => {
  return (
    <div
      className={classNames(
        className,
        'section-disclaimer section-content-off flex flex-col items-center justify-center grow'
      )}>
      <span className={iconClassName} />
      {heading && <h2>{heading}</h2>}
      <span>{message}</span>
      {buttonText && (
        <Button size='Medium' variant='Standard' onClick={onClick}>
          {buttonText}
        </Button>
      )}
    </div>
  );
};

SectionDisclaimer.defaultProps = {
  className: undefined,
  buttonText: undefined,
  onClick: undefined
};

export default SectionDisclaimer;
