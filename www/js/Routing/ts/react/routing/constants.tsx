import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import {
  RobloxTranslationResource,
  RobloxTranslationResourceProviderInstance,
  TranslationResourceProvider
} from 'Roblox';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'item-details': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export enum PageTransitionStatus {
  Success = 'success',
  Failure = 'failure'
}

let translationProvider: RobloxTranslationResourceProviderInstance;
let translationResource: RobloxTranslationResource;
let metaTitle: HTMLTitleElement;
let contentContainer: HTMLElement;

interface SetupAndTeardownFunctions {
  setup: (backendData: Map<string, string>) => void;
  teardown: () => void;
}

const Setup = () => {
  translationProvider = new TranslationResourceProvider();
  translationResource = translationProvider.getTranslationResource('CommonUI.Features');
  metaTitle = document.getElementsByTagName('title').item(0)!;
  contentContainer = document.getElementById('content')!;
};

function unmountElementId(id: string) {
  const element = document.getElementById(id);
  if (element) {
    unmountComponentAtNode(element);
  }
}

const RefreshTimeInMilliseconds = 60 * 60 * 1000; // 1 hour

const DynamicLocalizationResourceScriptBundleNamePrefix = 'DynamicLocalizationResourceScript_';

const HomeContainer = <div id='places-list-web-app' />;

const CatalogContainer = <div id='catalog-react-container' />;

const GameCarouselContainer = <div id='game-carousel-web-app' />;

const ItemDetailsContainer = (
  <div id='item-details-container'>
    <item-details />
  </div>
);

function translate(key: string) {
  return translationResource.get(key, {});
}

const ComponentToSetupAndTeardownFuncs: Map<string, SetupAndTeardownFunctions> = new Map([
  [
    'PlacesList',
    {
      setup: _ => {
        metaTitle.innerText = `${translate('Label.sHome')} - Roblox`;

        render(HomeContainer, contentContainer);
      },
      teardown: () => {
        unmountElementId('places-list-web-app');
      }
    }
  ],
  [
    'Catalog',
    {
      setup: _ => {
        metaTitle.innerText = `${translate('Label.sCatalog')}`;

        render(CatalogContainer, contentContainer);
      },
      teardown: () => {
        unmountElementId('catalog-react-container');
      }
    }
  ],
  [
    'GameCarousel',
    {
      setup: _ => {
        metaTitle.innerText = `${translate('Label.Charts')} - Roblox`;

        render(GameCarouselContainer, contentContainer);
      },
      teardown: () => {
        // temporarily need to unmount both in the interrim
        unmountElementId('games-carousel-page');
        unmountElementId('game-carousel-web-app');
      }
    }
  ],
  [
    'ItemDetails',
    {
      setup: _ => {
        render(ItemDetailsContainer, contentContainer);
      },
      teardown: () => {
        unmountElementId('item-details-container');
      }
    }
  ]
]);

export default {
  Setup,
  ComponentToSetupAndTeardownFuncs,
  RefreshTimeInMilliseconds,
  DynamicLocalizationResourceScriptBundleNamePrefix
};
