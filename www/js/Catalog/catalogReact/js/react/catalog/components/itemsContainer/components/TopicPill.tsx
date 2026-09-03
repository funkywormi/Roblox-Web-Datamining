import React from 'react';
import { Button } from 'react-style-guide';
import classNames from 'classnames';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { Topic } from '../../../constants/types';
import UtilityService from '../../../services/utilityService';

export type TopicPillProps = {
  topic: Topic;
  isSelected: boolean;
  onTopicClicked: (topic: Topic) => void;
};

export function TopicPill({ topic, isSelected, onTopicClicked }: TopicPillProps): JSX.Element {
  return (
    <Button
      onClick={() => onTopicClicked(topic)}
      variant={isSelected ? Button.variants.primary : Button.variants.secondary}
      size={Button.sizes.small}
      className={classNames('topic', {
        'selected-topic': isSelected,
        'unselected-topic': !isSelected
      })}>
      <span>{UtilityService.formatTopic(topic.displayName)}</span>
      {isSelected && (
        <IconButton
          onClick={() => onTopicClicked(topic)}
          className='topic-clear-button'
          size='small'>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      )}
    </Button>
  );
}

export default TopicPill;
