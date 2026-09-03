import React, { useState } from 'react';
import classNames from 'classnames';
import { AssetDetail } from '../services/currentWearingService';
import currentWearingContants from '../constants/currentWearingContants';
import Asset from './Asset';

export type AccoutrmentsProps = {
  assets: Array<AssetDetail>;
};
const Accoutrements = ({ assets }: AccoutrmentsProps): JSX.Element => {
  const [page, setPage] = useState<number>(0);
  const pageIndex = new Array(
    Math.min(
      Math.ceil(assets.length / currentWearingContants.currentWearingPerPage),
      currentWearingContants.maxCurrentWearingPage
    )
  )
    .fill(0)
    .map((_, indx) => indx);
  const assetList = assets
    .slice(
      page * currentWearingContants.currentWearingPerPage,
      (page + 1) * currentWearingContants.currentWearingPerPage
    )
    .map(asset => <Asset asset={asset} />);
  const pageNavs = pageIndex.map(i => (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <span
      onClick={() => {
        setPage(i);
      }}
      className={classNames('profile-accoutrements-page', { 'page-active': page === i })}
    />
  ));
  return (
    <div className='col-sm-6 section-content profile-avatar-right'>
      <div className='profile-avatar-mask'>
        <div className='profile-accoutrements-container'>
          <div className='profile-accoutrements-slider'>
            <ul className='accoutrement-items-container'>{assetList}</ul>
          </div>
          <div className='profile-accoutrements-page-container'>{pageNavs}</div>
        </div>
      </div>
    </div>
  );
};

export default Accoutrements;
