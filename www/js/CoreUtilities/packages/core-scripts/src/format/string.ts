export const escapeHtml = (str: string): string =>
  str.replace(/[&<>"'\\/]/g, char => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      case "/":
        return "&#x2F;";
      default:
        return char;
    }
  });

export const formatSeoName = (name: string): string => {
  if (!name) {
    // @ts-expect-error TODO: old, migrated code
    return null;
  }
  return (
    name
      .replace(/'/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/^(COM\d|LPT\d|AUX|PRT|NUL|CON|BIN)$/i, "") || "unnamed"
  );
};

/**
 * Drops matched `(...)` / `[...]` pairs, including nests and mixed delimiters like `(]`.
 */
const removeBracketedText = (input: string): string => {
  const kept: string[] = [];
  const openIndices: number[] = [];

  for (const char of input) {
    if (char === "(" || char === "[") {
      openIndices.push(kept.length);
      kept.push(char);
    } else if (char === ")" || char === "]") {
      const openIndex = openIndices.pop();
      if (openIndex === undefined) {
        kept.push(char);
      } else {
        kept.length = openIndex;
      }
    } else {
      kept.push(char);
    }
  }

  return kept.join("");
};

/**
 * Strips matched `(...)` / `[...]` pairs, then slugifies with `formatSeoName`.
 * Uses `unnamed` when nothing is left to slugify.
 */
export const formatStableSeoName = (name: string): string =>
  formatSeoName(removeBracketedText(name)) || "unnamed";

export enum connectors {
  at = "@",
  plus = "+",
}

export const concat = (inputs: string[], connector?: string, isHtmlWrapped?: boolean): string => {
  // TODO: old, migrated code
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (inputs?.length) {
    const connectorToBeApplied = connector ?? connectors.at;
    const connectorStr = isHtmlWrapped
      ? `<span class="connector">${connectorToBeApplied}</span>`
      : connectorToBeApplied;

    const segments = isHtmlWrapped ? inputs.map(x => `<span class="element">${x}</span>`) : inputs;
    return segments.join(connectorStr);
  }
  return "";
};

export default {
  connectors,
  concat,
};
