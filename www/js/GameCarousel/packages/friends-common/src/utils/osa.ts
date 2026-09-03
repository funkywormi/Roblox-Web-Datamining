import { batchCheckReciprocalBlock } from "../services/userBlocking";
import { fetchFeatureCheckResponse } from "../services/accessManagement";

const mustHideConnectionsDueToAMP = async (vieweeUserId: number): Promise<boolean> => {
  try {
    const response = await fetchFeatureCheckResponse<{ access: string }>("MustHideConnections", [
      {
        name: "vieweeUserId",
        type: "UserId",
        value: `${vieweeUserId}`,
      },
    ]);
    return response.access === "Granted";
  } catch (error) {
    console.error(error);
  }
  return true;
};

const isBlockingViewer = async (profileUserId: number): Promise<boolean> => {
  try {
    const reciprocalBlockResponse = await batchCheckReciprocalBlock([profileUserId]);
    return reciprocalBlockResponse.users[0]?.isBlockingViewer ?? true;
  } catch (e) {
    console.error(e);
  }
  return true;
};

export { mustHideConnectionsDueToAMP, isBlockingViewer };
