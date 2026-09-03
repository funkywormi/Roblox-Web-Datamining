/**
 * Serializer that converts markdown tokens to Slate nodes
 */
import { MarkdownInlineTokenType, MarkdownBlockTokenType, SlateElementType, SlateMarkType } from './types.js';
/**
 * Apply marks to all leaves in an array
 */
function applyMarksToLeaves(leaves, marks) {
    return leaves.map(leaf => ({
        ...leaf,
        ...marks
    }));
}
/**
 * Convert a single inline token to Slate text leaf(ves)
 */
function inlineTokenToLeaf(token, availableMarks) {
    const marks = {};
    switch (token.type) {
        case MarkdownInlineTokenType.Text:
            return [{ text: token.text || '', ...marks }];
        case MarkdownInlineTokenType.Strong:
            if (availableMarks.has(SlateMarkType.Bold)) {
                marks[SlateMarkType.Bold] = true;
            }
            if (token.tokens) {
                return applyMarksToLeaves(inlineTokensToLeaves(token.tokens, availableMarks), marks);
            }
            return [{ text: token.text || '', ...marks }];
        case MarkdownInlineTokenType.Em:
            if (availableMarks.has(SlateMarkType.Italic)) {
                marks[SlateMarkType.Italic] = true;
            }
            if (token.tokens) {
                return applyMarksToLeaves(inlineTokensToLeaves(token.tokens, availableMarks), marks);
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
                return applyMarksToLeaves(inlineTokensToLeaves(token.tokens, availableMarks), marks);
            }
            return [{ text: token.text || '', ...marks }];
        case MarkdownInlineTokenType.Del:
            if (availableMarks.has(SlateMarkType.Linethrough)) {
                marks[SlateMarkType.Linethrough] = true;
            }
            if (token.tokens) {
                return applyMarksToLeaves(inlineTokensToLeaves(token.tokens, availableMarks), marks);
            }
            return [{ text: token.text || '', ...marks }];
        case MarkdownInlineTokenType.Br:
            return [{ text: '\n' }];
        default:
            // For unknown inline types, just render as text
            return [{ text: token.raw || token.text || '' }];
    }
}
/**
 * Convert inline tokens to Slate text leaves with marks
 */
function inlineTokensToLeaves(tokens, availableMarks) {
    const leaves = [];
    for (let i = 0; i < tokens.length; i += 1) {
        const leaf = inlineTokenToLeaf(tokens[i], availableMarks);
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
    const { blocks: availableBlocks, marks: availableMarks } = availablePlugins;
    switch (token.type) {
        case MarkdownBlockTokenType.Paragraph:
            return {
                type: SlateElementType.BlockText,
                children: token.tokens
                    ? inlineTokensToLeaves(token.tokens, availableMarks)
                    : [{ text: token.text || '' }]
            };
        case MarkdownBlockTokenType.Blockquote:
            // If blockquote plugin is not available, render as a plain paragraph
            if (!availableBlocks.has(SlateElementType.Blockquote)) {
                return {
                    type: SlateElementType.BlockText,
                    children: token.tokens
                        ? inlineTokensToLeaves(token.tokens.flatMap(t => t.tokens || []), availableMarks)
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
                            return inlineTokensToLeaves(item.tokens.flatMap(t => t.tokens || []), availableMarks);
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