/**
 * Markdown tokenizer configuration for marked: interactive (typing) and non-interactive (paste)
 */
import { marked, Lexer, Tokenizer } from 'marked';
const MAX_START_NUMBER = 1000;
function getPrevToken(tokens) {
    return tokens.length > 0 ? tokens[tokens.length - 1] : undefined;
}
function getPrevChar(match, maskedSrc) {
    const srcIndex = maskedSrc.indexOf(match[0]);
    return srcIndex > 0 ? maskedSrc[srcIndex - 1] : undefined;
}
/** An inline trigger needs a non-word character before it, so `foo_bar_baz` stays text. */
const PREV_TOKEN_INLINE_REGEX = /[^a-zA-Z0-9]$/;
const DISABLED_TOKENIZERS = {
    code: () => undefined,
    heading: () => undefined,
    lheading: () => undefined,
    hr: () => undefined,
    escape: () => undefined,
    tag: () => undefined,
    link: () => undefined,
    reflink: () => undefined,
    html: () => undefined,
    table: () => undefined,
    def: () => undefined,
    fences: () => undefined,
    // del - marked's GFM strikethrough matches single-tilde `~text~` and emits no triggerLength,
    // which breaks the trigger-stripping index math in normalizeMark. linethroughExtension owns
    // tilde handling and requires `~~`.
    del: () => undefined,
    // url, autolink - reached through `urlExtension`, which adds the word-boundary check they lack.
    url: () => undefined,
    autolink: () => undefined
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
        // The check below replaces a (?<!\s) lookbehind
        const rule = /^(?:__(?![_\s]+)(.+?)?__)/;
        const match = rule.exec(src);
        if (match) {
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
/**
 * A dotted host, TLD captured lowercase. The host keeps its case: a TLD is never capitalised, so
 * `finished.It` is a missing space and `Roblox.com` is a URL.
 */
const HOST = String.raw `(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+([a-z]{2,})`;
/**
 * A bare host with an optional port, path, query or fragment. marked's own rules match no
 * scheme-less host. The tail drops the brackets and braces `_backpedal` cannot trim.
 */
const BARE_URL_RULE = new RegExp(String.raw `^${HOST}(?::\d{1,5})?(?:[/?#][^\s<>[\]{}\`]*)?`);
/** Where the next URL may start: a scheme, a `<` autolink, or a bare host. */
const URL_START = new RegExp(String.raw `[a-zA-Z][a-zA-Z0-9+.-]*://|<|${HOST}`);
/**
 * A URL must start at a token boundary. These end characters put the match inside a word, a path
 * or an e-mail address: `xhttps://roblox.com`, `foo/roblox.com`, a host right after an `@`.
 */
const PREV_CHAR_BLOCKS_URL = /[\w@./-]$/;
/** marked's trailing-punctuation trimmer. */
// eslint-disable-next-line no-underscore-dangle
const BACKPEDAL = Lexer.rules.inline.gfm._backpedal;
function trimTrailingPunctuation(url) {
    let current = url;
    let previous;
    do {
        previous = current;
        current = BACKPEDAL.exec(current)?.[0] ?? '';
    } while (previous !== current);
    return current;
}
/**
 * A TLD that is also an English word needs proof of intent: a `www.` prefix, or a port, path,
 * query or fragment. `www.` is checked here because marked's own `url` tokenizer gives a `www.`
 * host `http`.
 */
const WORD_TLDS = new Set(['id', 'in', 'it', 'me', 'no', 'us']);
const TLD_TAIL = /[:/?#]/;
const WWW_HOST = /^www\./i;
/**
 * Hand-curated. Without a list every dotted token is a host, so `photo.png` reads as a link. A
 * missed link is the cheaper mistake. A typed scheme skips the list.
 */
const BARE_URL_TLDS = new Set([
    // Generic
    'com',
    'org',
    'net',
    'io',
    'gg',
    'co',
    'edu',
    'gov',
    'dev',
    'app',
    'me',
    'tv',
    'xyz',
    'info',
    'biz',
    // Country codes
    'us',
    'uk',
    'ca',
    'au',
    'de',
    'fr',
    'jp',
    'br',
    'ru',
    'in',
    'nl',
    'es',
    'it',
    'pl',
    'se',
    'no',
    'kr',
    'mx',
    'ar',
    'cl',
    'ph',
    'id',
    'tr',
    'vn',
    'th',
    // Shorteners
    'gl',
    'ly'
]);
function bareUrlToken(src) {
    const match = BARE_URL_RULE.exec(src);
    if (!match) {
        return undefined;
    }
    const url = trimTrailingPunctuation(match[0]);
    if (!url.includes('.')) {
        return undefined;
    }
    const tld = match[1];
    if (!BARE_URL_TLDS.has(tld)) {
        return undefined;
    }
    if (WORD_TLDS.has(tld) && !TLD_TAIL.test(url) && !WWW_HOST.test(url)) {
        return undefined;
    }
    return {
        type: 'bare-url',
        raw: url,
        text: url,
        href: `https://${url}`
    };
}
/** The live tokenizer, whose `rules` the built-in URL tokenizers read. */
function builtinTokenizer(lexer) {
    return lexer.tokenizer;
}
/**
 * The only entry point for a URL of any shape, so the word-boundary check below covers the two
 * built-in tokenizers too. The bare-host rule runs first to keep `www.roblox.com` on `https`.
 *
 * Must not be named `url` or `autolink` - marked ignores an inline extension whose name is a
 * built-in tokenizer's.
 */
export const urlExtension = {
    name: 'web-url',
    level: 'inline',
    start(src) {
        return src.match(URL_START)?.index;
    },
    tokenizer(src, tokens) {
        const prevToken = getPrevToken(tokens);
        if (prevToken && PREV_CHAR_BLOCKS_URL.test(prevToken.raw)) {
            return undefined;
        }
        const tokenizer = builtinTokenizer(this.lexer);
        return (bareUrlToken(src) ??
            Tokenizer.prototype.autolink.call(tokenizer, src) ??
            Tokenizer.prototype.url.call(tokenizer, src));
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
        // Bail only on a tilde glued to the end of the previous token, as in `~~~foo~~`. A loose
        // earlier tilde must not block the match, as in `~ foo ~~bar~~`.
        if (prevToken && prevToken.raw.match(/~$/)) {
            return undefined;
        }
        // The check below replaces a (?<!\s) lookbehind
        const rule = /^(?:~~(?![~\s]+)(.+?)~~)/;
        const match = rule.exec(src);
        if (match) {
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
        emStrong(src, maskedSrc, fallbackPrevChar) {
            // Each check below replaces a (?<!\s) lookbehind
            let match = src.match(/^\*\*([^\s*].*?)\*\*/);
            if (match) {
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
            match = src.match(/^\*([^\s*][^*]*?)\*(?!\*)/);
            if (match) {
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
            match = src.match(/^_([^\s_][^_]*?)_(?!_)/);
            if (match) {
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
export const interactiveExtensions = [
    codespanExtension,
    underlineExtension,
    linethroughExtension,
    urlExtension
];
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
                const itemWithItems = item;
                if (itemWithItems.items && Array.isArray(itemWithItems.items)) {
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
        emStrong(...args) {
            const token = defaultTokenizer.emStrong.call(this, ...args);
            if (token) {
                const typedToken = token;
                typedToken.triggerLength =
                    (typedToken.raw.length - typedToken.text.length) / 2;
                if (typedToken.type === 'strong' && typedToken.raw.startsWith('__')) {
                    return {
                        type: 'underline',
                        triggerLength: 2,
                        raw: typedToken.raw,
                        text: typedToken.text,
                        tokens: typedToken.tokens
                    };
                }
                if (typedToken.raw.startsWith('_')) {
                    typedToken.trigger = '_';
                }
            }
            return token;
        },
        codespan(src) {
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
            // A row of dashes, underscores or stars is an hr, not a list
            const hrRule = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
            if (hrRule.test(src)) {
                return undefined;
            }
            const token = defaultTokenizer.list.call(this, src);
            if (!token) {
                return token;
            }
            if (token.ordered && typeof token.start === 'number' && token.start > MAX_START_NUMBER) {
                return undefined;
            }
            return processListToken(token);
        },
        // A single newline is a paragraph break here, unlike CommonMark
        paragraph(src) {
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
export const nonInteractiveExtensions = [
    underlineExtension,
    linethroughExtension,
    urlExtension
];
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
    return { ...marked.defaults };
}
//# sourceMappingURL=tokenizer.js.map