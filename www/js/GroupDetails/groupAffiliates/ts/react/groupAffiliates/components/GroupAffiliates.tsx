import React from 'react';
import { useTranslation } from 'react-utilities';
import useGroupAffiliates from '../hooks/useGroupAffiliates';
import { RelationshipType } from '../services/groupAffiliatesService';
import GroupCard from '../../shared/components/GroupCard';
import Pager from '../../shared/components/Pager';

interface GroupAffiliatesProps {
  groupId: number;
  relationshipType: RelationshipType;
}

const relationshipLabels: Record<
  RelationshipType,
  { sectionTitle: string; noAffiliatesMessage: string }
> = {
  Allies: { sectionTitle: 'Heading.Allies', noAffiliatesMessage: 'Label.NoAllies' },
  Enemies: { sectionTitle: 'Heading.Enemies', noAffiliatesMessage: 'Label.NoEnemies' }
};

const GroupAffiliates: React.FC<GroupAffiliatesProps> = ({ groupId, relationshipType }) => {
  const { translate } = useTranslation();
  const { sectionTitle, noAffiliatesMessage } = relationshipLabels[relationshipType];
  const {
    affiliates,
    isLoading,
    hasError,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    loadNextPage,
    loadPrevPage
  } = useGroupAffiliates(groupId, relationshipType);

  const showEmptyMessage = !isLoading && affiliates.length === 0;
  const showPager = affiliates.length > 0;

  return (
    <div>
      <div className='container-header'>
        <h2>{translate(sectionTitle)}</h2>
        {showPager && (
          <Pager
            currentPage={currentPage + 1}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onNextPage={loadNextPage}
            onPrevPage={loadPrevPage}
          />
        )}
      </div>
      <div className='group-affiliates'>
        {isLoading && <div className='spinner spinner-default' />}
        {showEmptyMessage && (
          <div className='section-content-off'>
            {hasError
              ? translate('Message.GetGroupRelationshipsError')
              : translate(noAffiliatesMessage)}
          </div>
        )}
        {!isLoading && affiliates.length > 0 && (
          <ul className='hlist game-cards'>
            {affiliates.map(group => (
              <li key={group.id} className='list-item'>
                <GroupCard group={group} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GroupAffiliates;
