import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileFrame } from "../types/ProfileFrameTypes";
import {
  equipProfileFrame,
  fetchAvailableProfileFrames,
  fetchEquippedProfileFrameId,
} from "../services/profileFrameService";
import { NONE_FRAME_ASSET_ID } from "../frames/profileFrameConstants";

const FRAMES_QUERY_KEY = ["profileFrames"];
const EQUIPPED_FRAME_QUERY_KEY = ["equippedProfileFrame"];

type UseProfileFramesResult = {
  frames: ProfileFrame[];
  equippedFrameId?: number;
  equippedFrame?: ProfileFrame;
  isSaving: boolean;
  saveFrame: (frameId: number) => Promise<void>;
};

/** Maps the backend's numeric asset id (or `null` = no frame) to the UI frame id. */
const toFrameId = (assetId: number | null): number => assetId ?? NONE_FRAME_ASSET_ID;

/**
 * Resolves the equipped frame from its id. The equipped-state query (avatar-v4) is
 * independent of the catalog query (marketplace-widgets), so we build the frame straight
 * from `equippedFrameId` (which is the asset id) and only enrich the display name from the
 * catalog when it's available — otherwise a flaky/empty catalog would make an equipped
 * frame render as "none".
 */
const resolveEquippedFrame = (frames: ProfileFrame[], equippedFrameId: number): ProfileFrame => {
  const catalogFrame = frames.find(frame => frame.assetId === equippedFrameId);
  return catalogFrame ?? { assetId: equippedFrameId, name: "" };
};

/**
 * Data hook for the web edit-frame experience. The frame list comes from the
 * marketplace-widgets catalog; reading and equipping the user's frame use the
 * avatar-v4 API (see `profileFrameService`).
 */
const useProfileFrames = (): UseProfileFramesResult => {
  const queryClient = useQueryClient();

  // The grid lists only equippable frames — there's no "None" tile anymore.
  // "No frame" is represented as an empty selection (NONE_FRAME_ID) and, when
  // equipped, resolves to the NONE_FRAME fallback via findProfileFrame below.
  const { data: frames = [] } = useQuery<ProfileFrame[]>({
    queryKey: FRAMES_QUERY_KEY,
    queryFn: () => fetchAvailableProfileFrames(),
    staleTime: Infinity,
  });

  const { data: equippedFrameId } = useQuery<number>({
    queryKey: EQUIPPED_FRAME_QUERY_KEY,
    queryFn: async () => toFrameId(await fetchEquippedProfileFrameId()),
    staleTime: Infinity,
  });

  const { mutateAsync, isPending: isSaving } = useMutation({
    mutationFn: async (assetId: number): Promise<number> => {
      if (!Number.isFinite(assetId)) {
        throw new Error(`Cannot equip profile frame with non-numeric id: ${assetId}`);
      }

      await equipProfileFrame(assetId);
      return assetId;
    },
    onSuccess: savedFrameId => {
      queryClient.setQueryData(EQUIPPED_FRAME_QUERY_KEY, savedFrameId);
    },
  });

  const saveFrame = useCallback(
    async (assetId: number) => {
      await mutateAsync(assetId);
    },
    [mutateAsync],
  );

  return {
    frames,
    equippedFrameId,
    equippedFrame: equippedFrameId ? resolveEquippedFrame(frames, equippedFrameId) : undefined,
    isSaving,
    saveFrame,
  };
};

export default useProfileFrames;
