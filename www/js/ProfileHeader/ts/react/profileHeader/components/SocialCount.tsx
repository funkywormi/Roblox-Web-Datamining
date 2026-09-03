import React, { CSSProperties } from 'react';
import { Typography } from '@rbx/ui';
import { abbreviateNumber, urlService } from 'core-utilities';

const SocialCount = ({
  label,
  count,
  profileId,
  subPage,
  isClickable
}: {
  label: string;
  count: number;
  profileId: number;
  subPage: string;
  isClickable: boolean;
}): JSX.Element => {
  const friendsUrl = `/users/${profileId}/friends#!/${subPage}`;
  let truncatedNumber = abbreviateNumber.getTruncValue(
    count,
    1000,
    abbreviateNumber.suffixNames.withoutPlus,
    1
  );
  const truncatedNumberHasDecimal = truncatedNumber.indexOf('.0');
  if (truncatedNumberHasDecimal !== -1) {
    truncatedNumber =
      truncatedNumber.substring(0, truncatedNumberHasDecimal) +
      truncatedNumber.substring(truncatedNumberHasDecimal + 2);
  }
  const tabIndex = isClickable ? 0 : -1;
  const style: CSSProperties = isClickable ? {} : { pointerEvents: 'none', cursor: 'default' };
  return (
    <li>
      <a
        className='profile-header-social-count'
        href={urlService.getAbsoluteUrl(friendsUrl)}
        title={`${count} ${label}`}
        style={style}
        tabIndex={tabIndex}>
        <Typography variant='body1'>
          <b>{truncatedNumber}</b>{' '}
          <span className='profile-header-social-count-label'>{label}</span>
        </Typography>
      </a>
    </li>
  );
};

export default SocialCount;
