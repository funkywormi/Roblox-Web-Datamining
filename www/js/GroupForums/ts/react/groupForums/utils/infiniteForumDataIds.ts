import { InfiniteData } from '@tanstack/react-query';

type IdentifiedPage = {
  data: Array<{ id: string }>;
};

export default function collectRowIdsFromInfinitePages(
  oldData: InfiniteData<IdentifiedPage> | undefined
): Set<string> {
  const ids = new Set<string>();
  if (!oldData?.pages.length) {
    return ids;
  }
  for (const page of oldData.pages) {
    for (const row of page.data) {
      ids.add(row.id);
    }
  }
  return ids;
}
