import React, { useEffect, useState } from 'react';
import '../../../../css/shared/banner.scss';

export enum BannerType {
  ERROR = 'error',
  WARNING = 'warning'
}

type BannerProps = {
  title: string;
  body: JSX.Element;
  bannerType: BannerType;
  showDismiss: boolean;
  onDismiss: () => void;
};

const Banner: React.FC<BannerProps> = ({ title, body, bannerType, showDismiss, onDismiss }) => {
  const [containerClass, setContainerClass] = useState('');

  useEffect(() => {
    switch (bannerType) {
      case BannerType.WARNING:
        setContainerClass('warning-banner');
        break;
      case BannerType.ERROR:
        setContainerClass('error-banner');
        break;
      default:
        break;
    }
  }, [bannerType]);

  return (
    <div className={`banner-container ${containerClass}`}>
      <div className='icon-status-alert banner-icon' />
      <div className='message'>
        <span className='font-header-2 banner-title'>{title}</span>
        {body}
      </div>
      {showDismiss && (
        <button type='button' className='banner-close-button' onClick={() => onDismiss()}>
          <span className='icon-close banner-icon' />
        </button>
      )}
    </div>
  );
};

export default Banner;
