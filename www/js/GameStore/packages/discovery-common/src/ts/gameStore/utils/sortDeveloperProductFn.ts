import { TDeveloperProduct } from "../types/developerProductTypes";

function separateNumberAndName(fullName: string): [number | null, string] {
  const numberString = /^\d+/.exec(fullName)?.[0];
  if (numberString) {
    return [parseInt(numberString, 10), fullName.slice(numberString.length)];
  }
  return [null, fullName];
}

export default function SortDeveloperProductFn(
  productA: TDeveloperProduct,
  productB: TDeveloperProduct,
) {
  const [numberA, nameA] = separateNumberAndName(productA.name);
  const [numberB, nameB] = separateNumberAndName(productB.name);

  // Put the ones with a number first
  if (numberA == null && numberB != null) return 1;
  if (numberA != null && numberB == null) return -1;

  // if both have a number AND have the same name, sort by number ascending
  if (numberA != null && numberB != null && nameA === nameB) return numberA - numberB;

  // otherwise sort by name ascending
  return nameA.localeCompare(nameB);
}
