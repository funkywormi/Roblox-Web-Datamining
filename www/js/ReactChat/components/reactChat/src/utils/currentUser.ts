import { authenticatedUser } from "@rbx/core-scripts/meta/user";

export const getCurrentUserId = (): number | null => authenticatedUser()?.id ?? null;
