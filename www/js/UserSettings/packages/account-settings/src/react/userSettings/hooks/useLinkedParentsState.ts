import { useMemo } from "react";
import AddParentUpsellVariant from "../../../enums/parentalControls/AddParentUpsellVariant";
import EligibleParentType from "../../../enums/parentalControls/EligibleParentType";
import { TParentInfo } from "../../../types/parentInfoTypes";
import { useGetParentInfoQuery } from "../../apis/parentalControlsApi";
import { useGetSettingsUiPolicyQuery } from "../../apis/universalAppConfigurationApi";

export type TLinkedParentsState = {
  isOdpLaunchEnabled: boolean;
  hasOnDeviceParent: boolean;
  remoteParents: TParentInfo[];
  showParentList: boolean;
  showAddParentUpsell: boolean;
  addParentUpsellVariant: AddParentUpsellVariant | undefined;
  canAddRemoteParent: boolean;
  canAddOnDeviceParent: boolean;
  isLoading: boolean;
  hasError: boolean;
};

const knownUpsellVariants: string[] = Object.values(AddParentUpsellVariant);

const toUpsellVariant = (variant: string | undefined): AddParentUpsellVariant | undefined =>
  variant !== undefined && knownUpsellVariants.includes(variant)
    ? (variant as AddParentUpsellVariant)
    : undefined;

/**
 * Resolves status of linked parents (odp or remote), what upsells to display,
 * and what the linked-parents list should render.
 */
const useLinkedParentsState = (): TLinkedParentsState => {
  const { data: parentInfo, isError, isLoading, isUninitialized } = useGetParentInfoQuery();
  const isSettled = !isLoading && !isUninitialized;

  const {
    data: uiPolicy,
    isLoading: isPolicyLoading,
    isUninitialized: isPolicyUninitialized,
  } = useGetSettingsUiPolicyQuery();
  const isPolicySettled = !isPolicyLoading && !isPolicyUninitialized;
  const isOdpLaunchEnabled = uiPolicy?.onDeviceParentalControlsEnabled === true;

  return useMemo(() => {
    const parents = parentInfo?.parents ?? [];
    const hasOnDeviceParent =
      isOdpLaunchEnabled && parents.some(parent => parent.isOnDeviceParent === true);

    // An ODP who has upgraded is both a remote and ODP parent.
    // They only get a profile row once they have an valid email.
    const remoteParents = parents.filter(
      parent => parent.isOnDeviceParent !== true || (parent.email ?? "") !== "",
    );
    const visibleParentCount = remoteParents.length + (hasOnDeviceParent ? 1 : 0);

    const eligibleParentTypesToAdd =
      parentInfo?.eligibleParentTypesToAdd ??
      (parentInfo?.canAddParent ? [EligibleParentType.Remote] : []);

    const isReady = isSettled && isPolicySettled;

    return {
      isOdpLaunchEnabled,
      hasOnDeviceParent,
      remoteParents,
      showParentList: isReady && visibleParentCount > 0,
      showAddParentUpsell:
        isReady && visibleParentCount === 0 && eligibleParentTypesToAdd.length > 0,
      addParentUpsellVariant: toUpsellVariant(parentInfo?.eligibleAddParentUpsellVariant),
      canAddRemoteParent: eligibleParentTypesToAdd.includes(EligibleParentType.Remote),
      canAddOnDeviceParent:
        isOdpLaunchEnabled && eligibleParentTypesToAdd.includes(EligibleParentType.OnDevice),
      isLoading: !isReady,
      hasError: isError || (isSettled && !parentInfo),
    };
  }, [parentInfo, isSettled, isError, isPolicySettled, isOdpLaunchEnabled]);
};

export default useLinkedParentsState;
