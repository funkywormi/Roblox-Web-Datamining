export function readSortIdFromAction(actionParams: Record<string, unknown>): string | undefined {
  const rawSortId = actionParams.sortId ?? actionParams.sort_id;
  if (typeof rawSortId !== "string" && typeof rawSortId !== "number") {
    return undefined;
  }

  const sortId = String(rawSortId).trim();
  return sortId !== "" ? sortId : undefined;
}
