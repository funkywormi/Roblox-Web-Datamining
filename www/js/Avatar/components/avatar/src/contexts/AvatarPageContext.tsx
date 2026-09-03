import React, { createContext, useContext, ReactNode } from "react";
import { AvatarType } from "../constants/types";
import { AvatarConfigV2 } from "../avatarRequest";
import { PlayerAvatarConfig } from "../avatarRules";
import { AvatarSettings } from "../metadataRequest";
import { CatalogSettings } from "../catalogMetadataRequest";
import useLoadAvatarPage, { AvatarThumbnailDataModel, HeadShape } from "../hooks/useLoadAvatarPage";
import { AvatarTypeService } from "../hooks/useAvatarTypeService";

interface AvatarPageContextType {
  avatarType: AvatarType | undefined;
  setAvatarType: React.Dispatch<React.SetStateAction<AvatarType | undefined>>;
  avatarSettings: AvatarSettings | undefined;
  categoryDict: Record<string, string> | undefined;
  subcategoryDict: Record<string, string> | undefined;
  avatarThumbnailDataModel: AvatarThumbnailDataModel | undefined;
  pageLoaded: boolean;
  enableContinuousLoad: boolean;
  shirtId: number | undefined;
  tShirtId: number | undefined;
  pantsId: number | undefined;
  loadAvatarDetails: () => void;
  avatarRules: PlayerAvatarConfig | undefined;
  avatarDetails: AvatarConfigV2 | undefined;
  catalogMetaData: CatalogSettings | undefined;
  scaleEnabled: boolean;
  setScaleEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  avatarTypeService: AvatarTypeService;
  headShapes: HeadShape[];
}

const AvatarPageContext = createContext<AvatarPageContextType | undefined>(undefined);

export const useAvatarPageContext = () => {
  const context = useContext(AvatarPageContext);
  if (!context) {
    throw new Error("useAvatarPageContext must be used within an AvatarPageProvider");
  }
  return context;
};

interface AvatarPageProviderProps {
  children: ReactNode;
}

export const AvatarPageProvider = ({ children }: AvatarPageProviderProps) => {
  const avatarPageState = useLoadAvatarPage();

  return (
    <AvatarPageContext.Provider value={avatarPageState}>{children}</AvatarPageContext.Provider>
  );
};
