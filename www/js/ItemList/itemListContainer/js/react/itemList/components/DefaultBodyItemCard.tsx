import React, { useState } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import translationConfig from '../../lookDetails/translation.config';

type TSelectableItemCardProps = {
  onDefaultBodySelectChanged: (useDefaultBody: boolean) => void;
};

export const DefaultBodyItemCard = ({
  onDefaultBodySelectChanged,
  translate
}: TSelectableItemCardProps & WithTranslationsProps): JSX.Element => {
  const [selected, setSelected] = useState<boolean>(true);
  const onChange = () => {
    setSelected(!selected);
    onDefaultBodySelectChanged(!selected);
  };
  return (
    <React.Fragment>
      <div className='item-list-item-card'>
        <div className='checkbox purchase-checkbox-container'>
          <input
            className='input-checkbox'
            id='checkbox-default-body'
            type='checkbox'
            checked={selected}
            onChange={onChange}
          />
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor='checkbox-default-body' />
        </div>
        <div className='list-item- item-card grid-item-container'>
          <div className='item-card-container'>
            <div>
              <div className='item-card-link'>
                <div className='item-card-thumb-container'>
                  <div className='item-card-thumb-container-inner'>
                    <Thumbnail2d
                      type={ThumbnailTypes.userOutfit}
                      targetId={327051961}
                      size={DefaultThumbnailSize}
                    />
                  </div>
                </div>
              </div>
              <div className='item-card-caption'>
                <div className='item-card-name-link'>
                  <div className='item-card-name'>{translate('Label.DefaultBody')}</div>
                  <div className='text-overflow item-card-price font-header-2 text-subheader margin-top-none'>
                    {translate('LabelFree')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='item-owned'>
          <span className='item-owned-icon' />
          <span className='item-owned-text'>{translate('Label.ItemOwned')}</span>
        </div>
      </div>
    </React.Fragment>
  );
};

export default withTranslations(DefaultBodyItemCard, translationConfig);
