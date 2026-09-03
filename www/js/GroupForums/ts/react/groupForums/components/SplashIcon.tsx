import React, { FC } from 'react';
import { Icon, TIconProps } from '@rbx/foundation-ui';

type SplashIconProps = {
  iconName: TIconProps['name'];
};

const SplashIcon: FC<SplashIconProps> = ({ iconName }) => {
  return (
    <div className='relative flex items-center justify-center width-2200 height-2200'>
      <div
        className='absolute width-1800 height-1800 stroke-standard stroke-emphasis radius-small'
        style={{
          transform: 'rotate(-15deg)'
        }}
      />
      <Icon
        name={iconName}
        size='XLarge'
        style={{ width: 'var(--size-1200)', height: 'var(--size-1200)' }}
      />
    </div>
  );
};

export default SplashIcon;
