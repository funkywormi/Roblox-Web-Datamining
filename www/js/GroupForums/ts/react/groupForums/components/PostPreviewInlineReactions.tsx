import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useSystemFeedback } from 'react-style-guide';
import { Popover, PopoverContent, PopoverTrigger } from '@rbx/foundation-ui';
import classNames from 'classnames';
import { Reaction, ForumPost } from '../types';
import { groupsConfig } from '../translation.config';
import ReactionPicker from '../../shared/components/reactions/ReactionPicker';
import ReactionEmote from '../../shared/components/reactions/ReactionEmote';
import AnimatedAbbreviatedCount from '../../shared/components/AnimatedAbbreviatedCount';
import { useEmotes } from '../../shared/contexts/EmoteContext';
import { useForumPermissions } from '../contexts/ForumPermissionsContext';
import { CommunityFeatureFreezesContext } from '../../shared/contexts/CommunityFeatureFreezesContext';
import forumsService from '../services/forumsService';
import { logGroupForumsClickEvent } from '../../shared/utils/logging';
import '../../../../css/tailwind.css';

export const REACTION_PICKER_POPOVER_CLASS = 'group-forums-inline-reaction-picker';

const PICKER_HOVER_CLOSE_DELAY_MS = 300;
const PICKER_LAYOUT_PROPERTY = '--inline-reaction-picker-layout';
// Mirror the chip gap and overflow chip width from _commentReactions.scss.
const CHIP_GAP_PX = 8;
const OVERFLOW_CHIP_WIDTH_PX = 30;

// _postPreviewInlineReactions.scss owns the width at which the picker becomes a sheet.
const useIsPickerSheetLayout = (): boolean => {
  const [isSheetLayout, setIsSheetLayout] = useState(false);

  useEffect(() => {
    const readLayout = () => {
      const layout = getComputedStyle(document.documentElement)
        .getPropertyValue(PICKER_LAYOUT_PROPERTY)
        .trim();
      setIsSheetLayout(layout === 'sheet');
    };

    readLayout();
    window.addEventListener('resize', readLayout);
    return () => window.removeEventListener('resize', readLayout);
  }, []);

  return isSheetLayout;
};

export type PostPreviewInlineReactionsProps = {
  post: ForumPost;
  isCategoryArchived?: boolean;
  isOpenRequested?: boolean;
  onOpenRequestHandled?: () => void;
} & WithTranslationsProps;

const PostPreviewInlineReactions = ({
  post,
  isCategoryArchived = false,
  isOpenRequested,
  onOpenRequestHandled,
  translate
}: PostPreviewInlineReactionsProps): JSX.Element | null => {
  const { emoteList, getEmoteById } = useEmotes();
  const { canReact } = useForumPermissions();
  // The About tab mounts these cards outside the freeze provider, where the hook throws. Reading
  // the context takes its permissive default there and the real value on the category feed.
  const { forumsWrite } = useContext(CommunityFeatureFreezesContext);
  const canToggleReactions = canReact && !isCategoryArchived && !forumsWrite.isDisabled;
  const { systemFeedbackService } = useSystemFeedback();
  const showBottomSheet = useIsPickerSheetLayout();

  // A toggle updates one reaction on its own, so the post only seeds this and reseeds on a refetch.
  const initialReactions = post.firstComment.reactions;
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const hasReactionsContent = canToggleReactions || reactions.length > 0;
  const triggerRef = useRef<HTMLDivElement>(null);
  const pendingReactionIds = useRef(new Set<string>());
  const hoverCloseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setReactions(initialReactions);
  }, [initialReactions]);

  // A request left standing would make the next one a no-op and stop the long press working.
  useEffect(() => {
    if (!isOpenRequested) return;
    setIsPickerOpen(true);
    onOpenRequestHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenRequested]);
  const [visibleCount, setVisibleCount] = useState<number | undefined>(undefined);
  const [measureKey, setMeasureKey] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);

  const areReactionCountsVisible = useMemo(
    () => reactions.every(reaction => !!reaction.areReactionCountsVisible),
    [reactions]
  );

  const measureVisibleCount = useCallback(() => {
    const container = measureRef.current;
    if (!container || reactions.length === 0) {
      setVisibleCount(undefined);
      return;
    }

    const chips = Array.from(container.children) as HTMLElement[];
    const containerWidth = container.clientWidth;
    let totalWidth = 0;
    let count = 0;

    for (let i = 0; i < chips.length; i += 1) {
      const chipWidth = chips[i].offsetWidth + (i > 0 ? CHIP_GAP_PX : 0);
      const isLastChip = i === chips.length - 1;
      const spaceForOverflow = isLastChip ? 0 : OVERFLOW_CHIP_WIDTH_PX + CHIP_GAP_PX;
      if (totalWidth + chipWidth + spaceForOverflow > containerWidth) {
        break;
      }
      totalWidth += chipWidth;
      count += 1;
    }

    setVisibleCount(count >= reactions.length ? undefined : count);
  }, [reactions]);

  const triggerRemeasure = useCallback(() => {
    setVisibleCount(undefined);
    setMeasureKey(k => k + 1);
  }, []);

  // Every chip is in the DOM while the count is undefined, which is when a measurement is valid.
  useLayoutEffect(() => {
    if (visibleCount === undefined) {
      measureVisibleCount();
    }
  }, [measureKey, visibleCount, measureVisibleCount]);

  // Anything that changes a chip's width has to be measured again, and a refetch that brings the
  // same reactions back must not, because a measurement shows every chip for a frame first.
  const chipWidthSignature = useMemo(
    () =>
      reactions
        .map(
          reaction =>
            `${reaction.emoteId}:${reaction.reactionCount}:${
              reaction.hasUserAppliedReaction ? 1 : 0
            }:${reaction.areReactionCountsVisible ? 1 : 0}`
        )
        .join(','),
    [reactions]
  );

  useLayoutEffect(() => {
    triggerRemeasure();
  }, [chipWidthSignature, triggerRemeasure]);

  useLayoutEffect(() => {
    const container = measureRef.current;
    if (!container) return undefined;
    const observer = new ResizeObserver(() => triggerRemeasure());
    observer.observe(container);
    return () => observer.disconnect();
  }, [hasReactionsContent, triggerRemeasure]);

  const displayedReactions =
    visibleCount !== undefined ? reactions.slice(0, visibleCount) : reactions;

  const hiddenCount = visibleCount !== undefined ? reactions.length - visibleCount : 0;

  const handleToggleReaction = useCallback(
    async (emoteId: string) => {
      if (!canToggleReactions || pendingReactionIds.current.has(emoteId)) return;
      pendingReactionIds.current.add(emoteId);

      const previousIndex = reactions.findIndex(reaction => reaction.emoteId === emoteId);
      const previousReaction = reactions[previousIndex];
      const togglingOn = !previousReaction?.hasUserAppliedReaction;

      setReactions(current => {
        const existing = current.find(reaction => reaction.emoteId === emoteId);
        if (!existing) {
          return [
            ...current,
            { emoteId, reactionCount: 1, hasUserAppliedReaction: true, areReactionCountsVisible }
          ];
        }
        return current
          .map(reaction => {
            if (reaction.emoteId !== emoteId) return reaction;
            const reactionCount = reaction.reactionCount + (togglingOn ? 1 : -1);
            return reactionCount === 0
              ? null
              : { ...reaction, reactionCount, hasUserAppliedReaction: togglingOn };
          })
          .filter((reaction): reaction is Reaction => reaction !== null);
      });
      setIsPickerOpen(false);

      try {
        const metadata = { categoryId: post.categoryId, postId: post.id, isPostComment: true };
        await forumsService.toggleGroupForumReaction(
          post.groupId,
          post.id,
          post.firstComment.id,
          emoteId,
          togglingOn,
          metadata
        );
        logGroupForumsClickEvent({
          groupId: post.groupId,
          clickTargetType: `toggleInlineReaction${togglingOn ? 'On' : 'Off'}`,
          clickTargetId: emoteId
        });
      } catch {
        // Another emote may have succeeded while this request was in flight.
        setReactions(current => {
          const restored = current.filter(reaction => reaction.emoteId !== emoteId);
          if (previousReaction) restored.splice(previousIndex, 0, previousReaction);
          return restored;
        });
        systemFeedbackService.warning(translate('NetworkError'));
      } finally {
        pendingReactionIds.current.delete(emoteId);
      }
    },
    [
      reactions,
      canToggleReactions,
      post,
      areReactionCountsVisible,
      systemFeedbackService,
      translate
    ]
  );

  const handlePickerSelect = useCallback(
    (emoteId: string) => {
      // eslint-disable-next-line no-void
      void handleToggleReaction(emoteId);
    },
    [handleToggleReaction]
  );

  const cancelHoverClose = useCallback(() => {
    if (hoverCloseTimeout.current) {
      clearTimeout(hoverCloseTimeout.current);
      hoverCloseTimeout.current = null;
    }
  }, []);

  const openPicker = useCallback(() => {
    cancelHoverClose();
    setIsPickerOpen(true);
  }, [cancelHoverClose]);

  // A div takes no key press of its own, and the card opens the post on the same keys.
  const handleTriggerKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    setIsPickerOpen(current => !current);
  }, []);

  const scheduleHoverClose = useCallback(() => {
    if (hoverCloseTimeout.current) return;
    hoverCloseTimeout.current = setTimeout(() => {
      hoverCloseTimeout.current = null;
      setIsPickerOpen(false);
    }, PICKER_HOVER_CLOSE_DELAY_MS);
  }, []);

  // The picker is portaled out of the card, so it is not a descendant of the trigger and CSS :hover
  // cannot span both. Hit testing natively also covers the gap left by the popover's side offset.
  useEffect(() => {
    if (!isPickerOpen || showBottomSheet) return undefined;

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || event.pointerType === 'touch') return;

      const pickerId = triggerRef.current?.getAttribute('aria-controls');
      const isPointerOnTriggerOrPicker =
        triggerRef.current?.contains(target) ||
        (pickerId && document.getElementById(pickerId)?.contains(target));

      if (isPointerOnTriggerOrPicker) {
        cancelHoverClose();
      } else {
        scheduleHoverClose();
      }
    };

    document.addEventListener('pointerover', handlePointerOver);
    return () => {
      document.removeEventListener('pointerover', handlePointerOver);
      cancelHoverClose();
    };
  }, [isPickerOpen, showBottomSheet, cancelHoverClose, scheduleHoverClose]);

  if (!hasReactionsContent) {
    return null;
  }

  return (
    <div className='post-preview-inline-reactions'>
      <div className='group-forums-comment-reactions'>
        {canToggleReactions && (
          <div
            role='presentation'
            onContextMenu={e => {
              e.preventDefault();
              e.stopPropagation();
            }}>
            {showBottomSheet ? (
              <div
                ref={triggerRef}
                role='button'
                tabIndex={0}
                className='group-forums-comment-reactions-add-new outline-none'
                aria-label={translate('Action.React')}
                onPointerDown={e => e.stopPropagation()}
                onKeyDown={handleTriggerKeyDown}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPickerOpen(true);
                }}>
                <span className='group-forums-comment-reactions-add-new-icon' />
              </div>
            ) : (
              <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
                <PopoverTrigger asChild>
                  <div
                    ref={triggerRef}
                    role='button'
                    tabIndex={0}
                    className='group-forums-comment-reactions-add-new outline-none'
                    aria-label={translate('Action.React')}
                    onPointerDown={e => e.stopPropagation()}
                    onPointerEnter={e => {
                      if (e.pointerType !== 'touch') openPicker();
                    }}
                    onKeyDown={handleTriggerKeyDown}
                    onPointerUp={e => {
                      if (e.pointerType !== 'touch') return;
                      e.stopPropagation();
                      setIsPickerOpen(current => !current);
                    }}
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}>
                    <span className='group-forums-comment-reactions-add-new-icon' />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  side='bottom'
                  align='center'
                  ariaLabel={translate('Action.React')}
                  className={`${REACTION_PICKER_POPOVER_CLASS} bg-surface-300 radius-medium`}
                  onOpenAutoFocus={e => e.preventDefault()}>
                  <ReactionPicker emotes={emoteList} onSelect={handlePickerSelect} />
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}
        <div ref={measureRef} className='group-forums-comment-reactions-container'>
          {displayedReactions.map(reaction => {
            const emote = getEmoteById(reaction.emoteId);
            const emoteUrl = emote?.url ?? '';
            return (
              <div
                key={reaction.emoteId}
                role='button'
                tabIndex={0}
                className={classNames('group-forums-comment-reactions-reaction outline-none', {
                  'group-forums-comment-reactions-reaction-active': reaction.hasUserAppliedReaction
                })}
                onPointerDown={e => e.stopPropagation()}
                onPointerUp={e => e.stopPropagation()}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  // eslint-disable-next-line no-void
                  void handleToggleReaction(reaction.emoteId);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    // eslint-disable-next-line no-void
                    void handleToggleReaction(reaction.emoteId);
                  }
                }}>
                <ReactionEmote emoteId={reaction.emoteId} emoteUrl={emoteUrl} size={16} />
                {areReactionCountsVisible && (
                  <AnimatedAbbreviatedCount
                    variant='reaction'
                    value={reaction.reactionCount}
                    className={classNames({
                      'font-bold': reaction.hasUserAppliedReaction
                    })}
                  />
                )}
              </div>
            );
          })}
          {hiddenCount > 0 && (
            <div className='group-forums-comment-reactions-reaction outline-none'>
              {/* eslint-disable-next-line react/jsx-no-literals */}
              {`+${hiddenCount}`}
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet: rendered in a portal outside the <a> tag */}
      {canToggleReactions &&
        showBottomSheet &&
        isPickerOpen &&
        createPortal(
          <div
            className='post-preview-inline-reactions-mobile-overlay'
            role='presentation'
            onClick={() => setIsPickerOpen(false)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                setIsPickerOpen(false);
              }
            }}>
            <div
              className='post-preview-inline-reactions-mobile-sheet'
              role='presentation'
              onClick={e => e.stopPropagation()}>
              <ReactionPicker emotes={emoteList} onSelect={handlePickerSelect} />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default withTranslations(PostPreviewInlineReactions, groupsConfig);
