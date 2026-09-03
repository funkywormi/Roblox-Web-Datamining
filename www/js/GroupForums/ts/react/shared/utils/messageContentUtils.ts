import {
  DEFAULT_BLOCK_TYPE,
  Document,
  getPlaintext,
  hasRichTextContent as hasRichTextContentRbx
} from '@rbx/richtext';
import { MessageContent } from '../types';

export type MessageContentFragment = {
  content?: string;
  slate?: string;
};

export const createMessageContentFragment = (content: MessageContent): MessageContentFragment => {
  if (content.slate) {
    return {
      slate: JSON.stringify(content.slate)
    };
  }

  return { content: content.plainText || '' };
};

export const parseDocument = (content: MessageContent): Document | undefined => {
  if (content.slate) {
    // attempt to parse slate content only if its a string
    if (typeof content.slate === 'string') {
      try {
        return JSON.parse(content.slate) as Document;
      } catch (e) {
        // return undefined if parsing fails
      }
    } else if (typeof content.slate === 'object') {
      return content.slate;
    }
  }

  return undefined;
};

export const createSimpleSlateContent = (text: string): MessageContent => {
  return {
    slate: {
      type: 'document',
      children: [
        {
          type: DEFAULT_BLOCK_TYPE,
          children: [{ text }]
        }
      ]
    }
  };
};

export const hasRichTextContent = (content: MessageContent): boolean => {
  const document = parseDocument(content);
  return document ? hasRichTextContentRbx(document) : false;
};

// Flattens a MessageContent to plain text: returns `plainText` directly when the field is plain,
// otherwise delegates to @rbx/richtext's `getPlaintext`.
export const getPlainText = (content: MessageContent): string => {
  if (content.plainText) {
    return content.plainText;
  }
  const document = parseDocument(content);
  return document ? getPlaintext(document) : '';
};
