import React from 'react';

// The escapes a server-side HTML escaper emits. Decoded in a single pass so double-escaped
// source (`&amp;lt;`) yields the literal `&lt;` rather than being decoded twice.
const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&#x2F;': '/',
  '&nbsp;': ' '
};

const decodeEntities = (text: string): string =>
  text.replace(
    /&(?:amp|lt|gt|quot|nbsp|#39|#x27|#x2F);/g,
    entity => HTML_ENTITIES[entity] ?? entity
  );

/**
 * Render an Elasticsearch highlight fragment, marking the `<em>`-wrapped matches.
 *
 * Segments become React text nodes rather than raw HTML, so nothing here can inject markup.
 * Entities are decoded first, otherwise text the backend escaped shows up literally as `&amp;`.
 *
 * Two accepted limitations:
 * - A highlighted row bypasses MessageContent, so mentions, emotes and links render as plain
 *   text. Only matched search-result rows are affected.
 * - The split assumes balanced, non-nested `<em>`. A stray tag flips the odd/even parity and
 *   marks the wrong halves; worst case is a misplaced highlight, never broken output.
 */
export default function renderHighlightedText(html: string): React.ReactNode[] {
  const parts = html.split(/<em>|<\/em>/);
  return parts.map((part, index) => {
    const text = decodeEntities(part);
    // Positions within one split string: the index is the segment's identity, and a reorder is
    // not possible.
    /* eslint-disable react/no-array-index-key */
    if (index % 2 === 1) {
      return (
        <mark key={index} className='group-forums-search-match'>
          {text}
        </mark>
      );
    }
    return <span key={index}>{text}</span>;
    /* eslint-enable react/no-array-index-key */
  });
}
