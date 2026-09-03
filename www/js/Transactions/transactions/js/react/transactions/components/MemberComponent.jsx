import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-style-guide';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import { AgentType, urlService } from '../../../../ts';

function MemberComponent({ member }) {
  if (!member) {
    return null;
  }

  const agentProfileUrl = urlService.getAgentProfileUrl(member);

  return (
    <div className='avatar-card'>
      <div
        className={classNames('avatar', 'avatar-headshot-xs', {
          'avatar-headshot': member.type === AgentType.User,
          'group-icon': member.type === AgentType.Group
        })}>
        <a className='avatar-card-link' href={agentProfileUrl}>
          <Thumbnail2d
            containerClass={classNames({ 'avatar-card-image': member.type === AgentType.User })}
            type={
              member.type === AgentType.Group
                ? ThumbnailTypes.groupIcon
                : ThumbnailTypes.avatarHeadshot
            }
            targetId={member.id}
            size={DefaultThumbnailSize}
          />
        </a>
      </div>
      <div className='avatar-card-caption'>
        <Link url={agentProfileUrl} className='avatar-card-name text-name text-overflow'>
          {member.name}
        </Link>
      </div>
    </div>
  );
}

MemberComponent.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.string,
    name: PropTypes.string
  })
};
MemberComponent.defaultProps = {
  member: null
};

export default MemberComponent;
