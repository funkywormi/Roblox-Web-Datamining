import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { jsClientDeviceIdentifier } from 'header-scripts';
import { Link } from 'react-style-guide';
import browserLists from '../constants/browserLists';

function BrowserStatus({ translate }) {
  const { isWindows, isIE } = jsClientDeviceIdentifier;

  const messageOfBrowserStatus = isIE
    ? translate('Message.BrowserIsNotValid')
    : translate('Message.BrowserIsValid');
  const descriptionOfBrowserStatus = isIE ? translate('Description.BrowserNeedsUpdated') : null;

  const { validBrowsersForMac, validBrowsersForWin, browserMetaData } = browserLists;
  const validBrowsers = isWindows ? validBrowsersForWin : validBrowsersForMac;

  return (
    <div className='browser-status-container'>
      <h2 className='browser-status-message'>{messageOfBrowserStatus}</h2>
      {descriptionOfBrowserStatus && (
        <p className='text-emphasis browser-status-description'>{descriptionOfBrowserStatus}</p>
      )}

      <ul className='browser-list'>
        {validBrowsers.map(browser => {
          const iconClassNames = ClassNames('browser-icon', browserMetaData[browser].iconClassName);
          const browserName = translate(browserMetaData[browser].translationString);
          return (
            <li className='browser-item' title={browserName}>
              <Link url={browserMetaData[browser].downloadLink} className='browser-item-link'>
                <div className='container-overlay browser-icon-container'>
                  <span className={iconClassNames} />
                  <div className='browser-name'>{browserName}</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

BrowserStatus.propTypes = {
  translate: PropTypes.func.isRequired
};

export default BrowserStatus;
