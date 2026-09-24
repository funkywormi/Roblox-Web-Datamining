import { useMemo } from "react";
import ParentalControlsActor from "../../../enums/parentalControls/ParentalControlsActor";
import ParentLinkStatus from "../../../enums/parentalControls/ParentLinkStatus";
import { Access } from "../../../types/accessManagementTypes";
import { useGetParentInfoQuery } from "../../apis/parentalControlsApi";
import { useGetFeatureAccessQuery } from "../../apis/accessManagementApi";
import { useGetSettingsUiPolicyQuery } from "../../apis/universalAppConfigurationApi";
import AMPFeaturesConstants from "../constants/AMPFeaturesConstants";

export type TParentalControlsActorState = {
  actor: ParentalControlsActor;
  odpRelationship: ParentLinkStatus;
  isChild: boolean;
  isLoading: boolean;
  hasError: boolean;
};

/**
 * Determines what actor is currently viewing the parental controls page (ODP, child, parent account)
 */
const useParentalControlsActor = (): TParentalControlsActorState => {
  const {
    data: ageOfMajority,
    isError: isAgeOfMajorityError,
    isLoading: isAgeOfMajorityLoading,
    isUninitialized: isAgeOfMajorityUninitialized,
  } = useGetFeatureAccessQuery({
    featureName: AMPFeaturesConstants.ageOfMajorityAmpFeature,
  });

  // Decides child vs remote parent only
  const isChild = ageOfMajority?.access === Access.Denied;
  const isAgeOfMajoritySettled = !isAgeOfMajorityLoading && !isAgeOfMajorityUninitialized;

  // Determines ODP vs remote parents status
  const {
    data: parentInfo,
    isError: isParentInfoError,
    isLoading: isParentInfoLoading,
    isUninitialized: isParentInfoUninitialized,
  } = useGetParentInfoQuery(undefined, {
    skip: !isAgeOfMajoritySettled || !isChild,
  });
  const isParentInfoSettled = isChild
    ? !isParentInfoLoading && !isParentInfoUninitialized
    : isAgeOfMajoritySettled;

  const odpRelationship: ParentLinkStatus = useMemo(() => {
    if (!isParentInfoSettled || !isChild) {
      return ParentLinkStatus.Unresolved;
    }
    const parents = parentInfo?.parents ?? [];
    const hasOnDevice = parents.some(parent => parent.isOnDeviceParent === true);
    const hasRemote = parents.some(parent => parent.isOnDeviceParent !== true);

    if (hasOnDevice && hasRemote) {
      return ParentLinkStatus.OnDeviceAndRemote;
    }
    if (hasOnDevice) {
      return ParentLinkStatus.OnDeviceOnly;
    }
    if (hasRemote) {
      return ParentLinkStatus.RemoteOnly;
    }
    return ParentLinkStatus.NoParents;
  }, [isParentInfoSettled, isChild, parentInfo]);

  const hasOnDeviceParent =
    odpRelationship === ParentLinkStatus.OnDeviceOnly ||
    odpRelationship === ParentLinkStatus.OnDeviceAndRemote;

  // ODP launch gate
  const {
    data: uiPolicy,
    isLoading: isUiPolicyLoading,
    isUninitialized: isUiPolicyUninitialized,
  } = useGetSettingsUiPolicyQuery();
  const isUiPolicySettled = !isUiPolicyLoading && !isUiPolicyUninitialized;
  const isOdpEnabled = uiPolicy?.onDeviceParentalControlsEnabled === true;

  const isLoading =
    !isAgeOfMajoritySettled || !isParentInfoSettled || (hasOnDeviceParent && !isUiPolicySettled);

  const actor: ParentalControlsActor = useMemo(() => {
    if (isLoading) {
      return ParentalControlsActor.Unresolved;
    }
    if (!isChild) {
      return ParentalControlsActor.RemoteParent;
    }

    if (hasOnDeviceParent && isOdpEnabled) {
      return ParentalControlsActor.OnDeviceParent;
    }
    return ParentalControlsActor.Child;
  }, [isLoading, isChild, hasOnDeviceParent, isOdpEnabled]);

  const hasError =
    isAgeOfMajorityError ||
    (isAgeOfMajoritySettled && !ageOfMajority) ||
    (isChild && isParentInfoError);

  return {
    actor,
    odpRelationship,
    isChild,
    isLoading,
    hasError,
  };
};

export default useParentalControlsActor;
