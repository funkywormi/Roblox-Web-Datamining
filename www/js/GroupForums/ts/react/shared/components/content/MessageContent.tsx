import React, { FC, useMemo } from 'react';
import { createRenderers } from '@rbx/richtext-editor';
import { Document, Renderer } from '@rbx/richtext';
import { MessageContent } from '../../types';
import { parseDocument } from '../../utils/messageContentUtils';
import webLinkRenderer from './WebLink';

// The last renderer for a plugin key wins.
const messageRenderer = new Renderer([...createRenderers(), webLinkRenderer]);

const Message: FC<{ content: MessageContent }> = ({ content }) => {
  const messageText: string | Document = useMemo(() => {
    const parsed = parseDocument(content);
    return parsed ?? content.plainText?.trim() ?? '';
  }, [content]);

  return (
    <React.Fragment>
      {typeof messageText === 'string' ? messageText : messageRenderer.render(messageText)}
    </React.Fragment>
  );
};

export default Message;
