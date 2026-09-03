import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-utilities';
import LazyItemCarousel from '../../shared/components/LazyItemCarousel';
import ExperienceTile from '../components/ExperienceTile';
import groupExperiencesService from '../services/groupExperiencesService';
import groupExperiencesConstants from '../constants/groupExperiencesConstants';
import { GroupExperience } from '../types';

export interface GroupExperiencesProps {
  groupId: number;
}

const GroupExperiences = ({ groupId }: GroupExperiencesProps): JSX.Element => {
  const { translate } = useTranslation();

  const [experiences, setExperiences] = useState<GroupExperience[]>([]);
  const [fetchError, setFetchError] = useState<Error>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cursor, setCursor] = useState<string>();

  const loadMore = useCallback(async () => {
    try {
      const response = await groupExperiencesService.getDetailedGroupExperiences(groupId, {
        limit: groupExperiencesConstants.limits.experiencesPerPage,
        cursor
      });
      setExperiences(prevExperiences => [...prevExperiences, ...response.data]);
      setCursor(response.nextPageCursor);
    } catch (error) {
      setFetchError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, groupId]);

  // eslint-disable-next-line no-void
  useEffect(() => void loadMore(), []);

  if (isLoading) {
    return (
      <div className='group-experiences-container group-section-content flex justify-center items-center'>
        <span className='spinner spinner-default' />
      </div>
    );
  }

  if (experiences.length === 0) {
    return (
      <div className='group-experiences-container group-section-content flex justify-center items-center'>
        {translate(fetchError ? 'Message.LoadGroupGamesError' : 'Label.NoGames')}
      </div>
    );
  }

  return (
    <div className='group-experiences-container group-section-content-transparent'>
      <LazyItemCarousel onLoadMore={loadMore} hasMore={!!cursor}>
        {experiences.map(experience => (
          <ExperienceTile key={experience.id} experience={experience} />
        ))}
      </LazyItemCarousel>
    </div>
  );
};

export default GroupExperiences;
