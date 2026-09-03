const identity = function (str: string) {
    return str;
}

// wordWrap functionality from https://github.com/jonschlinkert/word-wrap
var wordWrapSplit = function (str: string, options: {
    width?: number,
    newline?: string,
    escape?: (str: string) => string,
    cut?: boolean,
    indent?: string,
    trim?: boolean
}) {
    options = options || {};
    if (!str) {
        return str;
    }

    var width = options.width || 50;
    var indent = (typeof options.indent === "string")
        ? options.indent
        : "";

    var newline = options.newline || "\n" + indent;
    var escape = typeof options.escape === "function"
        ? options.escape
        : identity;

    var regexString = ".{1," + width + "}";
    if (options.cut !== true) {
        regexString += "([\\s\u200B]+|$)|[^\\s\u200B]+?([\\s\u200B]+|$)";
    }

    var re = new RegExp(regexString, "g");
    var lines = str.match(re) || [];
    var result = indent + lines.map(function (line) {
        if (line.slice(-1) === "\n") {
            line = line.slice(0, line.length - 1);
        }
        return escape(line);
    }).join(newline);

    if (options.trim === true) {
        result = result.replace(/[ \t]*$/gm, "");
    }
    return result;
};

// determine if the string can be reasonably split by numLines
const getWordSplitLength = function (str: string, numLines: number) {
    var initialSplit = wordWrapSplit(str, { width: Math.ceil((str.length) / numLines) });
    return {
        initialWordWrap: initialSplit,
        length: initialSplit.split("\n").length
    };
};

// if the string is difficult to split, loosen the constraint for how many allowed characters there are per line by 4/3
const wrapStringByLines = (str: string, numLines: number): string => {
    var initial = getWordSplitLength(str, numLines);
    if (initial.length > numLines) {
        return wordWrapSplit(str, { width: Math.ceil(str.length / (numLines * 0.75)) });
    } else {
        return initial.initialWordWrap;
    }
}

// will return approximate split of a string to specified number of lines
export default {
    wrapStringByLines
};
