import type { FunctionComponent } from 'react';
import React from 'react';
import { ReturnPolicy, Thumbnail2d, ThumbnailTypes } from '@rbx/thumbnails';
import { Avatar, Chip, Grid, Link, makeStyles, Skeleton, Tooltip, Typography } from '@rbx/ui';
import useCurrentGroup from '../../../hooks/useCurrentGroup';

export type UserThumbnailTarget = {
  id?: number;
  name?: string;
  displayName?: string;
};

const useUserThumbnailWithNamesStyles = makeStyles()((theme) => ({
  container: {
    minWidth: 0,
    width: 'fit-content',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 32,
  },
  thumbnailBackground: {
    background: theme.palette.surface[200],
  },
  itemText: {
    whiteSpace: 'nowrap',
    '& > *:not(:last-child)': {
      paddingBottom: 4,
    },
  },
  mutedText: {
    color: theme.palette.content.muted,
  },
  textContainer: {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '& > *:not(:first-child)': {
      display: 'block',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
}));

export interface UserThumbnailWithNamesProps {
  target: UserThumbnailTarget;
  label?: string;
  labelTooltip?: string;
  disableLink?: boolean;
}

const UserThumbnailWithNames: FunctionComponent<UserThumbnailWithNamesProps> = ({
  target,
  label,
  labelTooltip,
  disableLink = false,
}) => {
  const {
    classes: {
      container,
      avatarContainer,
      thumbnailBackground,
      itemText,
      mutedText,
      textContainer,
    },
    cx,
  } = useUserThumbnailWithNamesStyles();
  const { navigation } = useCurrentGroup();

  if (target.id === undefined || target.id === null) {
    return (
      <Grid
        container
        direction='row'
        alignItems='center'
        wrap='nowrap'
        justifyContent='space-between'
        className={container}>
        <Skeleton animate variant='rectangular' width='100%' height={32} />
      </Grid>
    );
  }

  const nameComponents = (
    <Grid container direction='row' alignItems='center' wrap='wrap'>
      {target.displayName === undefined ? (
        <Skeleton animate variant='text' width={192} height={22} />
      ) : (
        <Grid container direction='row' alignItems='center' wrap='wrap' columnGap={1}>
          <Typography className={textContainer} variant='captionHeader' color='inherit'>
            {target.displayName}
          </Typography>
          {label !== undefined && label.length > 0 && (
            <Tooltip
              arrow
              title={labelTooltip}
              placement='right'
              enterTouchDelay={0}
              leaveTouchDelay={3000}>
              <Chip color='secondary' label={label} size='small' variant='filled' />
            </Tooltip>
          )}
        </Grid>
      )}

      {target.name === undefined ? (
        <Skeleton animate variant='text' width={192} height={20} />
      ) : (
        <Typography variant='captionBody' className={cx(textContainer, mutedText)} color='inherit'>
          {`@${target.name}`}
        </Typography>
      )}
    </Grid>
  );

  return (
    <Grid
      container
      direction='row'
      alignItems='center'
      wrap='nowrap'
      justifyContent='space-between'
      className={container}>
      <Grid container wrap='nowrap'>
        <Grid item className='flex items-center'>
          <Avatar variant='rounded' alt='avatar' className={avatarContainer}>
            <Thumbnail2d
              targetId={target.id}
              type={ThumbnailTypes.avatarHeadshot}
              imgClassName={thumbnailBackground}
              alt='thumbnail'
              returnPolicy={ReturnPolicy.PlaceHolder}
              includeBackground={false}
            />
          </Avatar>
        </Grid>

        <Grid container direction='column' className={container}>
          <Grid item>
            {!disableLink && navigation?.getUserProfileUrl !== undefined ? (
              <Link
                href={navigation.getUserProfileUrl(target.id)}
                className={itemText}
                color='inherit'>
                {nameComponents}
              </Link>
            ) : (
              nameComponents
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default UserThumbnailWithNames;
