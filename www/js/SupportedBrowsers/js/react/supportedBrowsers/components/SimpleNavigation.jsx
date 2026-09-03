import React from 'react';
import { Link } from 'react-style-guide';
import siteLinks from '../constants/siteLinks';

function SimpleNavigation() {
  return (
    <div className='simple-navigation-container'>
      <Link className='' url={siteLinks.homePageLink}>
        <span className='logo-navigation icon-logo' />
      </Link>
    </div>
  );
}

SimpleNavigation.propTypes = {};

export default SimpleNavigation;
