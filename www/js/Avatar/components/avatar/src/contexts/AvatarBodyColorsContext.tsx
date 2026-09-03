import React, { createContext, useContext, ReactNode } from "react";
import useAvatarBodyColorsController from "../hooks/useAvatarBodyColorsController";
import { BodyColorsStateV2 } from "../types";

interface AvatarBodyColorsContextType {
  bodyColors: BodyColorsStateV2;
  setBodyColors: React.Dispatch<React.SetStateAction<BodyColorsStateV2>>;
  setShouldUpdateAvatarBodyColors: React.Dispatch<React.SetStateAction<boolean>>;
}

const AvatarBodyColorsContext = createContext<AvatarBodyColorsContextType | undefined>(undefined);

export const useAvatarBodyColorsContext = () => {
  const context = useContext(AvatarBodyColorsContext);
  if (!context) {
    throw new Error("useAvatarBodyColorsContext must be used within an AvatarBodyColorsProvider");
  }
  return context;
};

interface AvatarBodyColorsProviderProps {
  children: ReactNode;
}

export const AvatarBodyColorsProvider = ({ children }: AvatarBodyColorsProviderProps) => {
  const { bodyColors, setBodyColors, setShouldUpdateAvatarBodyColors } =
    useAvatarBodyColorsController();

  return (
    <AvatarBodyColorsContext.Provider
      value={{ bodyColors, setBodyColors, setShouldUpdateAvatarBodyColors }}
    >
      {children}
    </AvatarBodyColorsContext.Provider>
  );
};
