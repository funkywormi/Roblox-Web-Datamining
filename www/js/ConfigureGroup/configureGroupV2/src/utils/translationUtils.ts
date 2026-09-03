import type { ReactNode } from 'react';
import { Fragment, createElement } from 'react';

const STRING_ARG_TEST_REGEX = /{(.+?)}/;
const STRING_ARG_REPLACE_REGEX = /{(.+?)}/g;
const STRING_ARG_SPLIT_REGEX = /({.+?})/g;

export const classifyArgs = (args?: {
  [key: string]: string | ReactNode;
}): { stringArgs?: { [key: string]: string }; htmlArgs?: { [key: string]: ReactNode } } =>
  typeof args !== 'undefined'
    ? Object.entries(args).reduce(
        (classifiedArgs, [argName, argValue]) => {
          if (typeof argValue === 'string') {
            Object.assign(classifiedArgs.stringArgs, { [argName]: argValue });
          } else {
            Object.assign(classifiedArgs.htmlArgs, { [argName]: argValue });
          }

          return classifiedArgs;
        },
        {
          stringArgs: {},
          htmlArgs: {},
        },
      )
    : {};

// Replaces {placeholder} tokens in a translation string with values from args.
// Unknown placeholders are left as-is rather than replaced with empty strings.
export function substituteStringArgs(
  translation: string,
  args?: { [key: string]: string },
): string {
  return typeof args !== 'undefined' && Object.keys(args).length !== 0
    ? translation.replace(
        STRING_ARG_REPLACE_REGEX,
        (_, argName: string) => args[argName] ?? `{${argName}}`,
      )
    : translation;
}

// Converts a translated string containing placeholder tokens into a React node tree.
// Handles two kinds of substitutions:
//   - htmlArgs: single tokens like {iconNode} replaced with an arbitrary ReactNode
//   - tags: open/close pairs like {bold}/{/bold} whose content is passed to a render fn
// Tags may be nested; the stack tracks depth so inner tags resolve before outer ones.
export function buildHTMLTranslation(
  translation: string,
  key: string,
  resourceKey: string,
  locale: string,
  tags?: Array<{
    opening: string;
    closing: string;
    content: (chunks: ReactNode) => ReactNode;
  }> | null,
  htmlArgs?: { [key: string]: ReactNode },
): ReactNode {
  // Split the string on every {placeholder} token so we can process each piece.
  // The regex split can produce empty strings when two tokens are adjacent or a
  // token is at the start/end of the string; those are filtered below.
  let translationChunks: ReactNode[] = translation.split(STRING_ARG_SPLIT_REGEX);
  // A string with no tokens splits into exactly one chunk (itself), so length === 1
  // is a reliable signal that there is nothing to substitute — return as-is.
  if (translationChunks.length === 1) {
    return translation;
  }
  translationChunks = translationChunks.filter((chunk) => !!chunk);

  if (typeof htmlArgs !== 'undefined' && Object.keys(htmlArgs).length !== 0) {
    // Map each placeholder name to the chunk indices where it appears, so we can
    // replace the token strings with their ReactNode values in a second pass.
    type THTMLArgNameIndicesMapping = {
      [argName: string]: number[];
    };
    const htmlArgNameIndicesMapping: THTMLArgNameIndicesMapping =
      translationChunks.reduce<THTMLArgNameIndicesMapping>((mapping, arg, index) => {
        if (typeof arg !== 'string') {
          return mapping;
        }
        const result = STRING_ARG_TEST_REGEX.exec(arg);

        if (result) {
          // result[1] is the first parenthesized substring match, which is the argument name
          const argName = result[1];
          if (Object.hasOwn(htmlArgs, argName)) {
            const indices = mapping[argName];

            if (!indices) {
              return Object.assign(mapping, { [argName]: [index] });
            }

            indices.push(index);
          }
        }

        return mapping;
      }, {});

    // Swap each matched token chunk with its ReactNode replacement.
    Object.entries(htmlArgs).forEach(([argName, argValue]) => {
      if (Object.hasOwn(htmlArgNameIndicesMapping, argName)) {
        const indices = htmlArgNameIndicesMapping[argName];
        for (const argIndex of indices) {
          translationChunks[argIndex] = argValue;
        }
      }
    });
  }

  // No tags to process — spread into a Fragment rather than returning a plain array
  // to avoid React's missing-key-prop warning on arrays of mixed content.
  if (!Array.isArray(tags) || tags.length === 0) {
    return createElement(Fragment, null, ...translationChunks);
  }

  // Build a lookup keyed by opening token string (e.g. "{bold}") so we can
  // quickly find the expected closing token and render function for each tag.
  const tagsLookupDict: {
    [key: string]: { match: string; content: (chunks: ReactNode) => ReactNode };
  } = tags.reduce(
    (dict, { opening, closing, content }) =>
      Object.assign(dict, { [`{${opening}}`]: { match: `{${closing}}`, content } }),
    {},
  );

  const translatedHTML: ReactNode[] = [];
  let chunk: ReactNode;
  // The algorithm assumes well-formed input: every opening tag has a matching
  // closing tag to its right, and tag pairs never interleave (i.e. {a}{b}{/a}{/b}
  // is invalid; {a}{b}{/b}{/a} is fine). Behaviour outside these constraints is
  // undefined and produces a console.warn.
  // matchingOpeningTags tracks the nesting order; tagChunkStack accumulates
  // content (including already-resolved inner tags) between open and close tokens.
  const matchingOpeningTags: string[] = [];
  const tagChunkStack: ReactNode[] = [];

  // eslint-disable-next-line no-cond-assign
  while ((chunk = translationChunks.shift())) {
    if (typeof chunk === 'string' && STRING_ARG_TEST_REGEX.test(chunk)) {
      if (Object.hasOwn(tagsLookupDict, chunk)) {
        // Opening tag — push onto both stacks to track nesting depth.
        matchingOpeningTags.push(chunk);
        tagChunkStack.push(chunk);
      } else {
        const currentOpeningTag = matchingOpeningTags.pop();
        if (typeof currentOpeningTag !== 'undefined') {
          const { match, content } = tagsLookupDict[currentOpeningTag];
          if (chunk === match) {
            // Closing tag matched — pop everything back to the opening sentinel
            // to collect the inner chunks, then apply the render function.
            const currChunks: ReactNode[] = [];

            let tagChunk: ReactNode;
            // eslint-disable-next-line no-cond-assign
            while ((tagChunk = tagChunkStack.pop())) {
              if (tagChunk !== currentOpeningTag) {
                currChunks.unshift(tagChunk);
              } else {
                let htmlChunk: ReactNode = null;
                // When children contain non-primitive React elements in an array,
                // React performs a unique-key check and emits warnings. Wrapping
                // mixed content in a Fragment suppresses that — see formatjs/react-intl
                // message.tsx for the same pattern.
                // Pure-string arrays are passed directly since no key check applies.
                if (currChunks.every((currChunk) => typeof currChunk === 'string')) {
                  htmlChunk = content(currChunks);
                } else {
                  const mergedChunk = createElement(Fragment, null, ...currChunks);
                  htmlChunk = content(mergedChunk);
                }

                // If we're at the top level push to the result; otherwise the resolved
                // chunk becomes content for an outer tag still on the stack.
                if (tagChunkStack.length === 0) {
                  translatedHTML.push(htmlChunk);
                } else {
                  tagChunkStack.push(htmlChunk);
                }
                break;
              }
            }

            if (typeof tagChunk === 'undefined') {
              // eslint-disable-next-line no-console
              console.warn(
                `[From context - ${resourceKey}] Unexpected condition encountered inside translateHTML for key ${key} of locale ${locale}!`,
              );
              break;
            }
          } else {
            // eslint-disable-next-line no-console
            console.warn(
              `[From context - ${resourceKey}] Unmatched closing tag ${chunk} encountered inside translateHTML for key ${key} of locale ${locale}!`,
            );
            break;
          }
        } else {
          // eslint-disable-next-line no-console
          console.warn(
            `[From context - ${resourceKey}] Unexpected condition encountered inside translateHTML for key ${key} of locale ${locale}!`,
          );
          break;
        }
      }
    } else if (tagChunkStack.length === 0) {
      translatedHTML.push(chunk);
    } else {
      tagChunkStack.push(chunk);
    }
  }

  return createElement(Fragment, null, ...translatedHTML);
}
