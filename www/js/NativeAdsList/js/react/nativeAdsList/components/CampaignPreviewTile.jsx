import React from 'react';
import PropTypes from 'prop-types';
import {
  Thumbnail2d,
  ThumbnailTypes,
  DefaultThumbnailSize,
  ThumbnailFormat
} from 'roblox-thumbnails';
import CampaignTargetType from '../../../../ts/react/enums/campaignTargetType';

function CampaignPreviewTile({ translate, campaignTarget }) {
  const { name, targetType, targetId } = campaignTarget;

  let thumbnailType;
  if (targetType === CampaignTargetType.Universe) {
    thumbnailType = ThumbnailTypes.gameIcon;
  } else if (targetType === CampaignTargetType.Asset) {
    thumbnailType = ThumbnailTypes.assetThumbnail;
  }

  const thumbnail = (
    <Thumbnail2d
      type={thumbnailType}
      size={DefaultThumbnailSize}
      targetId={targetId}
      imgClassName='game-card-thumb'
      format={ThumbnailFormat.webp}
    />
  );

  return (
    <div className='campaign-preview-panel'>
      <h2 className='ad-preview-title'>{translate('Heading.AdPreview')}</h2>
      <div className='game-card sponsored-game preview-element'>
        <div className='game-card-container'>
          <div className='game-card-thumb-container'>
            <span className='game-card-thumb'>{thumbnail}</span>
          </div>
          <div className='game-card-name game-name-title'>{name}</div>
        </div>
      </div>
    </div>
  );
}

CampaignPreviewTile.propTypes = {
  translate: PropTypes.func.isRequired,
  campaignTarget: PropTypes.shape({
    name: PropTypes.string,
    targetType: PropTypes.string,
    targetId: PropTypes.number
  }).isRequired
};

export default CampaignPreviewTile;
