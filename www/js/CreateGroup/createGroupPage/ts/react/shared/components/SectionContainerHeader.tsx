import React from 'react';

const SectionContainerHeader: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className='container-header' style={{ margin: '0 0 8px 0', paddingTop: '16px' }}>
      <h2 className='padding-bottom-none'>{title}</h2>
    </div>
  );
};

export default SectionContainerHeader;
