import { ProfileFrame } from "../types/ProfileFrameTypes";

/** Sentinel id for "no frame". */
export const NONE_FRAME_ASSET_ID = 0;

export const NONE_FRAME: ProfileFrame = {
  assetId: NONE_FRAME_ASSET_ID,
  name: "None",
};

/** Finds a frame by id within a list, falling back to the "None" frame. */
export const findProfileFrame = (
  frames: ProfileFrame[],
  frameId: number | undefined,
): ProfileFrame | undefined => frames.find(frame => frame.assetId === frameId);
