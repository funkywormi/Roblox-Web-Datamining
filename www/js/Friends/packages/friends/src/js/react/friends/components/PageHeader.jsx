import React from 'react';
import PropTypes from 'prop-types';

const PageHeader = ({ title, show }) => {
  return (
    <div className='page-header section'>
      {show && (
        <div className='container-header'>
          <h1 className='friends-title'>{title}</h1>
        </div>
      )}
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired
};

export default PageHeader;
