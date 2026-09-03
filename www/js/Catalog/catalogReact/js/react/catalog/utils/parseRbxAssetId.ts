export default function parseRbxAssetId(assetUrl?: string): string | undefined {
  if (!assetUrl?.trim()) {
    return undefined;
  }

  const match = /^rbxassetid:\/\/(\d+)$/i.exec(assetUrl.trim());
  return match?.[1];
}
