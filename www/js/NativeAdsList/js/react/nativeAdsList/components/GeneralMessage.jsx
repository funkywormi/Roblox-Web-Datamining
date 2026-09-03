import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

function GeneralMessage({ title, description }) {
  return (
    (title || description) && (
      <Fragment>
        <div className='text-center message-container'>
          <div className='font-header-1'>{title}</div>
          <p>{description}</p>
        </div>
      </Fragment>
    )
  );
}

GeneralMessage.defaultProps = {
  title: null,
  description: null
};

GeneralMessage.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string
};

export default GeneralMessage;
