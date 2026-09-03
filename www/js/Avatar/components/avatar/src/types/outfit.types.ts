export type OutfitOption = {
  name: "Delete" | "Update" | "Rename" | "Cancel";
  label: string;
};

export const OUTFIT_MENU_OPTIONS: OutfitOption[] = [
  { label: "Action.Update", name: "Update" },
  { label: "Action.Rename", name: "Rename" },
  { label: "Action.Delete", name: "Delete" },
  { label: "Action.Cancel", name: "Cancel" },
];
