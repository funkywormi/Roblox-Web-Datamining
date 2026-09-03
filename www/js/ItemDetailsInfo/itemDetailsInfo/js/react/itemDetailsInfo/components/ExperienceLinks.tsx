import React, { Fragment } from 'react';
import { eventStreamService } from 'core-roblox-utilities';
import { TAssetItemDetails, TBundleItemDetails, TExperience } from '../constants/types';
import { catalogTranslations } from '../services/translationService';
import eventStreamConstants from '../constants/eventStreamConstants';

export default function ExperienceLinks({
  collectibleItemDetails,
  itemType
}: {
  collectibleItemDetails: TAssetItemDetails | TBundleItemDetails;
  itemType: string;
}): JSX.Element {
  const onClickExperienceLink = (experienceId: string) => {
    const params = eventStreamConstants.experienceLinkClicked({
      experienceId,
      itemId: collectibleItemDetails.id,
      itemType,
      collectiblesItemId: collectibleItemDetails.collectibleItemId ?? null
    });
    eventStreamService.sendEvent(...params);
  };

  return (
    <Fragment>
      {!!collectibleItemDetails.experiences && collectibleItemDetails.experiences.length > 0 && (
        <div className='clearfix item-info-row-container'>
          <div className='font-header-1 text-subheader text-label text-overflow row-label'>
            {catalogTranslations.labelSoldIn()}
          </div>
          <div className='experience-link-list'>
            {collectibleItemDetails.experiences.map((experience: TExperience) => (
              <li key={experience.id} className='experience-link-list-item'>
                <a
                  onClick={() => onClickExperienceLink(experience.id)}
                  className='text-link label-text text-overflow'
                  href={experience.detailPageLink}>
                  <span className='icon-menu-games-on' />
                  {experience.name}
                </a>
              </li>
            ))}
          </div>
        </div>
      )}
    </Fragment>
  );
}
