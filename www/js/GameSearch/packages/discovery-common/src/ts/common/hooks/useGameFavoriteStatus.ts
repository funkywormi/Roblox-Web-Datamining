import { useRef } from "react";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import {
  GameFavoriteStatusMutationError,
  setGameFavoriteStatus,
} from "../services/gamesFavoriteService";

// Scoped to a single universeId per hook instance, so Remove/Undo on the same
// tile serialize against each other and a failed action can tell whether a
// newer action has since superseded it (see GameFavoriteStatusMutationError).
export function useGameFavoriteStatus(
  universeId: number,
  initialIsFavorited: boolean,
): UseMutationResult<void, unknown, boolean> {
  const mutationQueue = useRef<Promise<void>>(Promise.resolve());
  const confirmedIsFavorited = useRef<boolean | undefined>(undefined);
  const latestActionId = useRef(0);

  return useMutation({
    mutationFn: (isFavorited: boolean) => {
      const actionId = latestActionId.current + 1;
      latestActionId.current = actionId;

      const currentMutation = mutationQueue.current
        .catch(() => undefined)
        .then(async () => {
          try {
            await setGameFavoriteStatus(universeId, isFavorited);
            confirmedIsFavorited.current = isFavorited;
          } catch (error) {
            throw new GameFavoriteStatusMutationError(
              error,
              confirmedIsFavorited.current ?? initialIsFavorited,
              latestActionId.current !== actionId,
            );
          }
        });

      mutationQueue.current = currentMutation;
      return currentMutation;
    },
  });
}
