import { CollectionItemSize } from "@rbx/discovery-sdui-components";

export function toV1CollectionItemSize(value: string | undefined): CollectionItemSize | undefined {
  return Object.values(CollectionItemSize).find(itemSize => itemSize === value);
}
