import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { Icon, Tooltip, TooltipTrigger } from '@rbx/foundation-ui';
import { groupsConfig } from '../translation.config';
import AccessibleDivButton from '../../shared/components/AccessibleDivButton';
import {
  logCmntyForumsConcealedContentShownEvent,
  logCmntyForumsConcealedContentRevealedEvent
} from '../../shared/utils/logging';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import { useEntrypointImpressionId } from '../../shared/utils/entrypointMetrics';

type ConcealableEntity = 'comment' | 'post' | 'reply';

type EntityKeys = {
  showOne: string;
  showMany: string;
  hideOne: string;
  hideMany: string;
  tooltipTitle: string;
  tooltipBody: string;
  headerOne?: string;
  headerMany?: string;
};

const CONCEAL_KEYS: Record<'comment' | 'post', EntityKeys> = {
  comment: {
    showOne: 'Action.ShowHiddenMessage',
    showMany: 'Action.ShowHiddenMessages',
    hideOne: 'Action.HideHiddenMessage',
    hideMany: 'Action.HideHiddenMessages',
    tooltipTitle: 'Label.WhyHiddenTitle',
    tooltipBody: 'Label.WhyHiddenBody'
  },
  post: {
    showOne: 'Action.ShowHiddenPost',
    showMany: 'Action.ShowHiddenPosts',
    hideOne: 'Action.HideHiddenPost',
    hideMany: 'Action.HideHiddenPosts',
    tooltipTitle: 'Label.WhyHiddenPostsTitle',
    tooltipBody: 'Label.WhyHiddenPostsBody',
    headerOne: 'Label.HiddenPostHeader',
    headerMany: 'Label.HiddenPostsHeader'
  }
};

// Controlled by the parent, which owns reveal state. `isRevealed` is the user's toggle;
// `isForceRevealed` (deep-link / just-arrived) shows the items inline with no toggle.
export type ConcealedMessagesProps = {
  count: number;
  renderItems: () => React.ReactNode;
  isRevealed: boolean;
  onToggle: () => void;
  isForceRevealed?: boolean;
  messageType?: ConcealableEntity;
} & WithTranslationsProps;

const ConcealedMessages = ({
  count,
  renderItems,
  isRevealed,
  onToggle,
  isForceRevealed = false,
  messageType = 'comment',
  translate
}: ConcealedMessagesProps): JSX.Element => {
  const { features } = useCommunityProductFeatures();
  const keys = CONCEAL_KEYS[messageType === 'post' ? 'post' : 'comment'];

  const concealmentImpressionId = useEntrypointImpressionId();

  const isCollapsed = !isForceRevealed && !isRevealed;
  const hasLoggedShownRef = useRef(false);
  useEffect(() => {
    if (isCollapsed && !hasLoggedShownRef.current && features.ForumConcealment) {
      hasLoggedShownRef.current = true;
      logCmntyForumsConcealedContentShownEvent({
        contentType: messageType,
        concealedCount: count,
        concealmentImpressionId
      });
    }
  }, [isCollapsed, messageType, count, concealmentImpressionId, features.ForumConcealment]);

  const renderToggle = (label: string, expanded: boolean): JSX.Element => {
    // Only the collapsed -> expanded reveal is logged, not re-collapse.
    const handleToggle = (): void => {
      if (!expanded && features.ForumConcealment) {
        logCmntyForumsConcealedContentRevealedEvent({
          contentType: messageType,
          concealedCount: count,
          concealmentImpressionId
        });
      }
      onToggle();
    };

    return (
      <div
        className={classNames(
          'group-forums-concealed-run',
          expanded && 'group-forums-concealed-run-revealed'
        )}>
        {messageType !== 'post' && <span className='group-forums-concealed-run-dash' />}
        <AccessibleDivButton
          className='group-forums-concealed-run-toggle'
          aria-expanded={expanded}
          aria-label={label}
          onClick={handleToggle}>
          {label}
        </AccessibleDivButton>
        <Tooltip
          position='bottom-start'
          title={translate(keys.tooltipTitle)}
          description={translate(keys.tooltipBody)}>
          <TooltipTrigger asChild>
            <span className='group-forums-concealed-run-info' aria-hidden>
              <Icon name='icon-regular-circle-i' size='Small' />
            </span>
          </TooltipTrigger>
        </Tooltip>
      </div>
    );
  };

  if (isForceRevealed) {
    return <React.Fragment>{renderItems()}</React.Fragment>;
  }

  if (isRevealed) {
    const hideLabel = count === 1 ? translate(keys.hideOne) : translate(keys.hideMany, { count });
    const headerLabel =
      keys.headerOne && keys.headerMany
        ? translate(count === 1 ? keys.headerOne : keys.headerMany)
        : undefined;
    return (
      <React.Fragment>
        {headerLabel && <div className='group-forums-concealed-run-cue'>{headerLabel}</div>}
        {renderItems()}
        {renderToggle(hideLabel, true)}
      </React.Fragment>
    );
  }

  const showLabel = count === 1 ? translate(keys.showOne) : translate(keys.showMany, { count });

  return renderToggle(showLabel, false);
};

export default withTranslations(ConcealedMessages, groupsConfig);
