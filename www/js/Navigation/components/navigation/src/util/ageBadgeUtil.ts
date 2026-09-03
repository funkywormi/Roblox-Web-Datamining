const ageBadgeDataset = (): DOMStringMap | null => {
  const metaTag = document.querySelector<HTMLMetaElement>('meta[name="age-badge-control"]');
  return metaTag?.dataset ?? null;
};

export type AgeBadgeControl = "Kids" | "Select";

export const ageBadgeControl = (): AgeBadgeControl | null => {
  const value = ageBadgeDataset()?.ageBadgeControl;
  if (value === "Kids" || value === "Select") {
    return value;
  }
  return null;
};
