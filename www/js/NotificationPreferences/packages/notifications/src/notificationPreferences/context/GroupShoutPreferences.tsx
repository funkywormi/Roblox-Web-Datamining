import React, { createContext, useContext, useState, useCallback } from 'react';
import { CurrentUser } from 'Roblox';
import {
  getGroupShoutDetails,
  toggleGroupShoutNotifications
} from '../services/NotificationPreferencesService';
import {
  GroupShoutPreferenceData,
  GroupSettings,
  CommunityNotificationPreferenceType
} from '../types/NotificationPreferencesTypes';

const showMoreIncrement = 10;
const maxGroupNameLength = 100;

export type GroupShoutPreferencesState = {
  groupShoutDataList: GroupShoutPreferenceData[];
  showMore: () => void;
  initGroupShoutPreferencesList: (group: GroupSettings) => void;
  canShowMore: boolean;
  updateGroupShoutPreferences: (
    groupData: GroupShoutPreferenceData,
    newSelection: boolean,
    type: CommunityNotificationPreferenceType
  ) => Promise<boolean>;
  isFetchingGroupsInfo: boolean;
};

export const GroupShoutPreferencesContext = createContext<GroupShoutPreferencesState>({
  groupShoutDataList: [],
  showMore: () => undefined,
  initGroupShoutPreferencesList: (group: GroupSettings) => Promise.resolve(),
  canShowMore: false,
  updateGroupShoutPreferences: (
    groupData: GroupShoutPreferenceData,
    newSelection: boolean,
    type: CommunityNotificationPreferenceType
  ) => Promise.resolve(false),
  isFetchingGroupsInfo: false
});

export const useGroupShoutPreferencesContext = (): GroupShoutPreferencesState => {
  return useContext(GroupShoutPreferencesContext);
};

const GroupShoutPreferencesProvider: React.FC = ({ children }) => {
  const [allGroupShoutPreferences, setAllGroupShoutPreferences] = useState<
    GroupShoutPreferenceData[]
  >([]);
  const [groupShoutDataList, setGroupShoutDataList] = useState<GroupShoutPreferenceData[]>([]);
  const [canShowMore, setCanShowMore] = useState<boolean>(false);
  const [isFetchingGroupsInfo, setIsFetchingGroupsInfo] = useState<boolean>(false);

  const truncateGroupName = (groupName: string, maxLength: number): string => {
    return groupName.length > maxLength ? `${groupName.slice(0, maxLength)}...` : groupName;
  };

  const getGroupShoutInfo = useCallback(async (): Promise<GroupShoutPreferenceData[] | null> => {
    setIsFetchingGroupsInfo(true);

    const result = await getGroupShoutDetails(CurrentUser.userId);

    if (!result) {
      setIsFetchingGroupsInfo(false);
      return null;
    }

    const groupData = result.data.map(groupNotificationsDetails => {
      return {
        groupName: groupNotificationsDetails.group.name,
        truncatedGroupName: truncateGroupName(
          groupNotificationsDetails.group.name,
          maxGroupNameLength
        ),
        creatorName: groupNotificationsDetails.group.owner?.displayName,
        groupId: groupNotificationsDetails.group.id,
        notificationPreferences: groupNotificationsDetails.notificationPreferences
      };
    });

    setIsFetchingGroupsInfo(false);
    return groupData;
  }, [setIsFetchingGroupsInfo, getGroupShoutDetails]);

  const initGroupShoutPreferencesList = async (
    groupShoutPreferences: GroupSettings
  ): Promise<void> => {
    if (groupShoutPreferences.notificationsEnabledGroups) {
      const allGroupShoutData = await getGroupShoutInfo();
      if (allGroupShoutData) {
        setAllGroupShoutPreferences(allGroupShoutData);
        const groupShoutData = allGroupShoutData.slice(0, showMoreIncrement);
        setGroupShoutDataList([...groupShoutDataList, ...groupShoutData]);
        setCanShowMore(allGroupShoutData.length > showMoreIncrement);
      }
    }
  };

  const preserveGroupShoutDataChanges = (
    groupShoutData: GroupShoutPreferenceData,
    newGroupShoutData: GroupShoutPreferenceData
  ) => {
    const index = groupShoutDataList.indexOf(groupShoutData);
    if (index > -1) {
      const updatedGroupShoutDataList = [...groupShoutDataList];
      updatedGroupShoutDataList[index] = newGroupShoutData;
      setGroupShoutDataList(updatedGroupShoutDataList);
    }
  };

  const updateGroupShoutPreferences = async (
    groupShoutData: GroupShoutPreferenceData,
    newSelection: boolean,
    type: CommunityNotificationPreferenceType
  ): Promise<boolean> => {
    const groupId = groupShoutData.groupId.toString();

    const success = await toggleGroupShoutNotifications(groupId, newSelection, type);
    const notificationPreferences = [...groupShoutData.notificationPreferences];
    const preferenceData = notificationPreferences.find(data => data.type === type);
    if (preferenceData) {
      preferenceData.enabled = newSelection;
    } else {
      return false;
    }

    if (success) {
      const newGroupShoutData: GroupShoutPreferenceData = {
        groupName: groupShoutData.groupName,
        truncatedGroupName: groupShoutData.truncatedGroupName,
        creatorName: groupShoutData.creatorName,
        groupId: groupShoutData.groupId,
        notificationPreferences
      };
      preserveGroupShoutDataChanges(groupShoutData, newGroupShoutData);
    }

    return success;
  };

  const showMore = (): void => {
    if (canShowMore) {
      const endIndex = groupShoutDataList.length + showMoreIncrement;
      if (endIndex >= allGroupShoutPreferences.length) {
        setCanShowMore(false);
      }

      const groupShoutData = allGroupShoutPreferences.slice(groupShoutDataList.length, endIndex);
      setGroupShoutDataList([...groupShoutDataList, ...groupShoutData]);
    }
  };

  const value: GroupShoutPreferencesState = {
    groupShoutDataList,
    showMore,
    initGroupShoutPreferencesList,
    canShowMore,
    updateGroupShoutPreferences,
    isFetchingGroupsInfo
  };

  return (
    <GroupShoutPreferencesContext.Provider value={value}>
      {children}
    </GroupShoutPreferencesContext.Provider>
  );
};

export default GroupShoutPreferencesProvider;
