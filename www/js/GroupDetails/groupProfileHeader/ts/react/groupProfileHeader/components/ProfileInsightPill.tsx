import React from 'react';
import classNames from 'classnames';
import '../../../../css/groupProfileHeader/_profileInsightPill.scss';

type ProfileInsightPillProps = {
  title?: string;
  onClick?: () => void;
};

const ProfileInsightPill: React.FC<ProfileInsightPillProps> = ({ title, onClick, children }) => {
  const baseClasses =
    'flex items-center bg-surface-300 radius-circle text-caption-medium padding-x-medium padding-y-xsmall';

  if (onClick) {
    return (
      <button
        type='button'
        title={title}
        onClick={onClick}
        className={classNames(baseClasses, 'cursor-pointer profile-insight-pill-button')}
        style={{ border: 'none' }}>
        {children}
      </button>
    );
  }

  return (
    <span title={title} className={baseClasses}>
      {children}
    </span>
  );
};

export default ProfileInsightPill;
