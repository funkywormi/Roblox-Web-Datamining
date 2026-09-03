import React, { useState, createContext, useContext, useCallback } from 'react';
import { ExperimentationService } from 'Roblox';
import { layers } from '../../shared/constants/experimentConstants';
import { ForumNotificationsExperimentConfig, ForumExperimentsState } from '../types';

export const ForumExperimentsContext = createContext<ForumExperimentsState | undefined>(undefined);

export const useForumExperiments = (): ForumExperimentsState => {
  const resource = useContext(ForumExperimentsContext);
  if (!resource) {
    throw new Error('useForumExperiments must be used within a ForumExperimentsProvider');
  }
  return resource;
};

interface ForumExperimentsProviderProps {
  children: React.ReactNode;
}

export function ForumExperimentsProvider({ children }: ForumExperimentsProviderProps): JSX.Element {
  const [
    subscriberNotificationsExperimentConfig,
    setSubscriberNotificationsExperimentConfig
  ] = useState<ForumNotificationsExperimentConfig | null>(null);

  const fetchSubscriberExperimentValues = useCallback(async () => {
    if (subscriberNotificationsExperimentConfig != null) {
      return;
    }

    try {
      const response = await ExperimentationService.getAllValuesForLayer(
        layers.forumSubscriberNotifications
      );
      const experimentConfig = response?.forumNotificationsConfig as ForumNotificationsExperimentConfig | null;
      setSubscriberNotificationsExperimentConfig(experimentConfig);
    } catch (e) {
      setSubscriberNotificationsExperimentConfig(null);
    }
  }, [setSubscriberNotificationsExperimentConfig]);

  return (
    <ForumExperimentsContext.Provider
      value={{
        subscriberNotificationsExperimentConfig,
        fetchSubscriberExperimentValues
      }}>
      {children}
    </ForumExperimentsContext.Provider>
  );
}
