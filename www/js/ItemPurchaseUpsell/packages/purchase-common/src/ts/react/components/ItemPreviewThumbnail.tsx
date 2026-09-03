import React from 'react';

type props = {
  thumbnailImageUrl: string;
};
function ItemPreviewThumbnail({ thumbnailImageUrl }: props): React.ReactNode {
  return (
    <div className='item-preview' style={{ overflow: 'hidden', maxWidth: '100%' }}>
      <div className='item-card-thumb'>
        <img
          alt='item preview'
          src={thumbnailImageUrl ?? ''}
          style={{
            width: '150px',
            height: '150px',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
      </div>
      <div className='item-info text-name' />
    </div>
  );
}

export default ItemPreviewThumbnail;
