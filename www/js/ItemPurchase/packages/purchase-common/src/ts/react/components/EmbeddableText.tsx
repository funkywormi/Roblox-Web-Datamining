import React from 'react';
import clsx from 'clsx';

/** Private-use code point for the Robux icon in marketplace embeddable strings. */
export const EMBEDDABLE_ROBUX_ICON_CODE_POINT = 0xe002;

const EMBEDDABLE_ROBUX_CHARACTER = String.fromCodePoint(EMBEDDABLE_ROBUX_ICON_CODE_POINT);

/** Matches the Robux embeddable character and common escaped literal forms from APIs. */
const EMBEDDABLE_ROBUX_TOKEN_PATTERN = new RegExp(
  `${EMBEDDABLE_ROBUX_CHARACTER}|\\\\u\\{E002\\}|\\\\uE002`,
  'gi'
);

export function containsEmbeddableRobuxIcon(text: string): boolean {
  EMBEDDABLE_ROBUX_TOKEN_PATTERN.lastIndex = 0;
  return EMBEDDABLE_ROBUX_TOKEN_PATTERN.test(text);
}

/** Plain-text fallback for aria labels and other non-rich contexts. */
export function stripEmbeddableCodes(text: string): string {
  return text
    .replace(EMBEDDABLE_ROBUX_TOKEN_PATTERN, ' Robux ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function parseEmbeddableText(text: string): React.ReactNode[] {
  if (!containsEmbeddableRobuxIcon(text)) {
    return [text];
  }

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  const pattern = new RegExp(EMBEDDABLE_ROBUX_TOKEN_PATTERN.source, 'gi');
  let match = pattern.exec(text);

  while (match) {
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, matchIndex));
    }

    nodes.push(
      <span
        key={`robux-icon-${matchIndex}`}
        className='icon-robux-16x16 inline-block align-text-bottom'
        aria-hidden
      />
    );

    lastIndex = matchIndex + match[0].length;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export type EmbeddableTextProps = {
  text: string;
  className?: string;
  id?: string;
};

export const EmbeddableText: React.FC<EmbeddableTextProps> = ({ text, className, id }) => {
  return (
    <span id={id} className={clsx('inline', className)}>
      {parseEmbeddableText(text)}
    </span>
  );
};

export default EmbeddableText;
