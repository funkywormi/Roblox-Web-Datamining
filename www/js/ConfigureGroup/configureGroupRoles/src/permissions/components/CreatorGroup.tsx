import type { FunctionComponent } from 'react';
import React from 'react';
import { Grid, InfoOutlinedIcon, makeStyles, Tooltip, Typography } from '@rbx/ui';
import { usePermissionsTranslation } from '../providers/TranslationProvider';
import type { CreatorDetails, CreatorGroupDetails } from '../utils/types';
import { Creator } from './Creator';

export type CreatorsGroupProps = CreatorGroupDetails & {
  selectedCreator?: CreatorDetails;
  onCreatorSelect: (creator: CreatorDetails) => void;
};

const useCreatorGroupStyles = makeStyles()({
  creatorGroupList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
});

const CreatorsGroup: FunctionComponent<CreatorsGroupProps> = ({
  type,
  creatorsList,
  selectedCreator,
  onCreatorSelect,
}) => {
  const {
    classes: { creatorGroupList },
  } = useCreatorGroupStyles();
  const { translate } = usePermissionsTranslation();

  const creatorGroupTitle = translate(`CreatorGroup.${type}.Title`);
  const creatorGroupInfo = translate(`CreatorGroup.${type}.Info`);

  return (
    <Grid>
      {creatorGroupTitle && (
        <Grid container mb={1} mt={3}>
          <Grid item marginRight={1}>
            <Typography variant='h6'>{creatorGroupTitle}</Typography>
          </Grid>
          <Grid item>
            {creatorGroupInfo && (
              <Tooltip
                arrow
                title={creatorGroupInfo}
                placement='right'
                enterTouchDelay={0}
                leaveTouchDelay={3000}>
                <InfoOutlinedIcon fontSize='small' />
              </Tooltip>
            )}
          </Grid>
        </Grid>
      )}
      <ul className={creatorGroupList}>
        {creatorsList &&
          creatorsList.map((creator) => (
            <li key={creator.id}>
              <Creator
                {...creator}
                selected={
                  selectedCreator?.id === creator.id && selectedCreator?.type === creator.type
                }
                onCreatorSelect={onCreatorSelect}
              />
            </li>
          ))}
      </ul>
    </Grid>
  );
};

export { CreatorsGroup };
