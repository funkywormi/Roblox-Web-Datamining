import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { EmoteContextState, EmoteSet, EmoteDisplay } from '../types';
import emotesService from '../services/emotesService';
import emoteConstants from '../constants/emoteConstants';

export const EmotesContext = createContext<EmoteContextState | undefined>(undefined);

export const useEmotes = (): EmoteContextState => {
  const resource = useContext(EmotesContext);
  if (!resource) {
    throw new Error('useEmotes must be used within a EmotesProvider');
  }
  return resource;
};

export type EmotesProviderProps = {
  groupId: number;
  children: React.ReactNode;
};

const transformEmoteSetsToList = (emoteSets: EmoteSet[]): EmoteDisplay[] => {
  const allEmotes = emoteSets.reduce<EmoteDisplay[]>((acc, emoteSet) => {
    const emotes = emoteSet.emotes.map(emote => ({
      id: emote.id,
      name: emote.name,
      url: emoteConstants.emoteNameToUrl(emote.name)
    }));
    return acc.concat(emotes);
  }, []);

  // Sort emotes based on the predefined order for consistency
  return allEmotes.sort((a, b) => {
    const indexA = emoteConstants.emoteOrder.findIndex(emoteName => emoteName === a.name);
    const indexB = emoteConstants.emoteOrder.findIndex(emoteName => emoteName === b.name);

    // If emote is not in the order list, place it at the end
    const orderA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
    const orderB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;

    const orderDiff = orderA - orderB;

    // If both emotes have the same order (both not on the list), fall back to name comparison to have a determinate order
    if (orderDiff === 0) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    }

    return orderDiff;
  });
};

export function EmotesProvider({ children, groupId }: EmotesProviderProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorLoading, setErrorLoading] = useState<boolean>(false);
  const [emoteList, setEmoteList] = useState<EmoteDisplay[]>([]);

  const fetchGroupEmoteSets = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorLoading(false);

      if (!groupId) {
        throw new Error('Invalid groupId');
      }

      const response = await emotesService.getGroupEmoteSets(groupId);
      setEmoteList(transformEmoteSetsToList(response.emoteSets));
    } catch {
      setErrorLoading(true);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const getEmoteById = useCallback(
    (emoteId: string): EmoteDisplay | undefined => {
      return emoteList.find(emote => emote.id === emoteId);
    },
    [emoteList]
  );

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchGroupEmoteSets();
  }, [fetchGroupEmoteSets]);

  return (
    <EmotesContext.Provider
      value={{
        isLoading,
        errorLoading,
        emoteList,
        getEmoteById
      }}>
      {children}
    </EmotesContext.Provider>
  );
}
