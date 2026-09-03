import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';

interface GlobalModalVolumeContextType {
  globalVolume: number;
  globalMuted: boolean;
  updateGlobalModalVolume: (newVolume: number, newIsMuted: boolean) => void;
}

const GlobalModalVolumeContext = createContext<GlobalModalVolumeContextType | undefined>(undefined);

interface GlobalModalVolumeProviderProps {
  children: ReactNode;
}

export function GlobalModalVolumeProvider({ children }: GlobalModalVolumeProviderProps) {
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const updateGlobalModalVolume = useCallback((newVolume: number, newIsMuted: boolean) => {
    setVolume(newVolume);
    setIsMuted(newIsMuted);
  }, []);

  const value: GlobalModalVolumeContextType = {
    globalVolume: volume,
    globalMuted: isMuted,
    updateGlobalModalVolume
  };

  return (
    <GlobalModalVolumeContext.Provider value={value}>{children}</GlobalModalVolumeContext.Provider>
  );
}

export function useGlobalModalVolume(): GlobalModalVolumeContextType {
  const context = useContext(GlobalModalVolumeContext);
  if (context === undefined) {
    throw new Error('useGlobalModalVolume must be used within a GlobalModalVolumeProvider');
  }
  return context;
}
