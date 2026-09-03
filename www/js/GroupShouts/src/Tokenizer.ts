/**
 * Markdown tokenizer configuration for marked library
 * Contains both interactive (live typing) and non-interactive (paste) tokenizers
 */
import { marked } from 'marked';
// Do not support lists with a start number greater than 1000
const MAX_START_NUMBER = 1000;
/**
 * Get the previous token from the tokens array
 */
function getPrevToken(tokens) {
    return tokens.length > 0 ? tokens[tokens.length - 1] : undefined;
}
/**
 * Get the character preceding a match in the source string
 */
function getPrevChar(match, maskedSrc) {
    const srcIndex = maskedSrc.indexOf(match[0]);
    return srcIndex > 0 ? maskedSrc[srcIndex - 1] : undefined;
}
/**
 * Regex used to test the previous token when determining if we
 * should convert an inline markdown trigger. Ensures we don't
 * convert if there isn't a space preceding or if at start of
 * text -- this avoids converting tokens inside other words
 * e.g. foo_bar_baz
 */
const PREV_TOKEN_INLINE_REGEX = /[^a-zA-Z0-9]$/;
/**
 * Disabled tokenizers shared between interactive and non-interactive modes
 */
const DISABLED_TOKENIZERS = {
    code: () => undefined,
    heading: () => undefined,
    lheading: () => undefined,
    hr: () => undefined,
    escape: () => undefined,
    tag: () => undefined,
    link: () => undefined,
    reflink: () => undefined,
    autolink: () => undefined,
    url: () => undefined,
    html: () => undefined,
    table: () => undefined,
    def: () => undefined,
    fences: () => undefined
};
// ============================================================================
// Shared Extensions (used by both interactive and non-interactive tokenizers)
// ============================================================================
export const underlineExtension = {
    name: 'underline',
    level: 'inline',
    start(src) {
        return src.match(/__[^_]/)?.index;
    },
    tokenizer(src, tokens) {
        const prevToken = getPrevToken(tokens);
        if (prevToken && !prevToken.raw.match(/[\sa-zA-Z0-9\\/]/)) {
            return undefined;
        }
        // Manual check replaces negative lookbehind (?<!\s) to ensure text doesn't end with whitespace
        const rule = /^(?:__(?![_\s]+)(.+?)?__)/;
        const match = rule.exec(src);
        if (match) {
            // Ensure the matched text doesn't end with whitespace
            if (match[1] && /\s$/.test(match[1])) {
                return undefined;
            }
            return {
                type: 'underline',
                triggerLength: 2,
                raw: match[0],
                text: match[1] || '',
                tokens: this.lexer.inlineTokens(match[1] || '', [])
            };
        }
        return undefined;
    }
};
export const linethroughExtension = {
    name: 'linethrough',
    level: 'inline',
    start(src) {
        return src.match(/~~[^~]/)?.index;
    },
    tokenizer(src, tokens) {
        const prevToken = getPrevToken(tokens);
        if (prevToken && prevToken.raw.match(/~+/)) {
            return undefined;
        }
        // Manual check replaces negative lookbehind (?<!\s) to ensure text doesn't end with whitespace
        const rule = /^(?:~~(?![~\s]+)(.+?)~~)/;
        const match = rule.exec(src);
        if (match) {
            // Ensure the matched text doesn't end with whitespace
            if (match[1] && /\s$/.test(match[1])) {
                return undefined;
            }
            return {
                type: 'del',
                triggerLength: 2,
                raw: match[0],
                text: match[1],
                tokens: this.lexer.inlineTokens(match[1], [])
            };
        }
        return undefined;
    }
};
// ============================================================================
// Interactive Tokenizer (for live markdown detection while typing)
// ============================================================================
export const codespanExtension = {
    name: 'codespan',
    level: 'inline',
    start(src) {
        return src.match(/`[^`]/)?.index;
    },
    tokenizer(src, tokens) {
        const prevToken = getPrevToken(tokens);
        if (prevToken && !prevToken.raw.match(PREV_TOKEN_INLINE_REGEX)) {
            return undefined;
        }
        const rule = /^`(.+?)`/;
        const match = rule.exec(src);
        if (match) {
            return {
                type: 'codespan',
                triggerLength: 1,
                raw: match[0],
                text: match[1]
            };
        }
        return undefined;
    }
};
export function createInteractiveTokenizer() {
    return {
        // Handle bold and italic with custom logic to avoid conflicts
        emStrong(src, maskedSrc, fallbackPrevChar) {
            // Bold with **text**
            // Manual check replaces negative lookbehind (?<!\s) to ensure text doesn't end with whitespace
            let match = src.match(/^\*\*([^\s*].*?)\*\*/);
            if (match) {
                // Ensure the matched text doesn't end with whitespace
                if (match[1] && /\s$/.test(match[1])) {
                    return undefined;
                }
                return {
                    type: 'strong',
                    raw: match[0],
                    text: match[1],
                    tokens: this.lexer.inlineTokens(match[1], []),
                    triggerLength: 2
                };
            }
            // Italic with *text*
            // Manual check replaces negative lookbehind (?<!\s) to ensure text doesn't end with whitespace
            match = src.match(/^\*([^\s*][^*]*?)\*(?!\*)/);
            if (match) {
                // Ensure the matched text doesn't end with whitespace
                if (match[1] && /\s$/.test(match[1])) {
                    return undefined;
                }
                const prevChar = getPrevChar(match, maskedSrc) || fallbackPrevChar;
                if (prevChar && prevChar.match(/[*a-zA-Z0-9]/)) {
                    return undefined;
                }
                return {
                    type: 'em',
                    raw: match[0],
                    text: match[1],
                    tokens: this.lexer.inlineTokens(match[1], []),
                    triggerLength: 1
                };
            }
            // Italic with _text_
            // Manual check replaces negative lookbehind (?<!\s) to ensure text doesn't end with whitespace
            match = src.match(/^_([^\s_][^_]*?)_(?!_)/);
            if (match) {
                // Ensure the matched text doesn't end with whitespace
                if (match[1] && /\s$/.test(match[1])) {
                    return undefined;
                }
                const prevChar = getPrevChar(match, maskedSrc) || fallbackPrevChar;
                if (prevChar && !prevChar.match(/\s/)) {
                    return undefined;
                }
                return {
                    type: 'em',
                    raw: match[0],
                    text: match[1],
                    tokens: this.lexer.inlineTokens(match[1], []),
                    triggerLength: 1,
                    trigger: '_'
                };
            }
            return undefined;
        },
        // Disable codespan in tokenizer - handled by extension
        codespan: () => undefined,
        // Handle blockquote with > prefix
        blockquote(src) {
            const match = src.match(/^> (.*)/);
            if (match) {
                return {
                    type: 'blockquote',
                    raw: match[0],
                    text: match[1],
                    triggerLength: 2,
                    tokens: []
                };
            }
            return undefined;
        },
        // Handle unordered lists with -, *, or +
        list(src) {
            let match = src.match(/^([-*+]) (.*)/);
            if (match) {
                return {
                    type: 'list',
                    raw: match[0],
                    ordered: false,
                    start: '',
                    loose: false,
                    items: [
                        {
                            type: 'list_item',
                            raw: match[2],
                            task: false,
                            loose: false,
                            text: match[2],
                            tokens: []
                        }
                    ],
                    triggerLength: 2,
                    delimiter: match[1]
                };
            }
            match = src.match(/^(\d+)([.)]) (.*)/);
            if (match) {
                const start = parseInt(match[1], 10);
                if (start > MAX_START_NUMBER) {
                    return undefined;
                }
                return {
                    type: 'list',
                    raw: match[0],
                    ordered: true,
                    start: parseInt(match[1], 10),
                    loose: false,
                    items: [
                        {
                            type: 'list_item',
                            raw: match[3],
                            task: false,
                            loose: false,
                            text: match[3],
                            tokens: []
                        }
                    ],
                    triggerLength: match[1].length + 2,
                    delimiter: match[2]
                };
            }
            return undefined;
        },
        ...DISABLED_TOKENIZERS
    };
}
export const interactiveExtensions = [codespanExtension, underlineExtension, linethroughExtension];
export function initializeMarked() {
    marked.setOptions({
        ...marked.getDefaults(),
        gfm: true
    });
    marked.use({ extensions: interactiveExtensions });
    const tokenizer = createInteractiveTokenizer();
    marked.use({ tokenizer });
}
// ============================================================================
// Non-Interactive Tokenizer (for parsing pasted markdown content)
// ============================================================================
const defaultTokenizer = new marked.Tokenizer();
function processListToken(token) {
    if (token.type === 'list') {
        const listToken = token;
        // Find the delimiter character (e.g., '-', '*', '+', '.', ')')
        let delimiter;
        for (let i = 0; i < listToken.raw.length; i += 1) {
            const char = listToken.raw[i];
            if (listToken.ordered) {
                if (char === '.' || char === ')') {
                    delimiter = char;
                    break;
                }
            }
            else if (char === '-' || char === '*' || char === '+') {
                delimiter = char;
                break;
            }
        }
        return {
            ...listToken,
            delimiter,
            start: typeof listToken.start === 'number' ? listToken.start : undefined,
            items: listToken.items.map(item => {
                // Check if this item has nested lists by looking for the items property
                const itemWithItems = item;
                if (itemWithItems.items && Array.isArray(itemWithItems.items)) {
                    // This is a nested list, recursively process it
                    const nestedList = {
                        ...item,
                        type: 'list'
                    };
                    return processListToken(nestedList);
                }
                return item;
            })
        };
    }
    return token;
}
export function createNonInteractiveTokenizer() {
    return {
        // Handle bold and italic with standard CommonMark parsing
        emStrong(...args) {
            const token = defaultTokenizer.emStrong.call(this, ...args);
            if (token) {
                const typedToken = token;
                typedToken.triggerLength =
                    (typedToken.raw.length - typedToken.text.length) / 2;
                // If using __ for bold, treat it as underline instead
                if (typedToken.type === 'strong' && typedToken.raw.startsWith('__')) {
                    return {
                        type: 'underline',
                        triggerLength: 2,
                        raw: typedToken.raw,
                        text: typedToken.text,
                        tokens: typedToken.tokens
                    };
                }
                // Mark _ trigger for italic
                if (typedToken.raw.startsWith('_')) {
                    typedToken.trigger = '_';
                }
            }
            return token;
        },
        codespan(src) {
            // Use a regex pattern similar to what marked uses internally
            const rule = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
            const cap = rule.exec(src);
            if (!cap) {
                return undefined;
            }
            let text = cap[2]?.replace(/\n/g, ' ') || '';
            const hasNonSpaceChars = /[^ ]/.test(text);
            const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
            if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
                text = text.substring(1, text.length - 1);
            }
            const token = {
                type: 'codespan',
                raw: cap[0],
                text
            };
            if (token.raw.startsWith('``')) {
                token.trigger = '``';
                token.triggerLength = 2;
            }
            return token;
        },
        list(src) {
            // Check if this is an hr pattern first
            const hrRule = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
            if (hrRule.test(src)) {
                return undefined;
            }
            const token = defaultTokenizer.list.call(this, src);
            if (!token) {
                return token;
            }
            // Do not support ordered lists with a start number greater than MAX_START_NUMBER
            if (token.ordered && typeof token.start === 'number' && token.start > MAX_START_NUMBER) {
                return undefined;
            }
            return processListToken(token);
        },
        // Custom paragraph tokenizer that treats single newlines as paragraph breaks
        paragraph(src) {
            // Match text up to a single newline (treat \n as paragraph break)
            const match = src.match(/^([^\n]+)(?:\n|$)/);
            if (match) {
                return {
                    type: 'paragraph',
                    raw: match[0],
                    text: match[1].trim(),
                    tokens: this.lexer.inlineTokens(match[1].trim(), [])
                };
            }
            return undefined;
        },
        ...DISABLED_TOKENIZERS
    };
}
export const nonInteractiveExtensions = [underlineExtension, linethroughExtension];
export function initializeNonInteractiveMarked() {
    const options = {
        ...marked.getDefaults(),
        gfm: true,
        mangle: false // Disable mangling to avoid escape characters
    };
    marked.setOptions(options);
    marked.use({ extensions: nonInteractiveExtensions });
    const tokenizer = createNonInteractiveTokenizer();
    marked.use({ tokenizer });
    // Return a snapshot of the current marked defaults for use in lexing
    return { ...marked.defaults };
}
//# sourceMappingURL=tokenizer.js.map