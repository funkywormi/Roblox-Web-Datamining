import React, { MouseEvent, ReactElement, ReactNode } from 'react';
import { Icon, Tooltip, TooltipTrigger } from '@rbx/foundation-ui';
import { LINK_TYPE } from '@rbx/richtext-editor';
import { useFocused, useSelected } from 'slate-react';
import { PluginRenderer, RenderElementProps, useIsStandaloneRenderer } from '@rbx/richtext';

const HTTP_URL = /^https?:\/\//i;
const HIDDEN_PREFIX = /^https:\/\/(?:www\.)?/i;

// In the composer a click must not navigate away, and focus must stay in the editor.
const keepFocusInEditor = (event: MouseEvent<HTMLElement>) => {
  if (event.button === 0) {
    event.preventDefault();
    event.currentTarget.closest<HTMLElement>('[data-slate-editor]')?.focus();
  }
};

const preventDefault = (event: MouseEvent) => event.preventDefault();

const WebLink = ({ attributes, children, element }: RenderElementProps) => {
  const isStandalone = useIsStandaloneRenderer();
  const { url, label, state } = element as { url?: unknown; label?: unknown; state?: unknown };
  const href = typeof url === 'string' ? url.trim() : '';
  // Slate maps the DOM back to the void node through `children`. The read path does not need it.
  const spacer = isStandalone ? null : (children as ReactNode);
  // Selected also covers the caret sitting on the void node.
  const isSelected = useSelected();
  const isFocused = useFocused();
  const selectedClassName = isSelected && isFocused ? ' web-link-selected' : '';

  if (!HTTP_URL.test(href)) {
    const isPending = state === 'pending';
    return (
      <span
        {...attributes}
        contentEditable={false}
        className={`${
          isPending ? 'web-link-pending' : 'web-link-unavailable'
        }${selectedClassName}`}>
        {spacer}
        {!isPending && <Icon name='icon-filled-chain-link-slash' size='XSmall' />}
        <span className='web-link-label'>{typeof label === 'string' ? label : ''}</span>
      </span>
    );
  }

  // The pill shows a shortened url, so the tooltip carries the whole one.
  return (
    <Tooltip position='top-center' title={href} contentClassName='web-link-tooltip'>
      <TooltipTrigger asChild>
        <a
          {...attributes}
          contentEditable={false}
          className={`web-link${selectedClassName}`}
          href={href}
          target='_blank'
          rel='noopener noreferrer nofollow'
          onClick={isStandalone ? undefined : preventDefault}
          onMouseDown={isStandalone ? undefined : keepFocusInEditor}>
          {spacer}
          <Icon name='icon-regular-chain-link' size='XSmall' />
          <span className='web-link-label'>{href.replace(HIDDEN_PREFIX, '') || href}</span>
        </a>
      </TooltipTrigger>
    </Tooltip>
  );
};

// The editor asks every renderer about every element, so a non-link must get `undefined`.
const renderWebLink = (props: RenderElementProps): ReactElement | undefined => {
  const { element } = props;
  return element.type === LINK_TYPE ? <WebLink {...props} /> : undefined;
};

const webLinkRenderer: PluginRenderer = {
  pluginKey: LINK_TYPE,
  renderElement: renderWebLink
};

export default webLinkRenderer;
