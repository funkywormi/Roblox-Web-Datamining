import React from 'react';
import { Grid, Typography } from '@rbx/ui';

type DeveloperProductMetadataProps = {
  label: string;
  children: React.ReactNode;
};

const DeveloperProductMetadata = ({
  label,
  children
}: DeveloperProductMetadataProps): JSX.Element => {
  return (
    <Grid className='metadata-row-container'>
      <Grid className='metadata-label'>
        <Typography>{label}</Typography>
      </Grid>
      {children}
    </Grid>
  );
};

export default DeveloperProductMetadata;
