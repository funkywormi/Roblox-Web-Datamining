/** An imported image: rspack gives its URL, Next gives `{ src, width, height }`. */
export type ImportedAsset = string | { src: string };

/** The URL of an imported image, from either bundler. */
export const assetUrl = (asset: ImportedAsset): string =>
  typeof asset === "string" ? asset : asset.src;
