import React, { useRef, useCallback } from 'react';
import { Loading } from 'react-style-guide';
import { useTranslation } from 'react-utilities';
import { FeatureSubscriptions } from '../../../core/constants/translationConstants';
import SubscriptionCard from './SubscriptionCard';
import { Subscription } from '../../../core/types/serviceTypes';
import '../../../../css/gameSubscriptions/subscriptionsList.scss';

type TSubscriptionsListProps = {
  subscriptions: Subscription[] | undefined;
};

export const SubscriptionsList = ({ subscriptions }: TSubscriptionsListProps): JSX.Element => {
  const { translate } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    ((scrollRef.current.style as unknown) as Record<string, string>).scrollSnapType = 'none';
    scrollRef.current.style.cursor = 'grabbing';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!scrollRef.current) return;
    isDragging.current = false;
    ((scrollRef.current.style as unknown) as Record<string, string>).scrollSnapType = 'x mandatory';
    scrollRef.current.style.cursor = '';
  }, []);

  if (!subscriptions) {
    return <Loading />;
  }

  if (subscriptions.length === 0) {
    return (
      <p className='section-content-off'>
        {translate(FeatureSubscriptions.MessageNoSubscriptionsAvailable)}
      </p>
    );
  }

  const hasPeek = subscriptions.length > 2;

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={scrollRef}
      className={`subscriptions-scroll-container${hasPeek ? ' has-peek' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role='list'>
      {subscriptions.map(sub => (
        <SubscriptionCard key={sub.name} subscription={sub} />
      ))}
    </div>
  );
};

export default SubscriptionsList;
