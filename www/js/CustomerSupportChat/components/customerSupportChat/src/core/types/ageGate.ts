import { Item } from "./common";

export type DateOption = {
  label: string;
  value: string | null;
};

export type SelectableItem = { value: string; label: string; intVal: number };

export type DateComponentSelector = { key: string; label: string; items: Item[] };

export type DateSelectorError = Partial<Record<DateComponent | "general", Error | null>>;

export enum DateComponent {
  Month = "month",
  Day = "day",
  Year = "year",
}

export enum AgeGateDOBGroupLabel {
  Age13AndOver = "Age13AndOver", // Diff convention as this is sent to server expecting PascalCase
  AgeUnder13 = "AgeUnder13",
}
