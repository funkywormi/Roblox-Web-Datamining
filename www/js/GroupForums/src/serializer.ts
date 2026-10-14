/**
 * Serializer that converts markdown tokens to Slate nodes
 */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { Text } from 'slate';
import { MarkdownInlineTokenType, MarkdownBlockTokenType, SlateElementType, SlateInlineType, SlateMarkType } from './types.js';
/**
 * The matched text and href of a URL token. The pill shows `href`, so they may differ only by a
 * leading `https://`. Anything else, such as marked's `mailto:` or `http://www.`, stays text.
 */
export function linkTokenParts(token) {
    const text = token.text || '';
    const href = token.href || text;
    if (!text || (href !== text && href !== `https://${text}`)) {
        return undefined;
    }
    return { text, href };
}
/**
 * Apply marks to all leaves in an array. Inline elements are passed through:
 * a mark belongs on a text leaf, not on an element.
 */
function applyMarksToLeaves(leaves, marks) {
    return leaves.map(leaf => Text.isText(leaf)
        ? {
            ...leaf,
            ...marks
        }
        : leaf);
}
/**
 * Convert a single inline token to Slate text leaf(ves) or an inline element
 */
function inlineTokenToLeaf(token, plugins) {
    const { marks: availableMarks } = plugins;
    const marks = {};
    switch (token.type) {
        case MarkdownInlineTokenType.Link:
        case MarkdownInlineTokenType.BareUrl: {
            const parts = linkTokenParts(token);
            if (!parts || !plugins.inlines?.has(SlateInlineType.Link) || !plugins.acceptsUrl?.(parts.href)) {
                return [{ text: token.raw || token.text || '' }];
            }
            // An `<...>` autolink's brackets stay as plain text around the link
            const textStart = Math.max(token.raw.indexOf(parts.text), 0);
            const before = token.raw.slice(0, textStart);
            const after = token.raw.slice(textStart + parts.text.length);
            return [
                ...(before ? [{ text: before }] : []),
                {
                    type: SlateInlineType.Link,
                    url: parts.href,
                    children: [{ text: '' }]
                },
                ...(after ? [{ text: after }] : [])
            ];
        }
        case MarkdownInlineTokenType.Text:
            return [{ text: token.text || '', ...marks }];
        case MarkdownInlineTokenType.Strong:
            if (availableMarks.has(SlateMarkType.Bold)) {
                marks[SlateMarkType.Bold] = true;
            }
            if (token.tokens) {
                return applyMarksToLeaves(inlineTokensToLeaves(token.tokens, plugins), marks);
            }
            return [{ text: token.text || '', ...marks }];
        case MarkdownInlineTokenType.Em:
            if (availableMarks.has(SlateMarkType.Italic)) {
                marks[SlateMarkType.Italic] = true;
            }
            if (token.tokens) {
                return applyMarksToLeaves(inlineTokensToLeaves(token.tokens, plugins), marks);
            }
            return [{ text: token.text || '', ...marks }];
        case MarkdownInlineTokenType.Codespan:
            if (availableMarks.has(SlateMarkType.Codespan)) {
                marks[SlateMarkType.Codespan] = true;
            }
            return [{ text: token.text || '', ...marks }];
        case MarkdownInlineTokenType.Underline:
            if (availableMarks.has(SlateMarkType.Underline)) {
                marks[SlateMarkType.Underline] = true;
            }
            if (token.tokens) {
                return applyMarksToLeaves(inlineTokensToLeaves(token.tokens, plugins), marks);
            }
            return [{ text: token.text || '', ...marks }];
        case MarkdownInlineTokenType.Del:
            if (availableMarks.has(SlateMarkType.Linethrough)) {
                marks[SlateMarkType.Linethrough] = true;
            }
            if (token.tokens) {
                return applyMarksToLeaves(inlineTokensToLeaves(token.tokens, plugins), marks);
            }
            return [{ text: token.text || '', ...marks }];
        case MarkdownInlineTokenType.Br:
            return [{ text: '\n' }];
        default:
            return [{ text: token.raw || token.text || '' }];
    }
}
/**
 * Convert inline tokens to Slate text leaves with marks, plus inline elements
 */
function inlineTokensToLeaves(tokens, plugins) {
    const leaves = [];
    for (let i = 0; i < tokens.length; i += 1) {
        const leaf = inlineTokenToLeaf(tokens[i], plugins);
        if (leaf) {
            leaves.push(...leaf);
        }
    }
    // Ensure we have at least one leaf
    if (leaves.length === 0) {
        leaves.push({ text: '' });
    }
    return leaves;
}
/**
 * Convert markdown tokens to Slate nodes
 * @param tokens - Array of markdown tokens from the lexer
 * @param availablePlugins - Available plugins to filter unsupported nodes
 */
export function tokensToNodes(tokens, availablePlugins) {
    const nodes = [];
    for (let i = 0; i < tokens.length; i += 1) {
        const node = tokenToNode(tokens[i], availablePlugins);
        if (node) {
            nodes.push(node);
        }
    }
    return nodes;
}
/**
 * Type guard to check if a node is a SlateNode (Element) vs Text
 */
function isSlateNode(node) {
    return node !== null && 'type' in node && 'children' in node;
}
/**
 * Convert a single markdown token to a Slate node
 */
function tokenToNode(token, availablePlugins) {
    const { blocks: availableBlocks } = availablePlugins;
    switch (token.type) {
        case MarkdownBlockTokenType.Paragraph:
            return {
                type: SlateElementType.BlockText,
                children: token.tokens
                    ? inlineTokensToLeaves(token.tokens, availablePlugins)
                    : [{ text: token.text || '' }]
            };
        case MarkdownBlockTokenType.Blockquote:
            if (!availableBlocks.has(SlateElementType.Blockquote)) {
                return {
                    type: SlateElementType.BlockText,
                    children: token.tokens
                        ? inlineTokensToLeaves(token.tokens.flatMap(t => t.tokens || []), availablePlugins)
                        : [{ text: token.text || '' }]
                };
            }
            return {
                type: SlateElementType.Blockquote,
                children: token.tokens
                    ? tokensToNodes(token.tokens, availablePlugins)
                    : [
                        {
                            type: SlateElementType.BlockText,
                            children: [{ text: token.text || '' }]
                        }
                    ]
            };
        case MarkdownBlockTokenType.List: {
            const listType = token.ordered
                ? SlateElementType.OrderedList
                : SlateElementType.UnorderedList;
            const items = token.items || [];
            // If list plugin is not available, render items as plain paragraphs
            if (!availableBlocks.has(listType)) {
                return {
                    type: SlateElementType.BlockText,
                    children: items.flatMap(item => {
                        if (item.tokens) {
                            return inlineTokensToLeaves(item.tokens.flatMap(t => t.tokens || []), availablePlugins);
                        }
                        return [{ text: item.text || '' }];
                    })
                };
            }
            return {
                type: listType,
                start: token.start,
                children: items.map(item => tokenToNode(item, availablePlugins)).filter(isSlateNode)
            };
        }
        case MarkdownBlockTokenType.ListItem:
            return {
                type: SlateElementType.ListItem,
                children: token.tokens
                    ? tokensToNodes(token.tokens, availablePlugins)
                    : [
                        {
                            type: SlateElementType.ListItem,
                            children: [{ text: token.text || '' }]
                        }
                    ]
            };
        case MarkdownBlockTokenType.Space:
            // Skip space tokens
            return null;
        case MarkdownBlockTokenType.Text:
            return { text: token.raw || token.text || '' };
        default:
            // For unknown block types, try to render as text
            if (token.text) {
                return {
                    type: SlateElementType.BlockText,
                    children: [{ text: token.text }]
                };
            }
            return null;
    }
}
//# sourceMappingURL=serializer.js.map