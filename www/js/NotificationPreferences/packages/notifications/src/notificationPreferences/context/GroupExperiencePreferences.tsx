import React, { createContext, useContext, useState, useCallback } from 'react';
import { CurrentUser } from 'Roblox';
import {
  getExperienceDetails,
  enableExperienceNotifications,
  disableExperienceNotifications
} from '../services/NotificationPreferencesService';
import { ExperiencePreferenceData, GroupSettings } from '../types/NotificationPreferencesTypes';

const showMoreIncrement = 10;
const maxExperienceNameLength = 100;

export type GroupExperiencePreferencesState = {
  experienceDataList: ExperiencePreferenceData[];
  showMore: () => void;
  initGroupExperiencePreferencesList: (group: GroupSettings) => void;
  canShowMore: boolean;
  updateExperiencePreferences: (
    experienceData: ExperiencePreferenceData,
    newSelection: boolean
  ) => Promise<boolean>;
  isFetchingGamesInfo: boolean;
};

export const GroupExperiencePreferencesContext = createContext<GroupExperiencePreferencesState>({
  experienceDataList: [],
  showMore: () => undefined,
  initGroupExperiencePreferencesList: (group: GroupSettings) => Promise.resolve(),
  canShowMore: false,
  updateExperiencePreferences: (experienceData: ExperiencePreferenceData, newSelection: boolean) =>
    Promise.resolve(false),
  isFetchingGamesInfo: false
});

export const useGroupExperiencePreferencesContext = (): GroupExperiencePreferencesState => {
  return useContext(GroupExperiencePreferencesContext);
};

const ExperiencePreferencesProvider: React.FC = ({ children }) => {
  const [allExperiencePreferences, setAllExperiencePreferences] = useState<Array<number>>([]);
  const [experienceDataList, setExperienceDataList] = useState<ExperiencePreferenceData[]>([]);
  const [canShowMore, setCanShowMore] = useState<boolean>(false);
  const [isFetchingGamesInfo, setIsFetchingGamesInfo] = useState<boolean>(false);

  const truncateExperienceName = (experienceName: string, maxLength: number): string => {
    return experienceName.length > maxLength
      ? `${experienceName.slice(0, maxLength)}...`
      : experienceName;
  };

  const getExperienceInfo = useCallback(
    async (universeIds: number[]): Promise<ExperiencePreferenceData[] | null> => {
      setIsFetchingGamesInfo(true);
      const result = await getExperienceDetails({
        universeIds: universeIds.map(universeId => universeId.toString())
      });
      if (result) {
        const experienceData = result?.data.map(experience => {
          return {
            experienceName: experience.name,
            truncatedExperienceName: truncateExperienceName(
              experience.name,
              maxExperienceNameLength
            ),
            experienceCreator: experience.creator.name,
            id: experience.id,
            enabled: true
          };
        });
        setIsFetchingGamesInfo(false);
        return experienceData;
      }
      setIsFetchingGamesInfo(false);
      return null;
    },
    [setIsFetchingGamesInfo, getExperienceDetails]
  );

  const initGroupExperiencePreferencesList = async (
    experiencePreferences: GroupSettings
  ): Promise<void> => {
    if (experiencePreferences.notificationsEnabledExperiences) {
      setAllExperiencePreferences(experiencePreferences.notificationsEnabledExperiences);
      const experienceData = await getExperienceInfo(
        experiencePreferences.notificationsEnabledExperiences.slice(0, showMoreIncrement)
      );
      if (experienceData) {
        setExperienceDataList([...experienceDataList, ...experienceData]);
        setCanShowMore(
          experiencePreferences.notificationsEnabledExperiences.length > showMoreIncrement
        );
      }
    }
  };

  const preserveExperienceDataChanges = (
    experienceData: ExperiencePreferenceData,
    newExperienceData: ExperiencePreferenceData
  ) => {
    const index = experienceDataList.indexOf(experienceData);
    if (index > -1) {
      const updatedExperienceDataList = [...experienceDataList];
      updatedExperienceDataList[index] = newExperienceData;
      setExperienceDataList(updatedExperienceDataList);
    }
  };

  const updateExperiencePreferences = async (
    experienceData: ExperiencePreferenceData,
    newSelection: boolean
  ): Promise<boolean> => {
    if (newSelection) {
      const success = await enableExperienceNotifications(
        CurrentUser.userId,
        experienceData.id.toString()
      );
      if (success) {
        const newExperienceData: ExperiencePreferenceData = {
          experienceName: experienceData.experienceName,
          truncatedExperienceName: experienceData.truncatedExperienceName,
          experienceCreator: experienceData.experienceCreator,
          id: experienceData.id,
          enabled: true
        };

        preserveExperienceDataChanges(experienceData, newExperienceData);
      }
      return success;
    }
    const success = await disableExperienceNotifications(
      CurrentUser.userId,
      experienceData.id.toString()
    );
    if (success) {
      const newExperienceData: ExperiencePreferenceData = {
        experienceName: experienceData.experienceName,
        truncatedExperienceName: experienceData.truncatedExperienceName,
        experienceCreator: experienceData.experienceCreator,
        id: experienceData.id,
        enabled: false
      };

      preserveExperienceDataChanges(experienceData, newExperienceData);
    }
    return success;
  };

  const showMore = async (): Promise<void> => {
    if (canShowMore) {
      const endIndex = experienceDataList.length + showMoreIncrement;
      if (endIndex >= allExperiencePreferences.length) {
        setCanShowMore(false);
      }
      const experienceData = await getExperienceInfo(
        allExperiencePreferences.slice(experienceDataList.length, endIndex)
      );
      if (experienceData) {
        setExperienceDataList([...experienceDataList, ...experienceData]);
      }
    }
  };

  const value: GroupExperiencePreferencesState = {
    experienceDataList,
    showMore,
    initGroupExperiencePreferencesList,
    canShowMore,
    updateExperiencePreferences,
    isFetchingGamesInfo
  };

  return (
    <GroupExperiencePreferencesContext.Provider value={value}>
      {children}
    </GroupExperiencePreferencesContext.Provider>
  );
};

export default ExperiencePreferencesProvider;
