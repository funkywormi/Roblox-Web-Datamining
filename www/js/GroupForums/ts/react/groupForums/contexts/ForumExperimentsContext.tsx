import React, { useState, createContext, useContext, useCallback, useEffect } from 'react';
import { ExperimentationService } from 'Roblox';
import { layers } from '../../shared/constants/experimentConstants';
import useLayerExposure from '../hooks/useLayerExposure';
import {
  ForumNotificationsExperimentConfig,
  InlineEngagementExperimentConfig,
  ForumExperimentsState
} from '../types';

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

  const [
    inlineEngagementExperimentConfig,
    setInlineEngagementExperimentConfig
  ] = useState<InlineEngagementExperimentConfig | null>(null);
  const [hasInlineEngagementAssignment, setHasInlineEngagementAssignment] = useState(false);

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

  const fetchInlineEngagementExperimentValues = useCallback(async () => {
    if (hasInlineEngagementAssignment) {
      return;
    }

    const disabled = { isReactionsEnabled: false, isCommentsEnabled: false };
    try {
      const response = await ExperimentationService.getAllValuesForLayer(layers.forumsDiscovery);
      const experimentConfig = response?.inlineEngagementConfig as InlineEngagementExperimentConfig | null;
      setInlineEngagementExperimentConfig(experimentConfig ?? disabled);
      setHasInlineEngagementAssignment(true);
    } catch (e) {
      setInlineEngagementExperimentConfig(disabled);
    }
  }, [hasInlineEngagementAssignment]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchInlineEngagementExperimentValues();
  }, [fetchInlineEngagementExperimentValues]);

  // The About page leaves the document to open a post, so a back navigation can restore this page
  // from the browser cache with the request abandoned. A restore runs no effects, so ask again here.
  useEffect(() => {
    const handlePageRestore = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      // eslint-disable-next-line no-void
      void fetchInlineEngagementExperimentValues();
    };

    window.addEventListener('pageshow', handlePageRestore);
    return () => window.removeEventListener('pageshow', handlePageRestore);
  }, [fetchInlineEngagementExperimentValues]);

  const logInlineEngagementExposure = useLayerExposure(
    layers.forumsDiscovery,
    hasInlineEngagementAssignment
  );

  return (
    <ForumExperimentsContext.Provider
      value={{
        subscriberNotificationsExperimentConfig,
        fetchSubscriberExperimentValues,
        inlineEngagementExperimentConfig,
        logInlineEngagementExposure
      }}>
      {children}
    </ForumExperimentsContext.Provider>
  );
}
