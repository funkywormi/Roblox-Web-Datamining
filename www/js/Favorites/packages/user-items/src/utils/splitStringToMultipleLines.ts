const identity = function (str: string) {
  return str;
};

// wordWrap functionality from https://github.com/jonschlinkert/word-wrap
const wordWrapSplit = function (
  str: string,
  options: {
    width?: number;
    newline?: string;
    escape?: (str: string) => string;
    cut?: boolean;
    indent?: string;
    trim?: boolean;
  },
) {
  if (!str) {
    return str;
  }

  const width = options.width ?? 50;
  const indent = typeof options.indent === "string" ? options.indent : "";

  const newline = options.newline ?? `\n${indent}`;
  const escape = typeof options.escape === "function" ? options.escape : identity;

  let regexString = `.{1,${width}}`;
  if (options.cut !== true) {
    regexString += "([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)";
  }

  const re = new RegExp(regexString, "g");
  const lines = str.match(re) ?? [];
  let result =
    indent +
    lines
      .map(line => escape(line.endsWith("\n") ? line.slice(0, line.length - 1) : line))
      .join(newline);

  if (options.trim === true) {
    result = result.replace(/[ \t]*$/gm, "");
  }
  return result;
};

// determine if the string can be reasonably split by numLines
const getWordSplitLength = function (str: string, numLines: number) {
  const initialSplit = wordWrapSplit(str, { width: Math.ceil(str.length / numLines) });
  return {
    initialWordWrap: initialSplit,
    length: initialSplit.split("\n").length,
  };
};

// if the string is difficult to split, loosen the constraint for how many allowed characters there are per line by 4/3
const wrapStringByLines = (str: string, numLines: number): string => {
  const initial = getWordSplitLength(str, numLines);
  if (initial.length > numLines) {
    return wordWrapSplit(str, { width: Math.ceil(str.length / (numLines * 0.75)) });
  } else {
    return initial.initialWordWrap;
  }
};

// will return approximate split of a string to specified number of lines
export default {
  wrapStringByLines,
};
