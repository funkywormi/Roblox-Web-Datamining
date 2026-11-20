import { createContext, useContext, type ComponentType } from "react";

export type TrustedFriendsUpsellParams = {
  featureName: string;
  namespace: string;
  isAsyncCall: boolean;
  usePrologue: boolean;
  ampFeatureCheckData?: { name: string; type: string; value: string }[];
  ampRecourseData?: { targetUserId: number };
  featureSpecificData?: { context: string };
};

export type TrustedFriendsUserNames = {
  combinedName?: string | null;
  username?: string | null;
};

export type TrustedFriendsModalHost = {
  startAccessManagementUpsell: (params: TrustedFriendsUpsellParams) => Promise<boolean>;
  AvatarHeadshot: ComponentType<{ userId: number; className: string }>;
  useUserNames: (userId: number) => TrustedFriendsUserNames | undefined;
};

export const TrustedFriendsModalHostContext = createContext<TrustedFriendsModalHost | null>(null);

export const useTrustedFriendsModalHost = (): TrustedFriendsModalHost => {
  const host = useContext(TrustedFriendsModalHostContext);
  if (host == null) {
    throw new Error("TrustedFriendsModal needs a TrustedFriendsModalHostContext provider");
  }
  return host;
};
