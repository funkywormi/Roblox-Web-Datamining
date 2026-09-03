/**
 * Types for markdown parsing and token handling
 */
/**
 * Markdown block token type constants (from marked lexer)
 */
export const MarkdownBlockTokenType = {
    Paragraph: 'paragraph',
    Blockquote: 'blockquote',
    List: 'list',
    ListItem: 'list_item',
    Space: 'space',
    Text: 'text'
};
/**
 * Markdown token type constants (from marked lexer)
 */
export const MarkdownInlineTokenType = {
    Text: 'text',
    Strong: 'strong',
    Em: 'em',
    Codespan: 'codespan',
    Underline: 'underline',
    Del: 'del',
    Br: 'br'
};
/**
 * Slate element type constants for serialization
 * These correspond to the plugin keys used in the richtext editor
 */
export const SlateElementType = {
    BlockText: 'block-text',
    Blockquote: 'blockquote',
    OrderedList: 'ordered-list',
    UnorderedList: 'unordered-list',
    ListItem: 'list-item'
};
/**
 * Slate mark type constants for serialization
 * These correspond to the mark plugin keys used in the richtext editor
 */
export const SlateMarkType = {
    Bold: 'bold',
    Italic: 'italic',
    Codespan: 'codespan',
    Underline: 'underline',
    Linethrough: 'linethrough'
};
/**
 * Mapping of markdown token types to richtext plugin keys
 */
export const TOKEN_TO_PLUGIN_KEY = {
    [MarkdownInlineTokenType.Strong]: SlateMarkType.Bold,
    [MarkdownInlineTokenType.Em]: SlateMarkType.Italic,
    [MarkdownInlineTokenType.Codespan]: SlateMarkType.Codespan,
    [MarkdownInlineTokenType.Underline]: SlateMarkType.Underline,
    [MarkdownInlineTokenType.Del]: SlateMarkType.Linethrough,
    [MarkdownBlockTokenType.Blockquote]: SlateElementType.Blockquote
};
//# sourceMappingURL=types.js.map