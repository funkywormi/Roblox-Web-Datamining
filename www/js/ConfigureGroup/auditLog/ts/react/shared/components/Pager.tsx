import React from 'react';
import { useTranslation } from 'react-utilities';

interface PagerProps {
  currentPage?: number;
  totalPages?: number;
  hasNextPage: boolean;
  hasPrevPage?: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const Pager = ({
  currentPage = 1,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPrevPage,
  onNextPage
}: PagerProps): JSX.Element => {
  const { translate } = useTranslation();

  const canGoPrev = hasPrevPage !== undefined ? hasPrevPage : currentPage > 1;
  const totalLabel = typeof totalPages === 'number' && totalPages > 0 ? ` / ${totalPages}` : '';

  return (
    <div className='pager-holder'>
      <ul className='pager'>
        <li className='pager-prev'>
          <button
            type='button'
            className='btn-generic-left-sm'
            onClick={onPrevPage}
            disabled={!canGoPrev}
            aria-label='Previous page'>
            <span className='icon-left' />
          </button>
        </li>
        <li className='pager-cur'>
          <span>
            {translate('Label.CurrentPage', { currentPage })}
            {totalLabel}
          </span>
        </li>
        <li className='pager-next'>
          <button
            type='button'
            className='btn-generic-right-sm'
            onClick={onNextPage}
            disabled={!hasNextPage}
            aria-label='Next page'>
            <span className='icon-right' />
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Pager;
