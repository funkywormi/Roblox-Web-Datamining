import React, { useEffect, useRef } from 'react';
import {
  Thumbnail2d,
  ThumbnailAssetsSize,
  ThumbnailFormat,
  ThumbnailTypes
} from 'roblox-thumbnails';

interface CoverPhotoData {
  coverPhotoId: string;
}

export interface GroupCoverPhotoProps {
  groupId: number;
  coverPhotoData: CoverPhotoData;
}

const GroupCoverPhoto: React.FC<GroupCoverPhotoProps> = ({ coverPhotoData }) => {
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (imageRef.current) {
        imageRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className='group-cover-photo-fullwidth'>
      <div className='thumbnail-2d-container' ref={imageRef}>
        <Thumbnail2d
          targetId={coverPhotoData.coverPhotoId}
          size={ThumbnailAssetsSize.width1440}
          format={ThumbnailFormat.png}
          type={ThumbnailTypes.assetThumbnail}
        />
      </div>
      <div className='cover-gradient-overlay' />
      <div className='cover-blur-overlay' />
    </div>
  );
};

export default GroupCoverPhoto;
