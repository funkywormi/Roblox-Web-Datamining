import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { Button } from 'react-style-guide';
import { GroupsListGroup } from '../types';
import groupsListConstants from '../constants/groupsListConstants';
import GroupListItem from './GroupListItem';
import LinkableButton from '../../shared/components/LinkableButton';

export interface GroupsListProps {
  currentGroup?: GroupsListGroup;
  groupsList: GroupsListGroup[];
  canCreateGroup: boolean;
  isSidebar?: boolean;
  isLoadingGroups: boolean;
  loadFailure: boolean;
  showRanks: boolean;
  showMemberCounts: boolean;
  showButtonsOnTop: boolean;
}

const GroupsList = ({
  currentGroup,
  groupsList = [],
  canCreateGroup,
  isSidebar,
  isLoadingGroups,
  loadFailure,
  showRanks,
  showMemberCounts,
  showButtonsOnTop
}: GroupsListProps): JSX.Element => {
  const { translate } = useTranslation();
  const [searchInputValue, setSearchInputValue] = useState('');

  const filteredGroups = useMemo(() => {
    return groupsList.filter(group => {
      if (searchInputValue) {
        return group.name.toLowerCase().includes(searchInputValue.toLowerCase());
      }
      return true;
    });
  }, [groupsList, searchInputValue]);

  const primaryGroup = useMemo(() => {
    return filteredGroups.find(group => {
      return group.isPrimary;
    });
  }, [filteredGroups]);

  const otherGroups = useMemo(() => {
    return filteredGroups.filter(group => {
      return !group.isPrimary;
    });
  }, [filteredGroups]);

  const disclaimer = useMemo(() => {
    if (isLoadingGroups) {
      return null;
    }
    if (loadFailure) {
      return translate('Message.LoadGroupListError');
    }
    if (!groupsList.length) {
      return translate('Message.NotInAnyGroups');
    }
    if (!!searchInputValue && !filteredGroups.length) {
      return translate('Message.NoGroupsFound');
    }
    return null;
  }, [
    groupsList.length,
    filteredGroups.length,
    isLoadingGroups,
    loadFailure,
    searchInputValue,
    translate
  ]);

  // this is a workaround because CSS :has selector only has ~95% global browser coverage
  // we can remove this once the sidebar is rolled out to all users
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (isSidebar) {
      const wraps = document.getElementsByClassName('wrap');
      if (wraps.length) {
        const wrap = wraps[0];
        const sidebarClass = 'has-groups-list-sidebar';
        wrap.classList.add(sidebarClass);
        return () => {
          wrap.classList.remove(sidebarClass);
        };
      }
    }
  }, [isSidebar]);

  const createGroupButton = (
    <LinkableButton
      className='groups-list-create-button'
      href={groupsListConstants.urls.createGroupUrl}
      variant={Button.variants.control}
      size={Button.sizes.medium}
      disabled={!canCreateGroup}
      openInNewTab={false}
      label={translate('Action.CreateGroup')}
    />
  );

  return (
    <div className='groups-list-new'>
      <div className='flex justify-between items-baseline'>
        <h1 className='groups-list-heading'>{translate('Heading.Groups')}</h1>
        <a className='text-label-medium' href={groupsListConstants.urls.groupSearchUrl}>
          {translate('Action.SeeAll')}
        </a>
      </div>
      <div className='groups-list-search'>
        <span className='icon-common-search-sm' />
        <input
          placeholder={translate('Label.SearchMyGroups')}
          className='groups-list-search-input'
          maxLength={50}
          value={searchInputValue}
          onChange={e => {
            const newValue = e.target.value;
            setSearchInputValue(newValue);
          }}
          autoComplete='off'
          autoCorrect='off'
          spellCheck='false'
          type='text'
        />
      </div>
      {showButtonsOnTop && <div className='groups-list-buttons-top'>{createGroupButton}</div>}
      {!!disclaimer && <div className='padding-y-medium'>{disclaimer}</div>}
      {isLoadingGroups && (
        <div className='padding-y-medium'>
          <div className='width-full height-1000 radius-medium bg-shift-100 shimmer' />
        </div>
      )}
      <div className='groups-list-items-container'>
        {!!primaryGroup && (
          <div className='padding-bottom-small'>
            <span className='text-caption-large padding-top-small padding-bottom-small block'>
              {translate('Heading.Primary')}
            </span>
            <div>
              <GroupListItem
                group={primaryGroup}
                isActive={currentGroup?.id === primaryGroup.id}
                showRank={showRanks}
                showMemberCount={showMemberCounts}
                isSidebar={isSidebar}
              />
            </div>
          </div>
        )}
        {!!otherGroups.length && (
          <div className='padding-bottom-small'>
            {!!primaryGroup && (
              <span className='text-caption-large padding-top-small padding-bottom-small block'>
                {translate('Heading.MyGroups')}
              </span>
            )}
            <div>
              {otherGroups.map(group => (
                <GroupListItem
                  key={group.id}
                  group={group}
                  isActive={currentGroup?.id === group.id}
                  showRank={showRanks}
                  showMemberCount={showMemberCounts}
                  isSidebar={isSidebar}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {!showButtonsOnTop && <div className='groups-list-buttons-bottom'>{createGroupButton}</div>}
    </div>
  );
};

export default GroupsList;
