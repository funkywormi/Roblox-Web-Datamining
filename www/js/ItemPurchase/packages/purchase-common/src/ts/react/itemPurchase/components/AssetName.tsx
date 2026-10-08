import React from 'react';

interface AssetNameProps {
  name: string;
}

function AssetName({ name }: AssetNameProps) {
  return <span className='font-bold'>{name}</span>;
}

export default AssetName;
