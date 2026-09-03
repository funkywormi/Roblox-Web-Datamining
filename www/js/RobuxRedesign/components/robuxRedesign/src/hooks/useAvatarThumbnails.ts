import { useEffect, useRef, useState } from "react";
import { getThumbnails, ThumbnailState } from "../services/thumbnailsService";

type UserWithId = { id: number };
type UserWithContentId = { contentId: number };
type AvatarThumbnailUser = UserWithId | UserWithContentId;

export function useAvatarThumbnails(users: AvatarThumbnailUser[]) {
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const thumbnailsRef = useRef(thumbnails);
  thumbnailsRef.current = thumbnails;

  useEffect(() => {
    const ids = users.map(u => ("contentId" in u ? u.contentId : u.id));
    const idsToFetch = ids.filter(id => !(id in thumbnailsRef.current));

    if (idsToFetch.length === 0) return;

    const args = idsToFetch.map(id => ({
      format: "png",
      includeProfileFrame: true,
      requestId: id,
      size: "48x48",
      targetId: id,
      type: "AvatarHeadshot",
    }));

    // eslint-disable-next-line no-void
    void (async () => {
      const data = await getThumbnails(args);

      if (!data?.data) return;

      const map: Record<number, string> = {};

      for (const thumbnail of data.data) {
        if (thumbnail.state === ThumbnailState.Completed) {
          map[thumbnail.targetId] = thumbnail.imageUrl;
        }
      }

      setThumbnails(prev => ({ ...prev, ...map }));
    })();
  }, [users]);

  return thumbnails;
}
