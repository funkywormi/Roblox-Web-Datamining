import { getForumPostUrl } from "./urls";

export enum ReturnLinkSourceType {
  ForumPost = "forumPost",
}

/** Parses a forum post reference encoded as `{groupId}_{categoryId}_{postId}`. */
export const parseForumPostSourceId = (
  sourceId: string,
): { groupId: number; categoryId: string; postId: string } | null => {
  const parts = sourceId.split("_");
  if (parts.length < 3) {
    return null;
  }

  const groupId = Number.parseInt(parts[0] ?? "", 10);
  const categoryId = parts[1] ?? "";
  const postId = parts[2] ?? "";

  if (!Number.isFinite(groupId) || !categoryId || !postId) {
    return null;
  }

  return { groupId, categoryId, postId };
};

const SOURCE_URL_GENERATORS: Record<string, (sourceId: string) => string | null> = {
  [ReturnLinkSourceType.ForumPost]: sourceId => {
    const parsed = parseForumPostSourceId(sourceId);
    if (!parsed) {
      return null;
    }
    return getForumPostUrl(parsed);
  },
};

export const getSourceUrl = (sourceType: string | null, sourceId: string | null): string | null => {
  if (!sourceType || !sourceId) {
    return null;
  }
  return SOURCE_URL_GENERATORS[sourceType]?.(sourceId) ?? null;
};
