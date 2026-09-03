import React, { createContext, useContext } from 'react';
import { Videos } from '@rbx/profile-platform';

export interface GroupVideosContextProps {
  groupId: number;
  videosData: Videos;
}

export const GroupVideoContext = createContext<GroupVideosContextProps | undefined>(undefined);

export const useGroupVideosContext = (): GroupVideosContextProps => {
  const context = useContext(GroupVideoContext);
  if (!context) {
    throw new Error('useGroupVideosContext must be used within a GroupVideoContextProvider');
  }
  return context;
};

export function GroupVideosContextProvider(
  props: GroupVideosContextProps & { children: React.ReactNode }
): JSX.Element {
  const { children } = props;

  return <GroupVideoContext.Provider value={props}>{children}</GroupVideoContext.Provider>;
}
