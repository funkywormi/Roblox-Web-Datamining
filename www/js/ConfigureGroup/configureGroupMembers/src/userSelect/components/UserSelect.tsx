import type { FunctionComponent } from 'react';
import React, { useCallback, useRef } from 'react';
import { useTranslation } from '@rbx/intl';
import {
  Autocomplete,
  Chip,
  makeStyles,
  SearchIcon,
  TextField,
  Grid,
  Paper,
  Typography,
} from '@rbx/ui';
import type { User } from '../../clients/users';
import TranslationNamespace from '../../constants/TranslationNamespace';
import UserThumbnailWithNames from '../../members/components/common/UserThumbnailWithNames';
import type { UserSelectProps, UserSelectLogState } from '../types';

const useStyles = makeStyles()(() => ({
  rootClass: {
    width: '100%',
  },
  noOverflow: {
    overflow: 'hidden',
  },
  bottomTextWrapper: {
    padding: '14px 16px',
  },
}));

const renderChipLabel = (label: React.ReactNode) => (
  <Grid item flex='0 0 auto'>
    <Chip color='secondary' label={label} size='small' variant='filled' />
  </Grid>
);

const UserSelect: FunctionComponent<UserSelectProps> = ({
  onSelect,
  userOptions,
  userStatus,
  isFetching,
  noOptionsText,
  updateUserSuggestions,
  bottomText,
  disabled,
}) => {
  const {
    classes: { rootClass, noOverflow, bottomTextWrapper },
  } = useStyles();
  const { translate, translateWithNamespace } = useTranslation();
  const logState = useRef<UserSelectLogState>({});
  const inputValue = useRef('');

  const renderPaper = useCallback(
    ({ children }: { children?: React.ReactNode }) => (
      <Paper>
        {children}
        {bottomText && (
          <div className={bottomTextWrapper}>
            <Typography variant='body2' color='secondary'>
              {bottomText}
            </Typography>
          </div>
        )}
      </Paper>
    ),
    [bottomText, bottomTextWrapper],
  );

  const handleAutocompleteChange = (_event: unknown, selectedUser: User | null) => {
    if (selectedUser && onSelect) {
      logState.current.numCharsInSearchbarOnItemClick = inputValue.current.length;
      logState.current.itemClickedTimestampMilliseconds = Date.now();
      const userId = selectedUser.id;
      const category = userId !== undefined ? userStatus.get(userId)?.category : undefined;
      onSelect(selectedUser, category ?? 'unknown', logState.current);
    }
  };

  return (
    <Autocomplete
      disabled={disabled}
      className={rootClass}
      blurOnSelect
      filterOptions={(options) => options}
      onFocus={() => {
        logState.current = {
          numCharsInSearchbarOnFocus: inputValue.current.length,
          searchbarFocusedTimestampMilliseconds: Date.now(),
        };
      }}
      onChange={handleAutocompleteChange}
      value={null}
      onInputChange={(event, value) => {
        if (!inputValue.current) {
          logState.current.searchbarTextFirstChangedTimestampMilliseconds = Date.now();
        }
        if (inputValue.current !== value) {
          inputValue.current = value;
          updateUserSuggestions(value);
        }
      }}
      options={userOptions}
      getOptionDisabled={(option) =>
        (option.id !== undefined && userStatus.get(option.id)?.disabled) ?? false
      }
      getOptionLabel={() => ''}
      loading={isFetching}
      noOptionsText={noOptionsText}
      renderOption={(props, option) => {
        const status = option.id !== undefined ? userStatus.get(option.id) : undefined;

        const renderUserInfo = () => (
          <UserThumbnailWithNames
            target={{
              id: option.id,
              name: option.name,
              displayName: option.displayName,
            }}
            disableLink
          />
        );

        const getDefaultChipLabel = () => {
          if (!status) {
            return null;
          }
          if (status.category === 'Friend') {
            return translate('Label.FriendTitle');
          }
          return translate(`Label.${status.category}`);
        };

        const defaultRender = () => {
          const chipLabel = getDefaultChipLabel();

          return (
            <Grid container alignItems='center' spacing={1}>
              <Grid item flex='1 1 0' className={noOverflow}>
                {renderUserInfo()}
              </Grid>
              {status && chipLabel && renderChipLabel(chipLabel)}
            </Grid>
          );
        };

        return <li {...props}>{defaultRender()}</li>;
      }}
      PaperComponent={renderPaper}
      renderInput={(params) => (
        <TextField
          {...params}
          InputProps={{
            ...params.InputProps,
            startAdornment: <SearchIcon />,
            placeholder: translateWithNamespace(
              TranslationNamespace.GroupManagement,
              'Label.SearchMembers',
            ),
          }}
          label=''
        />
      )}
    />
  );
};

export default UserSelect;
