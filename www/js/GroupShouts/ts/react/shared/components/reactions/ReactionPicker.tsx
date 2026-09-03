import React from 'react';
import ReactionEmote from './ReactionEmote';
import { EmoteDisplay } from '../../types';

export type ReactionPickerProps = {
  emotes: EmoteDisplay[];
  onSelect: (emoteId: string) => void;
};

const ReactionPicker = ({ onSelect, emotes }: ReactionPickerProps): JSX.Element => {
  return (
    <div className='reaction-picker'>
      {emotes.map(emote => (
        <div key={emote.id} className='reaction-picker-item'>
          <ReactionEmote
            emoteId={emote.id}
            className='reaction-picker-emote'
            emoteUrl={emote.url}
            onClick={() => onSelect(emote.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default ReactionPicker;
