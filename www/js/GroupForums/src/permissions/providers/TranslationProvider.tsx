import type { FunctionComponent, PropsWithChildren } from 'react';
import React, { createContext, useContext, useMemo } from 'react';
import { useTranslation, withTranslation, type UseTranslationResult } from '@rbx/intl';
import { Button, Grid, Typography, Link } from '@rbx/ui';
import TranslationNamespace from '../../constants/TranslationNamespace';
import useCurrentGroup from '../../hooks/useCurrentGroup';
import type { CreatorDetails, EntityDetails } from '../utils/types';
import { CreatorTypes } from '../utils/types';

type TranslationFunction = UseTranslationResult['translateHTML'];

type TranslationContextType = {
  translate: TranslationFunction;
  displayMessage: (message: React.ReactNode, isError?: boolean) => void;
};

export type TranslationContextProps = {
  entity: EntityDetails;
  selectedCreator?: CreatorDetails;
};

const PermissionsTranslationContext = createContext<TranslationContextType | null>(null);

const PermissionsTranslationProviderWithoutTranslation: FunctionComponent<
  PropsWithChildren<TranslationContextProps>
> = ({ children, entity, selectedCreator }) => {
  const { translateHTML }: { translateHTML: TranslationFunction } = useTranslation();
  const { navigation, studio, showToast } = useCurrentGroup();
  const navigateToRole = navigation.navigateToRole;
  const openStudio = studio?.open;
  const studioDialog = studio?.dialog;

  const contextValue: TranslationContextType = useMemo(() => {
    const baseTags = [
      {
        opening: 'strongStart',
        closing: 'strongEnd',
        content(chunks: React.ReactNode) {
          return <strong>{chunks}</strong>;
        },
      },
      {
        opening: 'gridStart',
        closing: 'gridEnd',
        content(chunks: React.ReactNode) {
          return (
            <Grid
              container
              direction='row'
              alignItems='center'
              wrap='nowrap'
              className='width-full gap-medium'>
              {chunks}
            </Grid>
          );
        },
      },
      {
        opening: 'contentStart',
        closing: 'contentEnd',
        content(chunks: React.ReactNode) {
          return (
            <Grid container direction='column' className='grow-1 shrink-1 basis-0 min-width-0'>
              {chunks}
            </Grid>
          );
        },
      },
      {
        opening: 'actionStart',
        closing: 'actionEnd',
        content(chunks: React.ReactNode) {
          return <Grid className='grow-0 shrink-0'>{chunks}</Grid>;
        },
      },
      {
        opening: 'headStart',
        closing: 'headEnd',
        content(chunks: React.ReactNode) {
          return <Typography variant='alertTitle'>{chunks}</Typography>;
        },
      },
      {
        opening: 'bodyStart',
        closing: 'bodyEnd',
        content(chunks: React.ReactNode) {
          return <Typography variant='body1'>{chunks}</Typography>;
        },
      },
      {
        opening: 'studioLinkStart',
        closing: 'studioLinkEnd',
        content(chunks: React.ReactNode) {
          return openStudio ? <Button onClick={openStudio}>{chunks}</Button> : <>{chunks}</>;
        },
      },
      {
        opening: 'creatorLinkStart',
        closing: 'creatorLinkEnd',
        content(chunks: React.ReactNode) {
          if (selectedCreator?.type === CreatorTypes.ROLE && navigateToRole) {
            return <Link onClick={() => navigateToRole(selectedCreator.id)}>{chunks}</Link>;
          }
          return <>{chunks}</>;
        },
      },
    ];

    const baseArgs = {
      entityName: entity.name,
      creatorName: selectedCreator?.name,
    };

    const newTranslateHTML: TranslationFunction = (key, tagsParam, argsParam = {}) => {
      const updatedTagsParam = [...baseTags, ...(tagsParam ?? [])];
      const updatedArgsParam = { ...baseArgs, ...argsParam };

      const namespacedByCreator = translateHTML(
        `${entity.type}.${selectedCreator?.type}.${key}`,
        updatedTagsParam,
        updatedArgsParam,
      );
      if (namespacedByCreator) {
        return namespacedByCreator;
      }
      const namespacedByEntity = translateHTML(
        `${entity.type}.${key}`,
        updatedTagsParam,
        updatedArgsParam,
      );
      if (namespacedByEntity) {
        return namespacedByEntity;
      }
      return translateHTML(key, updatedTagsParam, updatedArgsParam);
    };

    const displayMessage = (message: React.ReactNode, isError?: boolean) => {
      if (typeof message !== 'string') {
        return;
      }
      if (isError) {
        showToast(message, true);
        return;
      }
      showToast(message);
    };

    return { translate: newTranslateHTML, displayMessage };
  }, [
    entity.name,
    entity.type,
    selectedCreator,
    translateHTML,
    navigateToRole,
    openStudio,
    showToast,
  ]);

  return (
    <PermissionsTranslationContext.Provider value={contextValue}>
      {children}
      {studioDialog}
    </PermissionsTranslationContext.Provider>
  );
};

export const PermissionsTranslationProvider = withTranslation(
  PermissionsTranslationProviderWithoutTranslation,
  [
    TranslationNamespace.Permissions,
    TranslationNamespace.Error,
    TranslationNamespace.GroupManagement,
  ],
);

export function usePermissionsTranslation(): TranslationContextType {
  const translationContext = useContext(PermissionsTranslationContext);
  if (!translationContext) {
    throw new Error(
      'usePermissionsTranslation must be used within a PermissionsTranslationProvider',
    );
  }
  return translationContext;
}
