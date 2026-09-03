import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fireEvent } from 'roblox-event-tracker';
import classNames from 'classnames';
import { authenticatedUser } from 'header-scripts';
import { eventStreamService } from 'core-roblox-utilities';
import { Link } from 'react-style-guide';
import { withTranslations, TranslateFunction } from 'react-utilities';
import { useCollectionItemsIntersectionTracker } from '@rbx/unified-logging';
import socialLinksService from '../services/socialLinksService';
import { TGetGameSocialLinksResponse, TSocialLinkJumbotronType } from '../types/socialLinksType';
import socialLinksConstants from '../constants/socialLinksConstants';
import eventStreamConstants from '../constants/eventStreamConstants';
import { socialLinksTranslationConfig } from '../translation.config';

const { socialLinksTranslationMap, iconMap, socialLinksCounterEvents } = socialLinksConstants;

type TSocialLinksJumbotronProps = {
  type: TSocialLinkJumbotronType;
  targetId: string;
  referralSessionInfo?: Record<string, string>;
  translate: TranslateFunction;
};

export const SocialLinksJumbotron = ({
  type,
  targetId,
  referralSessionInfo,
  translate
}: TSocialLinksJumbotronProps): JSX.Element | null => {
  const [socialLinks, setSocialLinks] = useState<TGetGameSocialLinksResponse[] | undefined>(
    undefined
  );
  const onLinkClick = (link: TGetGameSocialLinksResponse) => {
    const assignmentId = Number.parseInt(targetId, 10);

    if (Number.isNaN(assignmentId)) {
      fireEvent(socialLinksCounterEvents.SocialLinkJumbotronUnableToConvertAssignmentIdToNumber);
    }

    const eventParams = {
      assignmentId: !Number.isNaN(assignmentId) ? assignmentId : ((targetId as unknown) as number),
      assignmentType: type === TSocialLinkJumbotronType.Game ? 'game' : 'unknown',
      socialLinkType: link.type,
      socialLinkUrl: link.url,
      socialLinkDisplayType: 'badge',
      ...referralSessionInfo
    };

    eventStreamService.sendEvent(...eventStreamConstants.socialLinkClickEvent(eventParams));
    window.open(link.url, '_blank');
  };

  const containerRef = useRef<HTMLUListElement>(null);
  const onItemsImpressed = useCallback(
    (indexesToSend: number[]) => {
      if (type !== TSocialLinkJumbotronType.Game) {
        fireEvent(socialLinksCounterEvents.SocialLinkJumbotronNoValidTypeToSendImpressions);
        return;
      }

      if (!socialLinks) {
        fireEvent(socialLinksCounterEvents.SocialLinkJumbotronNoSocialLinksToSendImpressions);
        return;
      }

      const socialLinksImpressed = indexesToSend.map(index => socialLinks[index]);
      const socialLinkUrls = socialLinksImpressed.map(link => link?.url);
      const socialLinkTypes = socialLinksImpressed.map(link => link?.type);

      const assignmentId = Number.parseInt(targetId, 10);

      if (Number.isNaN(assignmentId)) {
        fireEvent(socialLinksCounterEvents.SocialLinkJumbotronUnableToConvertAssignmentIdToNumber);
      }

      const eventParams = {
        itemPositions: indexesToSend,
        socialLinkUrls,
        socialLinkTypes,
        socialLinkDisplayType: 'badge',
        assignmentType: 'game',
        assignmentId: !Number.isNaN(assignmentId)
          ? assignmentId
          : ((targetId as unknown) as number),
        page: 'GameDetail',
        ...referralSessionInfo
      };

      eventStreamService.sendEvent(...eventStreamConstants.edpSocialLinksImpressions(eventParams));
    },
    [socialLinks, targetId, type, referralSessionInfo]
  );
  useCollectionItemsIntersectionTracker(containerRef, socialLinks?.length ?? 0, onItemsImpressed);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      if (!authenticatedUser.isUnder13 && authenticatedUser.isAuthenticated) {
        try {
          const socialLinksData = await socialLinksService.getGameSocialLinks(targetId);
          setSocialLinks(socialLinksData);
        } catch (e) {
          // TODO (4/23/21, SOC-5018): To handle error when data does not return
          setSocialLinks([]);
        }
      } else {
        setSocialLinks([]);
      }
    };
    // eslint-disable-next-line no-void
    void fetchSocialLinks();
  }, [targetId]);

  if (!socialLinks || socialLinks?.length === 0) {
    return null;
  }

  return (
    <div className='section'>
      <div className='container-header'>
        <h3>{translate(socialLinksTranslationMap.sectionHeader)}</h3>
      </div>
      <ul className='game-social-links' ref={containerRef}>
        {socialLinks.map(link => (
          <Link
            onClick={() => {
              onLinkClick(link);
            }}
            onKeyDown={() => {
              onLinkClick(link);
            }}
            key={link.id}
            className='btn-secondary-lg border'>
            <span className={classNames('social-icon', iconMap[link.type])} />
            <span className='text-body-large text-wrap text-align-x-start padding-left-small'>
              {link.title}
            </span>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default Object.assign(
  withTranslations<TSocialLinksJumbotronProps>(SocialLinksJumbotron, socialLinksTranslationConfig),
  {
    SocialLinkJumbotronType: TSocialLinkJumbotronType
  }
);
