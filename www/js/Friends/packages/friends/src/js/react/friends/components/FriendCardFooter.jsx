import React from 'react';
import PropTypes from 'prop-types';

const FriendCardFooter = ({ children }) => {
  return <div className='avatar-card-footer avatar-card-label'>{children}</div>;
};

FriendCardFooter.propTypes = {
  children: PropTypes.node.isRequired
};

export default FriendCardFooter;
