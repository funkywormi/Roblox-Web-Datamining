import useExperimentValues from "../../common/hooks/useExperimentValues";
import {
  serverCardMetaExperimentLayer,
  isServerCardPingIconEnabledParam,
  isServerCardLanguageIconEnabledParam,
  isServerCardFriendsIconEnabledParam,
  isFriendsServerListV2EnabledParam,
} from "../constants/experimentConstants";

type ServerCardMetaExperimentValues = {
  [isServerCardPingIconEnabledParam]: boolean;
  [isServerCardLanguageIconEnabledParam]: boolean;
  [isServerCardFriendsIconEnabledParam]: boolean;
  [isFriendsServerListV2EnabledParam]: boolean;
};

// Module-level for a stable reference (feeds a useMemo dep in useExperimentValues).
const defaultValues: ServerCardMetaExperimentValues = {
  [isServerCardPingIconEnabledParam]: false,
  [isServerCardLanguageIconEnabledParam]: false,
  [isServerCardFriendsIconEnabledParam]: false,
  [isFriendsServerListV2EnabledParam]: false,
};

/**
 * Hook to expose parameters on the `ServerCardMeta` IXP layer.
 */
const useServerCardMetaExperiment = (): {
  isServerCardPingIconEnabled: boolean;
  isServerCardLanguageIconEnabled: boolean;
  isServerCardFriendsIconEnabled: boolean;
  isFriendsServerListV2Enabled: boolean;
  isLoading: boolean;
} => {
  const { ixpData, isLoading } = useExperimentValues<ServerCardMetaExperimentValues>(
    serverCardMetaExperimentLayer,
    defaultValues,
  );

  return {
    isServerCardPingIconEnabled: ixpData[isServerCardPingIconEnabledParam],
    isServerCardLanguageIconEnabled: ixpData[isServerCardLanguageIconEnabledParam],
    isServerCardFriendsIconEnabled: ixpData[isServerCardFriendsIconEnabledParam],
    isFriendsServerListV2Enabled: ixpData[isFriendsServerListV2EnabledParam],
    isLoading,
  };
};

export default useServerCardMetaExperiment;
