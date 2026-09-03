import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { Link } from 'react-style-guide';
import {
  Thumbnail2d,
  ThumbnailTypes,
  DefaultThumbnailSize,
  ThumbnailFormat
} from 'roblox-thumbnails';
import badgeConstants from '../constants/badgeConstants';
import badgeTypes from '../../badgeData/constants/badgeTypes';

function BadgeCardComponent({ badgeData, badgeType }) {
  const { id, name, description } = badgeData;

  let badgeUrl = '';
  let imageElement = '';
  let imageClasses = '';
  switch (badgeType) {
    case badgeTypes.player:
      badgeUrl = badgeConstants.getPlayerBadgeUrl(id, name);
      imageElement = (
        <Thumbnail2d
          type={ThumbnailTypes.badgeIcon}
          size={DefaultThumbnailSize}
          targetId={id}
          imgClassName='asset-thumb-container'
          format={ThumbnailFormat.webp}
          altName={description}
        />
      );
      break;
    case badgeTypes.roblox:
    default:
      badgeUrl = badgeConstants.getRobloxBadgeUrl(id);
      imageClasses = ClassNames('border asset-thumb-container', [
        badgeConstants.getBadgeIconName(id)
      ]);
      imageElement = <span className={imageClasses} title={name} />;
      break;
  }

  return (
    <li className='list-item asset-item' data-testid={badgeUrl}>
      <Link url={badgeUrl} title={description}>
        {imageElement}
        <span className='font-header-2 text-overflow item-name'>{name}</span>
      </Link>
    </li>
  );
}

BadgeCardComponent.propTypes = {
  badgeData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    iconImageId: PropTypes.number
  }).isRequired,
  badgeType: PropTypes.string.isRequired
};

export default BadgeCardComponent;
