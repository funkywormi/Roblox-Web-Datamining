import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";
import ExperimentationService from "@rbx/experimentation";

const enableEventPlaceJoin = "isJoinEventPlaceEnabled";
const virtualEventsExperimentLayerName = "CreatorSuccess.VirtualEvents";

const getUserCanJoinNonRootPlace = async (): Promise<boolean> => {
  if (!CurrentUser!.isAuthenticated) {
    return false;
  }
  const experimentValues = await ExperimentationService.getAllValuesForLayer(
    virtualEventsExperimentLayerName,
  );
  return experimentValues[enableEventPlaceJoin] === true;
};

const Experiments = {
  getUserCanJoinNonRootPlace,
};

export default Experiments;
