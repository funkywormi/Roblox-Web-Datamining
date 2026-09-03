import React from 'react';
import PropTypes from 'prop-types';
import BrowserStatus from './BrowserStatus';
import SimpleNavigation from './SimpleNavigation';

function SupportedBrowsersContainer({ translate }) {
  return (
    <React.Fragment>
      <SimpleNavigation />
      <div className='supported-browsers-container'>
        <div className='container-overlay supported-browsers-mask'>
          <div className='supported-browsers-box'>
            <span className='supported-browser-logo logo-gradient' />
            <BrowserStatus translate={translate} />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

SupportedBrowsersContainer.propTypes = {
  translate: PropTypes.func.isRequired
};

export default SupportedBrowsersContainer;
