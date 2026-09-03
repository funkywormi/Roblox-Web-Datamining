/* eslint-disable no-void */
import { useEffect, useState } from "react";
import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";
import { getRobuxBalance } from "../services/economyService";

export function useRobuxBalance(refetch = false): number | null | undefined {
  const [robuxBalance, setRobuxBalance] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    const userId = CurrentUser?.userId;
    if (!userId) {
      // Render the pill at 0; `null` is reserved for authed fetch failures.
      setRobuxBalance(0);
      return;
    }

    const fetchRobuxBalance = async (authedUserId: string) => {
      const data = await getRobuxBalance(authedUserId);
      if (!data) {
        setRobuxBalance(null);
        return;
      }

      setRobuxBalance(data.robux);
    };

    void fetchRobuxBalance(userId);
  }, [refetch]);

  return robuxBalance;
}
