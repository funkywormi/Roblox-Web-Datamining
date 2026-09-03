import React, { FC, useMemo } from 'react';
import { render } from '@rbx/richtext-editor';
import { Document } from '@rbx/richtext';
import { MessageContent } from '../../types';
import { parseDocument } from '../../utils/messageContentUtils';

const Message: FC<{ content: MessageContent }> = ({ content }) => {
  const messageText: string | Document = useMemo(() => {
    const parsed = parseDocument(content);
    return parsed ?? content.plainText?.trim() ?? '';
  }, [content]);

  return (
    <React.Fragment>
      {typeof messageText === 'string' ? messageText : render(messageText)}
    </React.Fragment>
  );
};

export default Message;
