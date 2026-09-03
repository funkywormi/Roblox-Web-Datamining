/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable func-names */
/* eslint-disable no-redeclare */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable block-scoped-var */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable camelcase */
/* eslint-disable import/extensions, import/no-unresolved */
import { Endpoints, EnvironmentUrls } from 'Roblox';
import $ from 'jquery';
import {
  ITEM_IDS,
  COUNTRIES_GIFTCARDS_NONE_RETAILERS_ONE,
  COUNTRIES_GIFTCARDS_NONE_RETAILERS_FOUR,
  COUNTRIES_GIFTCARDS_TWO_RETAILERS_ONE,
  COUNTRIES_GIFTCARDS_TWO_RETAILERS_FOUR
} from './giftcardItemConfigs';

// Section1.html
$('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');
$('.logo-link').append('<img src="//images.rbxcdn.com/f1d37b64f3d1fc3a2bf33a6f34e75a2d">');

const currentPath = Endpoints.removeUrlLocale(window.location.pathname);
let currentPage = (currentPath.match(/-([a-z]{2})$/i) || ['us'])[0].replace('-', '');
const urlLocale = Endpoints.getPageUrlLocale();

// Redirect to the Retailer landing page in the following regions, which do not support Cashstar:
const cashstarUnsupportedCountries = ['dk', 'my', 'no', 'ro', 'sg', 'se', 'th'];
if (currentPath.indexOf('retailers') === -1 && cashstarUnsupportedCountries.includes(currentPage)) {
  window.location.href = Endpoints.getAbsoluteUrl(`/giftcards-retailers-${currentPage}`);
}

// Section3.html
// let DISABLED_COUNTRIES = [];
// let DISABLED_LANGUAGES = [];
const DISABLED_COUNTRIES = ['lv', 'sk', 'sl', 'cy', 'hu', 'ko'];
const DISABLED_LANGUAGES = ['latvian', 'slovak', 'slovene', 'hungarian'];
const B2B_LANGUAGES = ['english', 'french', 'french_canada'];
const B2B_COUNTRIES = ['us', 'ca', 'ie', 'uk'];
const NO_REFERRER_LINKS = ['familymart', 'seven11'];
const EMPTY_LINKS = ['kkmart', 'cosway'];

// Item combinations (auto-generated from ITEM_IDS above)
const PRIZE_ITEMS = {
  RETAILERS_FOUR_ITEMS: [
    ITEM_IDS.CASHSTAR_ITEM,
    ITEM_IDS.AMAZON_ITEM_1,
    ITEM_IDS.AMAZON_ITEM_2,
    ITEM_IDS.AMAZON_ITEM_3
  ],
  RETAILERS_ONE_ITEM: [ITEM_IDS.CASHSTAR_ITEM],
  GIFTCARDS_BONUS: [ITEM_IDS.CASHSTAR_BONUS],
  GIFTCARDS_CASHSTAR: [ITEM_IDS.CASHSTAR_ITEM],
  NONE: []
};

// Prize configurations by country type
const PRIZE_CONFIGS = {
  GIFTCARDS_TWO_RETAILERS_FOUR: {
    bonus_items: PRIZE_ITEMS.GIFTCARDS_BONUS,
    cashstar_items: PRIZE_ITEMS.GIFTCARDS_CASHSTAR,
    items: PRIZE_ITEMS.RETAILERS_FOUR_ITEMS
  },
  GIFTCARDS_NONE_RETAILERS_FOUR: {
    bonus_items: PRIZE_ITEMS.NONE,
    cashstar_items: PRIZE_ITEMS.NONE,
    items: PRIZE_ITEMS.RETAILERS_FOUR_ITEMS
  },
  GIFTCARDS_TWO_RETAILERS_ONE: {
    bonus_items: PRIZE_ITEMS.GIFTCARDS_BONUS,
    cashstar_items: PRIZE_ITEMS.GIFTCARDS_CASHSTAR,
    items: PRIZE_ITEMS.RETAILERS_ONE_ITEM
  },
  GIFTCARDS_NONE_RETAILERS_ONE: {
    bonus_items: PRIZE_ITEMS.NONE,
    cashstar_items: PRIZE_ITEMS.NONE,
    items: PRIZE_ITEMS.RETAILERS_ONE_ITEM
  }
};

// Build country-to-configuration mapping (auto-generated from country arrays above)
const COUNTRY_PRIZE_CONFIGS = [
  {
    countries: COUNTRIES_GIFTCARDS_TWO_RETAILERS_FOUR,
    config: PRIZE_CONFIGS.GIFTCARDS_TWO_RETAILERS_FOUR
  },
  {
    countries: COUNTRIES_GIFTCARDS_NONE_RETAILERS_FOUR,
    config: PRIZE_CONFIGS.GIFTCARDS_NONE_RETAILERS_FOUR
  },
  {
    countries: COUNTRIES_GIFTCARDS_TWO_RETAILERS_ONE,
    config: PRIZE_CONFIGS.GIFTCARDS_TWO_RETAILERS_ONE
  },
  {
    countries: COUNTRIES_GIFTCARDS_NONE_RETAILERS_ONE,
    config: PRIZE_CONFIGS.GIFTCARDS_NONE_RETAILERS_ONE
  }
];

// Build prizes object
const prizes = {};
COUNTRY_PRIZE_CONFIGS.forEach(({ countries, config }) => {
  countries.forEach(country => {
    prizes[country] = { ...config };
  });
});
const bundleIds = [1056];
const assetidThumbnailPresets = {
  10205132396: 'bakugan-item-icon'
};
let lang = {};
let links = {
  mainbutton: 'https://roblox.cashstar.com/',
  'mainbutton-dk': 'https://www.amazon.co.uk/dp/B081KJJ6ZZ',
  'mainbutton-no': 'https://www.amazon.co.uk/dp/B081KJJ6ZZ',
  'mainbutton-se': 'https://www.amazon.co.uk/dp/B081KJJ6ZZ',
  'mainbutton-ro': 'https://www.amazon.co.uk/dp/B081KJJ6ZZ',
  retailers: Endpoints.getAbsoluteUrl('/giftcards-retailers'),
  giftcardsb2b: 'https://www.roblox.com/giftcards-B2Bcountryselector/',
  redeem: Endpoints.getAbsoluteUrl('/redeem'),
  'online-amazonen-us':
    'https://www.amazon.com/stores/page/05775C65-F802-4A3C-9C4E-BED682E5A562?channel=giftcardpage2022',
  'online-gamestop-us': 'https://www.gamestop.com/search/?q=roblox+gift+card&lang=default',
  'online-walmart-us':
    'https://www.walmart.com/browse/shop-by-video-game/roblox-gift-cards/5324366_6064627_2205845',
  'online-newegg-us': 'https://www.newegg.com/p/pl?d=roblox+gift+card',
  'online-costco-us':
    'https://www.costco.com/roblox-game-card-%2450-digital-download.product.100431289.html',
  'online-target-us':
    'https://www.target.com/items/-/ct-54627289Z81280060Z81280059Z54627290Z81280058Z81280057Z54661970Z81280056Z54627291?title=Roblox',
  'online-startselect-uk': 'https://startselect.com/gb-en/roblox',
  'online-amazonuk-uk': 'https://www.amazon.co.uk/dp/B081KJJ6ZZ',
  'online-asda-uk': 'https://www.asdagiftcards.com/cards/roblox-egift',
  'online-startselect-fr': 'https://startselect.com/fr-fr/roblox',
  'online-amazonfr-fr': 'https://www.amazon.fr/dp/B081KHWHP4',
  'online-startselect-de': 'https://startselect.com/de-en/roblox',
  'online-amazonde-de': 'https://www.amazon.de/dp/B081KHJBFD',
  'online-startselect-es': 'https://startselect.com/es-es/tarjetas-regalo/tarjetas-roblox',
  'online-amazones-es': 'https://www.amazon.es/dp/B081KJ2TBN',
  'online-amazonjp-jp':
    'https://www.amazon.co.jp/-/en/dp/B09NQC37C8/ref=sr_1_1?keywords=roblox%E3%82%AE%E3%83[…]%E3%83%89&qid=1659999624&sprefix=roblox+gi%2Caps%2C76&sr=8-1',
  'online-kiigo-jp': 'https://www.kiigo.jp/disp/CSfGoodsPage_001.jsp?BRAND_NO=114',

  'online-zero3-br': 'https://www.zero3games.com.br/loja/credito-roblox-100',
  'online-softwareexpress-br': 'https://aquipaga.com.br/',
  'online-gcmgames-br': 'https://www.gcmgames.com.br/cartao-roblox-r-60-reais-p111725',
  'online-bancointer-br': 'https://www.bancointer.com.br/pra-voce/giftcard',
  'online-nubank-br': 'https://app.nubank.com.br/#/login',
  'online-nuuvem-br': 'https://www.nuuvem.com/br-pt/item/50-gift-card-roblox',
  'online-picpay-br': 'https://picpay.com/',
  'online-wortenequip-pt':
    'https://www.worten.pt/produtos/cartoes-de-descarga-roblox-20-euros-formato-digital-7421651',
  'online-startselect-pt': 'https://startselect.com/pt-pt/cartoes-presente/cartoes-roblox',
  'online-startselect-pl': 'https://startselect.com/pl-pl/karty-podarunkowe/karty-roblox',
  'online-empik-pl': 'https://www.empik.com/multimedia,34,s?q=roblox',
  'online-mediaexpert-pl':
    'https://www.mediaexpert.pl/gaming/gry/gry/e-kod-cyfrowy-roblox-100-pln-pc',
  'online-muveonline-pl':
    'https://muve.pl/sklep/doladowania/doladowania-roblox/roblox-doladowanie-100-zl,1460671',
  'online-startselect-at': 'https://startselect.com/at-de/gutscheine/roblox-karten',
  'online-paysafe-at': 'https://www.paysafecard.com/de/?country=at',
  'online-startselect-dk': 'https://startselect.com/dk-da/gavekort/roblox-gavekort',
  'online-startselect-fi': 'https://startselect.com/fi-fi/lahjakortit/roblox-lahjakortit',
  'online-startselect-no': 'https://startselect.com/no-no/gavekort/roblox-gift-cards',
  'online-aircash-sk': 'https://aircash.eu/',
  'online-hernekupony-sk': 'https://www.herne-kupony.sk/roblox/',
  'online-aircash-sl': 'https://aircash.eu/',
  'online-aircash-cy': 'https://aircash.eu/',
  'online-konzolstudio-hu':
    'https://www.konzolstudio.hu/index.php?route=product/list&keyword=roblox&description=0',
  'online-codashop-my': 'https://www.codashop.com/en-my/',
  'online-shopee-my': 'https://shopee.com.my/',
  'online-razergold-my': 'https://gold.razer.com/my/en/gold/catalog/roblox',
  'online-razergold-sg': 'https://gold.razer.com/sg/en/gold/catalog/roblox',
  'online-razergold-th': 'https://gold.razer.com/th/th/gold/catalog/roblox-th',
  'online-amazonjp-ae': 'https://www.amazon.ae/dp/B0CQK8JB5L?th=1',
  'online-amazonjp-sa': 'https://www.amazon.sa/dp/B0CQD1DRVV?th=1',
  'online-kakao-ko': 'https://gift.kakao.com/product/9258636',
  'online-auction-ko': 'http://itempage3.auction.co.kr/DetailView.aspx?itemno=D947614571',
  'online-gmarket-ko': 'https://item.gmarket.co.kr/Item?goodsCode=3555960459',
  'online-elevenst-ko': 'https://www.11st.co.kr/products/6848088949',
  'online-startselect-nz': 'https://startselect.com/nz-en/gift-cards/roblox-gift-cards',
  'online-startselect-ie': 'https://startselect.com/ie-en/gift-cards/roblox-gift-cards',
  'online-startselect-it': 'https://startselect.com/it-it/carte-regalo/gift-cards-roblox',
  'online-startselect-ch': 'https://startselect.com/ch-de/gutscheine/roblox-karten',
  'online-startselect-nl': 'https://startselect.com/nl-nl/cadeaukaarten/roblox-gift-cards',
  'online-startselect-be': 'https://startselect.com/be-nl/cadeaubonnen/roblox-gift-cards',
  'online-startselect-se': 'https://startselect.com/se-sv/presentkort/roblox-presentkort',

  'locator-gamestop-us': 'https://www.gamestop.com/stores/',
  'locator-walmart-us': 'https://www.walmart.com/store/finder/',
  'locator-walmart-mx': 'https://www.walmart.com/store/finder/',
  'locator-target-us': 'https://www.target.com/store-locator/find-stores',
  'locator-walgreens-us': 'https://www.walgreens.com/storelocator/find.jsp',
  'locator-kroger-us': 'https://www.kroger.com/stores/search',
  'locator-cvs-us': 'https://www.cvs.com/store-locator/landing',
  'locator-bestbuy-us': 'https://www.bestbuy.com/site/store-locator/',
  'locator-seven11-us': 'https://www.7-eleven.com/locator',
  'locator-dgeneral-us': 'https://www.dollargeneral.com/store-locator.html',
  'locator-fdollar-us': 'https://www.familydollar.com/store-locator',
  'locator-safeway-us': 'https://local.safeway.com/search.html',
  'locator-albertsons-us': 'https://local.albertsons.com/search.html',
  'locator-walmart-ca': 'https://www.walmart.ca/en/stores-near-me',
  'locator-gamestopca-ca': 'https://www.gamestop.ca/storelocator',
  'locator-circlek-ca': 'https://www.circlek.com/ca/store-locator',
  'locator-seven11-ca': 'https://7-eleven.ca/store-locator/',
  'locator-sdrugmart-ca': 'https://www1.shoppersdrugmart.ca/en/store-locator',
  'locator-toysrus-ca': 'https://www.toysrus.ca/en/storelocator',
  'locator-loblaws-ca': 'https://www.loblaws.ca/store-locator',
  'locator-ebgames-au': 'https://www.ebgames.com.au/stores',
  'locator-woolworths-au': 'https://www.woolworths.com.au/shop/storelocator',
  'locator-jbhifi-au': 'https://www.jbhifi.com.au/pages/store-finder',
  'locator-bigw-au': 'https://www.bigw.com.au/bigw/storelocator/store_finder',
  'locator-seven11-au': 'https://www.seven11.com.au/stores',
  'locator-coles-au': 'https://www.coles.com.au/store-locator',
  'locator-kmart-au': 'https://www.kmart.com.au/store-locator/',
  'locator-aldi-au': 'https://store.aldi.com.au/storelocator',
  'locator-auspost-au': 'https://auspost.com.au/locate/',
  'locator-sainsburys-uk': 'https://stores.sainsburys.co.uk/',
  'locator-whsmith-uk': 'https://www.whsmith.co.uk/store-locator',
  'locator-asda-uk': 'https://storelocator.asda.com/#!/',
  'locator-game-uk': 'https://storefinder.game.co.uk/',
  'locator-smyths-uk': 'https://www.smythstoys.com/store-finder',
  'locator-curryspcworld-uk': 'https://www.currys.co.uk/gbuk/store-finder',
  'locator-paypoint-uk': 'https://www.paypoint.com/',
  'locator-micromania-fr': 'https://www.micromania.fr/magasins?mode=viewAll',
  'locator-gamestop-de': 'https://www.gamestop.de/StoreLocator',
  'locator-game-es': 'https://www.game.es/tiendas',
  'online-gamestop-ie':
    'https://www.gamestop.ie/Other%20Products/Games/73078/roblox-20-gift-card-digital',
  'online-gamestop-it': 'https://www.gamestop.it/Digital/Games/127475/roblox-abbonamento-6-mesi',
  'online-amazonit-it': 'https://www.amazon.it/dp/B081KHWHP8',
  'online-gamestop-dk':
    'https://www.gamestop.dk/Other%20Products/Games/84246/roblox-dkk-250-gavekort-digital',
  'online-gamestop-fi':
    'https://www.gamestop.fi/Other%20Products/Games/101360/roblox-20-lahjakortti-digitaalinen',
  'online-gamestop-no':
    'https://www.gamestop.no/Other%20Products/Games/97239/roblox-nok-200-gavekort-digitalt',
  'online-gamestop-se':
    'https://www.gamestop.se/Other%20Products/Games/88628/roblox-sek-250-presentkort-digital',
  'online-codashop-sg': 'https://www.codashop.com/en-sg/',
  'locator-ebgames-nz': 'https://www.ebgames.co.nz/stores',
  'locator-jbhifi-nz': 'https://www.jbhifi.co.nz/Stores/Store-Finder/',
  'locator-woolworths-nz': 'https://www.countdown.co.nz/stores',
  'locator-gamestop-ie': 'https://www.gamestop.ie/StoreLocator',
  'locator-smyths-ie': 'https://www.smythstoys.com/ie/en-ie/store-finder',
  'locator-gamestop-it': 'https://www.gamestop.it/StoreLocator',
  'locator-gamestop-ch': 'https://www.gamestop.ch/StoreLocator',
  'locator-gamestop-dk': 'https://www.gamestop.dk/StoreLocator',
  'locator-gamestop-fi': 'https://www.gamestop.fi/StoreLocator',
  'locator-gamestop-no': 'https://www.gamestop.no/StoreLocator',
  'locator-gamestop-se': 'https://www.gamestop.se/StoreLocator',
  'locator-kruidvat-nl': 'https://www.kruidvat.nl/winkelzoeker',
  'locator-carrefour-be': 'https://www.carrefour.eu/fr/magasins.html',
  'locator-seven11-jp': 'https://www.e-map.ne.jp/p/711map/?p_s1=40000',
  'locator-familymart-jp': 'https://www.family.co.jp/store.html',
  'locator-ministop-jp': 'https://www.ministop.co.jp/',
  'locator-yamadadenki-jp': 'https://www.yamada-denki.jp/store/',
  'locator-edion-jp': 'https://www.edion.co.jp/en/store',
  'locator-geo-jp': 'http://www.geonet.co.jp/',
  'locator-aeongroup-jp': 'https://www.welcome-aeon.com/storesearch/',
  'locator-donquijote-jp': 'https://www.donki.com/en/store/shop_list.php?pref=',
  'locator-lawsons-jp': 'https://www.lawson.co.jp/service/others/in/index.html',
  'locator-kaikatsu-jp': 'https://www.kaikatsu.jp/',
  'locator-costcojp-jp': 'https://www.costco.co.jp/store-finder',

  'locator-paguemenos-br': 'https://www.paguemenos.com.br/nossas-lojas',
  'locator-gpabr-br': 'https://www.gpabr.com/pt/conheca-o-gpa/onde-estamos',
  'locator-rvtecnologia-br': 'https://www.rvtecnologia.com.br',
  'locator-carrefour-br': 'https://nossaslojas.americanas.com.br/?chave=prf_hm_0_tt_9_lojas',
  'locator-oxxo-mx': 'https://www.oxxo.com/tiendas?source=link-menu',
  'locator-soriana-mx': 'https://www.soriana.com/buscador-de-tiendas',
  'locator-chedraui-mx': 'https://www.chedraui.com.mx/encuentra-tu-tienda',
  'locator-gameplanet-mx': 'https://gameplanet.com/sucursales',
  'locator-coppel-mx': 'https://www.coppel.com/ubicacion-de-tiendas-coppel',
  'locator-officedepot-mx': 'https://www.officedepot.com.mx/officedepot/en/store-finder',
  'locator-pagaqui-pt': 'https://pagaqui.pt/pt/rede-de-agentes',
  'locator-payshop-pt': 'https://www.payshop.pt/fepsapl/app/open/showSearchAgent.jspx',
  'locator-vaspexpresso-pt': 'https://www.vaspexpresso.pt/pt/geral/rede-kios',
  'locator-wortenequip-pt': 'https://www.worten.pt/lojas-worten',
  'locator-empik-pl': 'https://www.empik.com/salony-empik',
  'locator-inmedio-pl': 'http://sklepy.lagardere-tr.pl',
  'locator-inmediotrendy-pl': 'http://sklepy.lagardere-tr.pl',
  'locator-mediaexpert-pl': 'https://sklepy.mediaexpert.pl',
  'locator-mediasaturn-pl': 'https://mediamarkt.pl/sklepy',
  'locator-relay-pl': 'http://sklepy.lagardere-tr.pl',
  'locator-carrefour-pl': 'https://www.carrefour.pl/sklepy',
  'locator-zabka-pl': 'https://www.zabka.pl/znajdz-sklep/',
  'locator-billa-at': 'https://www.billa.at/maerkte',
  'locator-libro-at': 'https://www.libro.at/filialfinder',
  'locator-rewepenny-at': 'https://www.libro.at/filialfinder',
  'locator-smyths-at': 'https://www.smythstoys.com/at/de-at/markt-finden',
  'locator-spargroup-at': 'https://www.spar.at/standorte',
  'locator-gamestop-at': 'https://www.gamestop.at/storefinder',
  'locator-flashmobile-za': 'https://flash.co.za',
  'locator-ackermans-za': 'https://www.ackermans.co.za/store-finder',
  'locator-picknpay-za': 'https://www.pnp.co.za/',
  'locator-rkioski-fi': 'https://www.r-kioski.fi/',
  'locator-kesko-fi': 'https://www.kesko.fi/en/customer/stores/',
  'locator-verkkokauppa-fi':
    'https://www.verkkokauppa.com/fi/product/760528/Roblox-10-EUR-lahjakortti',
  'locator-soksgroup-fi': 'https://s-ryhma.fi/en',
  'locator-mediamarkt-se': 'https://www.mediamarkt.se/',
  'locator-plaisio-gr':
    'https://www.plaisio.gr/gaming-zone/prepaid-cards/roblox-gift-card-digital-code-10-eur-gr_3727734?qId=9bdc8239851e392434636362140bd925&qIx=products',
  'locator-public-gr': 'https://www.public.gr/store-locator/map',
  'locator-kotsovolos-gr':
    'https://www.kotsovolos.gr/gaming-gadgets/gift-cards-live-cards/930005-roblox-gift-card-digital-code-10',
  'locator-elkor-lv': 'https://www.elkor.lv/stores/',
  'locator-rdelectronics-lv': 'https://www.rdveikals.lv/',
  'locator-seven11my-my': 'https://www.7eleven.com.my/',
  'locator-speedmart-my': 'https://www.99speedmart.com.my/Store',
  'locator-tmgmart-my': 'https://www.tunasmanja.com/2/Store/StoreLocatorDekstop.html',
  'locator-allit-my': 'https://www.allithypermarket.com.my/pages/store-location',
  'locator-carrefour-ro': 'https://carrefour.ro/',
  'locator-seven11-sg': 'https://www.7-eleven.com.sg/Locate',
  'locator-cheers-sg': 'https://cheers.com.sg/stores-locator/',
  'locator-challenger-sg': 'https://www.challenger.sg/',
  'locator-seven11-th': 'https://www.7eleven.co.th/find-store',
  'locator-bigc-th': 'https://www.bigc.co.th/',
  'locator-tescolotus-th': 'https://www.lotuss.com/th',
  'locator-familymart-th': 'https://www.familymart.co.th/',
  'locator-codashop-th': 'https://www.codashop.com/en-th',
  'locator-smarty-sk': 'https://www.brloh.sk/Predajne',
  'locator-muller-sl': 'https://www.mueller.si/poslovalnice/',
  'locator-gs25-ko': 'http://gs25.gsretail.com/gscvs/ko/store-services/locations',
  'locator-puntolis-it': 'https://www.puntolis.it/it/servizi-al-cittadino',
  '': ''
};

let sources = {
  '': ''
};

let strings = {
  '': ''
};
const store_carousel_info = [];
const virtual_carousel_info = [];
const giftcard_carousel_info = [];

const retailers = {
  0: 'seven11',
  1: 'albertsons',
  2: 'asda',
  3: 'bigw',
  4: 'coles',
  5: 'curryspcworld',
  6: 'amazonde',
  7: 'amazonen',
  8: 'dgeneral',
  9: 'ebgames',
  10: 'amazones',
  11: 'fdollar',
  12: 'amazonfr',
  13: 'game',
  14: 'amazonit',
  15: 'jbhifi',
  16: 'kroger',
  17: 'loblaws',
  18: 'safeway',
  19: 'sainsburys',
  20: 'sdrugmart',
  21: 'smyths',
  22: 'startselect',
  23: 'unused',
  24: 'amazonuk',
  25: 'whsmith',
  26: 'woolworths',
  27: 'walmart',
  28: 'toysrus',
  29: 'bestbuy',
  30: 'cvs',
  31: 'walgreens',
  32: 'target',
  33: 'gamestop',
  34: 'micromania',
  35: 'newegg',
  36: 'costco',
  37: 'kruidvat',
  38: 'carrefour',
  39: 'amazonjp',
  40: 'familymart',
  41: 'ministop',
  42: 'yamadadenki',
  43: 'edion',
  44: 'geo',
  45: 'aeongroup',
  46: 'donquijote',
  47: 'lawsons',
  48: 'zero3',
  49: 'softwareexpress',
  50: 'gcmgames',
  51: 'nubank',
  52: 'nuuvem',
  53: 'picpay',
  54: 'paguemenos',
  55: 'gpabr',
  56: 'rvtecnologia',
  57: 'oxxo',
  58: 'soriana',
  59: 'chedraui',
  60: 'gameplanet',
  61: 'officedepot',
  62: 'wortenequip',
  63: 'pagaqui',
  64: 'payshop',
  65: 'vaspexpresso',
  66: 'empik',
  67: 'mediaexpert',
  68: 'muveonline',
  69: 'inmedio',
  70: 'inmediotrendy',
  71: 'mediasaturn',
  72: 'relay',
  73: 'paysafe',
  74: 'billa',
  75: 'libro',
  76: 'rewepenny',
  77: 'spargroup',
  78: 'flashmobile',
  79: 'ackermans',
  80: 'bancointer',
  81: 'coppel',
  82: 'rkioski',
  83: 'kesko',
  84: 'verkkokauppa',
  85: 'soksgroup',
  86: 'mediamarkt',
  87: 'plaisio',
  88: 'public',
  89: 'kotsovolos',
  90: 'elkor',
  91: 'rdelectronics',
  92: 'codashop',
  93: 'speedmart',
  94: 'tmgmart',
  95: 'allit',
  96: 'seven11my',
  97: 'cheers',
  98: 'challenger',
  99: 'bigc',
  100: 'tescolotus',
  101: 'kmart',
  102: 'aldi',
  103: 'auspost',
  104: 'picknpay',
  105: 'kaikatsu',
  106: 'kiigo',
  107: 'costcojp',
  108: 'aircash',
  109: 'hernekupony',
  110: 'smarty',
  111: 'muller',
  112: 'konzolstudio',
  113: 'gamestopca',
  114: 'circlek',
  115: 'kkmart',
  116: 'cosway',
  117: 'shopee',
  118: 'kakao',
  119: 'auction',
  120: 'gmarket',
  121: 'elevenst',
  122: 'gs25',
  123: 'puntolis',
  124: 'razergold',
  125: 'paypoint',
  126: 'zabka'
};

const retailersMap = {};
for (const retailerIndex in retailers) {
  retailersMap[retailers[retailerIndex]] = retailerIndex;
}

const readableRetailerInfo = {
  us: {
    cashstar: {
      amounts: [10, 25, 50],
      currencyFormat: '$%d'
    },
    online: ['amazonen', 'target', 'gamestop', 'walmart', 'newegg', 'costco'],
    instore: [
      'walmart',
      'target',
      'walgreens',
      'kroger',
      'cvs',
      'bestbuy',
      'seven11',
      'dgeneral',
      'fdollar',
      'safeway',
      'albertsons',
      'gamestop'
    ],
    event_section: false
  },
  ca: {
    cashstar: {
      amounts: [15, 25, 50],
      currencyFormat: '$%d'
    },
    online: [],
    instore: ['gamestop', 'seven11', 'sdrugmart', 'toysrus', 'loblaws', 'walmart', 'circlek']
  },
  uk: {
    cashstar: {
      amounts: [10, 20, 50],
      currencyFormat: '£%d'
    },
    online: ['startselect', 'amazonuk', 'asda'],
    instore: ['whsmith', 'asda', 'game', 'smyths', 'curryspcworld', 'paypoint', 'sainsburys']
  },
  au: {
    cashstar: {
      amounts: [10, 25, 50],
      currencyFormat: '$%d'
    },
    online: [],
    instore: [
      'woolworths',
      'jbhifi',
      'bigw',
      'seven11',
      'coles',
      'ebgames',
      'kmart',
      'aldi',
      'auspost'
    ]
  },
  fr: {
    cashstar: {
      amounts: [10, 20, 50],
      currencyFormat: '€%d'
    },
    online: ['startselect', 'amazonfr'],
    instore: ['micromania']
  },
  de: {
    cashstar: {
      amounts: [10, 20, 50],
      currencyFormat: '€%d'
    },
    online: ['startselect', 'amazonde'],
    instore: ['gamestop']
  },
  es: {
    cashstar: {
      amounts: [10, 25, 50],
      currencyFormat: '$%d'
    },
    online: ['startselect', 'amazones'],
    instore: ['game']
  },
  nz: {
    online: ['startselect'],
    instore: ['ebgames', 'jbhifi', 'woolworths'],
    hideExclusive: true
  },
  ie: {
    cashstar: {
      amounts: [10, 25, 50],
      currencyFormat: '$%d'
    },
    online: ['gamestop', 'startselect'],
    instore: ['gamestop', 'smyths']
  },
  it: {
    cashstar: {
      amounts: [10, 25, 50],
      currencyFormat: '$%d'
    },
    online: ['gamestop', 'amazonit', 'startselect'],
    instore: ['puntolis', 'gamestop']
  },
  ch: {
    cashstar: {
      amounts: [10, 25, 50],
      currencyFormat: '$%d'
    },
    online: ['startselect'],
    instore: ['gamestop']
  },
  dk: {
    online: ['startselect'],
    instore: [],
    hideExclusiveDesc: true
  },
  fi: {
    online: ['startselect'],
    instore: ['rkioski', 'kesko', 'verkkokauppa', 'soksgroup']
  },
  no: {
    online: ['startselect'],
    instore: [],
    hideExclusiveDesc: true
  },
  se: {
    online: ['startselect'],
    instore: ['mediamarkt'],
    hideExclusiveDesc: true
  },
  nl: {
    cashstar: {
      amounts: [10, 20, 50],
      currencyFormat: '€%d'
    },
    online: ['startselect'],
    instore: ['kruidvat']
  },
  be: {
    cashstar: {
      amounts: [10, 25, 50],
      currencyFormat: '$%d'
    },
    online: ['startselect'],
    instore: ['carrefour']
  },
  jp: {
    cashstar: {
      amounts: [10, 25, 50],
      currencyFormat: '$%d'
    },
    online: ['amazonjp', 'kiigo'],
    instore: [
      'seven11',
      'familymart',
      'ministop',
      'yamadadenki',
      'edion',
      'geo',
      'aeongroup',
      'donquijote',
      'lawsons',
      'kaikatsu',
      'costcojp'
    ]
    // hideExclusiveDesc: true,
  },
  br: {
    cashstar: {
      amounts: [10, 25, 50],
      currencyFormat: '$%d'
    },
    online: ['zero3', 'softwareexpress', 'gcmgames', 'bancointer', 'nubank', 'nuuvem', 'picpay'],
    instore: ['paguemenos', 'gpabr', 'rvtecnologia', 'carrefour']
    // hideExclusive: true,
  },
  mx: {
    online: [],
    instore: ['walmart', 'oxxo', 'soriana', 'chedraui', 'gameplanet', 'coppel', 'officedepot'],
    hideExclusive: true
  },
  pt: {
    online: ['wortenequip', 'startselect'],
    instore: ['pagaqui', 'payshop', 'vaspexpresso', 'wortenequip']
  },
  pl: {
    online: ['startselect', 'empik', 'mediaexpert', 'muveonline'],
    instore: [
      'empik',
      'inmedio',
      'inmediotrendy',
      'mediaexpert',
      'mediasaturn',
      'relay',
      'carrefour',
      'zabka'
    ]
  },
  at: {
    cashstar: {
      amounts: [10, 25, 50],
      currencyFormat: '$%d'
    },
    online: ['startselect', 'paysafe'],
    instore: ['billa', 'libro', 'rewepenny', 'smyths', 'spargroup', 'gamestop']
  },
  za: {
    online: [],
    instore: ['flashmobile', 'ackermans', 'picknpay'],
    hideExclusive: true
  },
  gr: {
    online: [],
    instore: ['plaisio', 'public', 'kotsovolos']
  },
  lv: {
    online: [],
    instore: ['elkor', 'rdelectronics']
  },
  my: {
    online: ['codashop', 'shopee', 'razergold'],
    instore: ['seven11my', 'speedmart', 'tmgmart', 'allit', 'kkmart', 'cosway'],
    hideExclusive: true
  },
  ro: {
    online: [],
    instore: ['carrefour'],
    hideExclusiveDesc: true
  },
  sg: {
    online: ['razergold', 'codashop'],
    instore: ['seven11', 'cheers', 'challenger'],
    hideExclusive: true
  },
  th: {
    online: ['razergold'],
    instore: ['seven11', 'bigc', 'tescolotus', 'familymart', 'codashop'],
    hideExclusive: true
  },
  sk: {
    online: ['aircash', 'hernekupony'],
    instore: ['smarty']
  },
  sl: {
    online: ['aircash'],
    instore: ['muller']
  },
  cy: {
    online: ['aircash'],
    instore: []
  },
  hu: {
    online: ['konzolstudio'],
    instore: []
  },
  ae: {
    online: ['amazonjp'],
    instore: []
  },
  sa: {
    online: ['amazonjp'],
    instore: []
  },
  ko: {
    online: ['kakao', 'auction', 'gmarket', 'elevenst'],
    instore: ['gs25']
  }
};
for (const countryIndex in DISABLED_COUNTRIES) {
  const countryCode = DISABLED_COUNTRIES[countryIndex];
  delete readableRetailerInfo[countryCode];
  delete prizes[countryCode];
}

const retailerInfo = {};
for (const countryCode in readableRetailerInfo) {
  const info = readableRetailerInfo[countryCode];
  retailerInfo[countryCode] = {};
  if (info.cashstar) {
    retailerInfo[countryCode].cashstar = info.cashstar;
  }
  retailerInfo[countryCode].online = info.online.map(function (n, o) {
    return retailersMap[n];
  });
  retailerInfo[countryCode].instore = info.instore.map(function (n, o) {
    return retailersMap[n];
  });
  retailerInfo[countryCode].event_section = info.event_section;
  retailerInfo[countryCode].hideExclusive = info.hideExclusive;
  retailerInfo[countryCode].hideExclusiveDesc = info.hideExclusiveDesc;
}

// Section4.html
lang = {
  english: {
    location: 'Location',
    redeem: 'Redeem Card',
    copyright: '© 2026 Roblox Corporation. All Rights Reserved.',
    terms: 'Terms',
    privacy: 'Privacy',
    'region-us': 'USA',
    'region-ca': 'Canada',
    'region-au': 'Australia',
    'region-uk': 'UK',
    'region-fr': 'France',
    'region-de': 'Germany',
    'region-es': 'Spain',
    'region-nz': 'New Zealand',
    'region-ie': 'Republic of Ireland',
    'region-it': 'Italy',
    'region-ch': 'Switzerland',
    'region-nl': 'Netherlands',
    'region-be': 'Belgium',
    'region-jp': 'Japan',
    'region-mx': 'Mexico',
    'region-br': 'Brazil',
    'region-at': 'Austria',
    'region-pt': 'Portugal',
    'region-pl': 'Poland',
    'region-za': 'South Africa',
    'region-dk': 'Denmark',
    'region-fi': 'Finland',
    'region-no': 'Norway',
    'region-se': 'Sweden',
    'region-gr': 'Greece',
    'region-lv': 'Latvia',
    'region-my': 'Malaysia',
    'region-ro': 'Romania',
    'region-sg': 'Singapore',
    'region-th': 'Thailand',
    'region-sk': 'Slovakia',
    'region-sl': 'Slovenia',
    'region-cy': 'Cyprus',
    'region-hu': 'Hungary',
    'region-sa': 'Saudi Arabia',
    'region-ae': 'United Arab Emirates',
    'region-ko': 'South Korea',
    maintitle: 'Get more out of Roblox',
    mainbutton: 'Shop Gift Cards',
    'giftcards-desc':
      'Roblox Gift Cards are the easiest way to add credit you can spend toward Robux or a Premium subscription.',
    'virtual-title': 'Free Virtual Items',
    'virtual-desc':
      'Each gift card grants a free virtual item upon redemption and comes with a bonus code for an additional exclusive virtual item.',
    'virtual-desc-multi':
      'Each gift card grants a free virtual item upon redemption and comes with a bonus code for two additional exclusive virtual items.',
    'item-included': 'Virtual Item Included',
    'item-bonus': 'Bonus Exclusive Virtual Item',
    'virtual-footnote': 'Limit one item and one bonus item per month per account.',
    'cards-title': 'Surprise a Roblox fan today',
    'cards-desc':
      'Choose from dozens of eGift card designs based on your favorite experiences, characters, and more.',
    retailers:
      'Roblox Gift Cards are also <a class="link-retailers">available at a retailer near you.</a>',
    'retailers-maintitle': 'The perfect gift for any Roblox fan',
    'digital-title': 'Purchase Online',
    'digital-desc': 'Find Roblox Gift Cards at any of these online retailers:',
    'digital-footnote':
      'Please note that Roblox Digital Gift Cards purchased from Amazon only grant Robux and cannot be used toward a Premium subscription.',
    'in-store-title': 'Purchase in Store',
    'in-store-desc': 'Roblox Gift Cards are available at physical retailers near you, including:',
    'free-item-desc': 'Each gift card grants a free virtual item upon redemption.',
    'free-item-footnote':
      'Items change on a monthly basis and are dependent on the retailer. Limit one per gift card per account.',
    'exclusive-desc':
      'For a limited time, get a bonus code for an additional exclusive virtual item when you purchase a gift card directly from Roblox.',
    bakuganevent1:
      'Get the Genesis Dragonoid bonus item and unlock all ten Bakugan in the Bakugan Battle League experience on Roblox.',
    bakuganevent2:
      'First 10,000 customers can also receive a free, limited-edition “Genesis Dragonoid” Bakugan trading card with purchase.*',
    bakuganevent3:
      'Our first Bakugan trading card giveaway has ended. Stay tuned for the next one coming this October!',
    bakuganevent4: `First 10,000 customers can also receive a free, limited-edition “Genesis Wrath” Bakugan trading card with purchase.*`,
    bakuganevent5: `Our Bakugan trading card giveaway has ended. Please check back again in the future for other promotions and offers.`,
    'special-event-footnote':
      '*Offer available only to U.S. residents aged 13 or older until November 21, 2022 or while supplies last. Must have a Roblox account to access and use the virtual items, limit of two virtual items per month per account. Purchasers must opt in to receive a trading card at the time of purchasing a gift card. Roblox is not responsible for lost or stolen trading cards. Images ©2022 Roblox Corporation and © 2022 Spin Master Ltd. All rights reserved.',
    b2bshop: 'Shop Roblox Gift Cards for Business',
    b2bgiftcards: 'Roblox Gift Cards for Business',
    b2bdesc:
      'There’s an easy way to order Roblox Gift Cards in bulk! Celebrate wins, increase motivation, and show appreciation with Roblox Gift Cards.',
    b2border: 'Order Now',
    'maintitle-more-robux': 'Enjoy up to <br> 25% more Robux',
    'main-subtitle-more-robux': 'Get more Robux with gift cards, and on computer and web'
  },
  spanish: {
    location: 'Ubicación',
    redeem: 'Canjear tarjeta',
    'region-us': 'Estados Unidos',
    'region-ca': 'Canadá',
    'region-au': 'Australia',
    'region-uk': 'Reino Unido',
    'region-fr': 'Francia',
    'region-de': 'Alemania',
    'region-es': 'España',
    'region-nz': 'Nueva Zelanda',
    'region-ie': 'República de Irlanda',
    'region-it': 'Italia',
    'region-ch': 'Suiza',
    'region-nl': 'Países Bajos',
    'region-be': 'Bélgica',
    'region-jp': 'Japón',
    'region-mx': 'México',
    'region-br': 'Brasil',
    'region-at': 'Austria',
    'region-pt': 'Portugal',
    'region-pl': 'Polonia',
    'region-za': 'Sudáfrica',
    'region-dk': 'Dinamarca',
    'region-fi': 'Finlandia',
    'region-no': 'Noruega',
    'region-se': 'Suecia',
    'region-gr': 'Grecia',
    'region-lv': 'Letonia',
    'region-my': 'Malasia',
    'region-ro': 'Rumania',
    'region-sg': 'Singapur',
    'region-th': 'Tailandia',
    'region-sk': 'Eslovaquia',
    'region-sl': 'Eslovenia',
    'region-cy': '',
    'region-hu': '',
    'region-sa': 'Arabia Saudí',
    'region-ae': 'Emiratos Árabes Unidos',
    'region-ko': 'Corea del Sur',
    copyright: '2026 Roblox Corporation. Todos los derechos reservados.',
    terms: 'Términos',
    privacy: 'Privacidad',
    maintitle: 'Sácale aún más provecho a Roblox',
    mainbutton: 'Comprar tarjetas regalo',
    'giftcards-desc':
      'Las tarjetas regalo te permiten añadir crédito para comprar Robux o suscribirte a Premium de la forma más fácil.',
    'virtual-title': 'Objetos virtuales gratuitos',
    'virtual-desc':
      'Cada tarjeta regalo te otorga un objeto virtual gratuito al momento de canjearla. Además, viene acompañada de un código extra para recibir un exclusivo artículo virtual adicional.',
    'virtual-desc-multi':
      'Cada tarjeta regalo otorga un objeto virtual adicional al canjearla. Además, viene acompañada de un código extra para obtener dos objetos exclusivos adicionales.',
    'item-included': 'Objeto virtual incluido',
    'item-bonus': 'Exclusivo objeto virtual extra',
    'virtual-footnote': 'Límite de un objeto incluido y uno extra al mes por cuenta.',
    //    "virtual-footnote": "Limitado a un objeto y objeto de bonificación al mes por cuenta. Imágenes ©2022 Roblox Corporation y © 2022 Spin Master Ltd. Todos los derechos reservados.",
    'cards-title': 'Sorprende a un fan de Roblox',
    'cards-desc':
      'Elige entre decenas de diseños de tarjetas regalo electrónicas inspiradas en tus experiencias favoritas, personajes y más.',
    retailers:
      'Las tarjetas regalo <a class="link-retailers">están disponibles en comercios cerca de ti.</a>',
    'retailers-maintitle': 'El regalo perfecto para los fans de Roblox',
    'digital-title': 'Comprar en línea',
    'digital-desc': 'Encuentra las tarjetas regalo de Roblox en estos comercios en línea:',
    'digital-footnote':
      'Recuerda que las tarjetas regalo digitales de Roblox compradas en Amazon solo te otorgan Robux y no se pueden usar para suscribirse a Premium.',
    'in-store-title': 'Comprar en tiendas',
    'in-store-desc':
      'Las tarjetas regalo de Roblox están disponibles en comercios físicos cerca de ti:',
    'free-item-desc':
      'Cada tarjeta regalo otorga un objeto virtual gratuito al momento de canjearla.',
    'free-item-footnote':
      'Los objetos otorgados cambian mensualmente y dependen del comercio. Límite de una tarjeta regalo por cuenta.',
    'exclusive-desc':
      'Por tiempo limitado, canjea un código extra para obtener un exclusivo objeto virtual adicional con la compra de una tarjeta regalo directamente en Roblox.',
    bakuganevent1:
      'Consigue el objeto de bonificación Génesis Dragonoid y desbloquea los diez Bakugan en la experiencia Bakugan Battle League en Roblox.',
    bakuganevent2:
      'Los primeros 10,000 clientes también recibirán una tarjeta de colección gratuita Bakugan "Genesis Dragonoid" de edición limitada con la compra.',
    bakuganevent3:
      'La primera distribución de tarjetas de colección Bakugan terminó. No te pierdas la siguiente ronda de regalos este octubre.',
    bakuganevent4: `Los primeros 10,000 clientes también recibirán una tarjeta de colección gratuita Bakugan "Genesis Wrath" de edición limitada con la compra.`,
    bakuganevent5: `La distribución de tarjetas de colección Bakugan terminó. Regresa aquí próximamente para más promociones y ofertas.`,
    'special-event-footnote':
      '*Oferta disponible solo para residentes de los EE UU de 13 años o mayores hasta el 21 de noviembre de 2022 o hasta que se agoten existencias. Debes tener una cuenta de Roblox para acceder y usar los objetos virtuales. Límite de dos objetos virtuales por mes por cuenta. Los compradores deben optar por recibir una tarjeta de colección al momento de adquirir una tarjeta regalo. Roblox no se hace responsable de las tarjetas robadas o extraviadas. Imágenes ©2022 Roblox Corporation and © 2022 Spin Master Ltd. Todos los derechos reservados.',
    'maintitle-more-robux': 'Obtén un <br> 25% más de Robux',
    'main-subtitle-more-robux': 'Consigue más Robux con tarjetas regalo, y en ordenador y web'
  },
  french_canada: {
    location: 'Location',
    redeem: 'Activer une carte',
    'region-us': 'États-Unis',
    'region-ca': 'Canada',
    'region-au': 'Australie',
    'region-uk': 'Royaume-Uni',
    'region-fr': 'France',
    'region-de': 'Allemagne',
    'region-es': 'Espagne',
    'region-nz': 'Nouvelle-Zélande',
    'region-ie': "République d'Irlande",
    'region-it': 'Italie',
    'region-ch': 'Suisse',
    'region-nl': 'Pays-Bas',
    'region-be': 'Belgique',
    'region-jp': 'Japon',
    'region-mx': 'Mexique',
    'region-br': 'Brésil',
    'region-at': "L'Autriche",
    'region-pt': 'le Portugal',
    'region-pl': 'Pologne',
    'region-za': 'Afrique du Sud',
    'region-dk': 'Danemark',
    'region-fi': 'Finlande',
    'region-no': 'Norvège',
    'region-se': 'Suède',
    'region-gr': 'Grèce',
    'region-lv': 'Lettonie',
    'region-my': 'Malaisie',
    'region-ro': 'Roumanie',
    'region-sg': 'Singapour',
    'region-th': 'Thaïlande',
    'region-sk': 'Slovaquie',
    'region-sl': 'Slovènie',
    'region-cy': '',
    'region-hu': '',
    'region-sa': 'Arabie Saoudite',
    'region-ae': 'Émirats Arabes Unis',
    'region-ko': 'Corée du Sud',
    copyright: '',
    terms: 'Conditions',
    privacy: 'Confidentialité',
    maintitle: 'Profite davantage de Roblox',
    mainbutton: 'Acheter des cartes-cadeaux',
    'giftcards-desc':
      "Les cartes-cadeaux Roblox sont le meilleur moyen d'ajouter des crédits que tu peux dépenser pour obtenir des Robux ou un abonnement Premium.",
    'virtual-title': 'Articles virtuels offerts',
    'virtual-desc':
      "Toutes les cartes-cadeaux donnent droit à un article virtuel gratuit lors son utilisation et  est accompagnée d'un code bonus pour un article virtuel exclusif supplémentaire.",
    'virtual-desc-multi':
      "Chaque carte-cadeau donne droit à un article virtuel gratuit lors de son utilisation et est accompagnée d'un code bonus pour deux articles virtuels exclusifs supplémentaires.",
    'item-included': 'Article virtuel inclus',
    'item-bonus': 'Article virtuel exclusif en bonus',
    'virtual-footnote': "Limite d'un article et d'un article bonus par mois et par compte.",
    //    "virtual-footnote": "Limite d'un article et d'un article bonus par mois et par compte. Images ©2022 Roblox Corporation et © 2022 Spin Master Ltd.  Tous droits réservés.",
    'cards-title': "Faire une surprise à un fan Roblox aujourd'hui",
    'cards-desc':
      'Choisis parmi des dizaines de modèles de cartes-cadeaux électroniques inspirés par tes expériences et personnages préférés et bien plus encore.',
    retailers:
      'Les cartes-cadeaux sont également <a class="link-retailers">disponibles chez un détaillant près de chez toi.</a>',
    'retailers-maintitle': 'Le cadeau parfait pour tous les fans de Roblox',
    'digital-title': 'Acheter en ligne',
    'digital-desc': "Trouver des cartes-cadeaux Roblox chez l'un de ces détaillants en ligne :",
    'digital-footnote':
      "Prendre en considération que les cartes-cadeaux numériques Roblox achetées sur Amazon ne donnent droit qu'à des Robux et ne peuvent pas être utilisées pour un abonnement Premium.",
    'in-store-title': 'Acheter en magasin',
    'in-store-desc':
      'Les cartes-cadeaux Roblox sont disponibles chez les détaillants locaux près de chez toi :',
    'free-item-desc':
      'Toutes les cartes-cadeaux donnent droit à un article virtuel gratuit lors de leur utilisation.',
    'free-item-footnote':
      'Les articles changent tous les mois et dépendent du détaillant. Limité à un par carte-cadeau par compte.',
    'exclusive-desc':
      'Obtiens un code bonus pour un article virtuel exclusif supplémentaire pour une durée limitée lorsque tu achètes une carte-cadeau directement sur Roblox.',
    bakuganevent1:
      "Obtiens l'article bonus Genesis Dragonoid et débloque les dix Bakugan dans l'expérience Bakugan Battle League sur Roblox.",
    bakuganevent2:
      'Les 10 000 premiers clients peuvent également recevoir une carte de collection Bakugan gratuite "Genesis Dragonoid" en édition limitée avec un achat.*',
    bakuganevent3:
      "Notre premier concours de cartes à collectionner Bakugan est terminé. Reste à l'écoute pour le prochain tirage qui aura lieu en octobre !",
    bakuganevent4: `Les 10 000 premiers clients peuvent également recevoir une carte de collection Bakugan gratuite "Genesis Wrath" en édition limitée avec un achat.*`,
    bakuganevent5: `Notre concours de cartes à collectionner Bakugan est terminé. Reviens nous voir à l'avenir pour d'autres promotions et offres.`,
    'special-event-footnote':
      "*Offre réservée aux résidents américains âgés de 13 ans ou plus jusqu'au 21 novembre 2022 ou jusqu'à épuisement des stocks. Il faut avoir un compte Roblox pour accéder aux articles virtuels et les utiliser, dans la limite de deux articles virtuels par mois et par compte. Les acheteurs doivent choisir de recevoir une carte d'échange au moment de l'achat d'une carte cadeau.  Roblox n'est pas responsable des cartes d'échange perdues ou volées.  Images ©2022 Roblox Corporation et © 2022 Spin Master Ltd.  Tous droits réservés.",
    b2bshop: 'Magasiner des cartes-cadeaux Roblox pour les professionnels',
    b2bgiftcards: 'Cartes-cadeaux Roblox pour les professionnels',
    b2bdesc:
      'Il existe un moyen facile de commander des cartes cadeaux Roblox en grand nombre! Célébrez les victoires, renforcez la motivation et témoignez votre reconnaissance avec les cartes cadeaux Roblox.',
    b2border: 'Commander',
    'maintitle-more-robux': '',
    'main-subtitle-more-robux': ''
  },
  french: {
    location: 'Location',
    redeem: 'Activer une carte',
    'region-us': 'États-Unis',
    'region-ca': 'Canada',
    'region-au': 'Australie',
    'region-uk': 'Royaume-Uni',
    'region-fr': 'France',
    'region-de': 'Allemagne',
    'region-es': 'Espagne',
    'region-nz': 'Nouvelle-Zélande',
    'region-ie': "République d'Irlande",
    'region-it': 'Italie',
    'region-ch': 'Suisse',
    'region-nl': 'Pays-Bas',
    'region-be': 'Belgique',
    'region-jp': 'Japon',
    'region-mx': 'Mexique',
    'region-br': 'Brésil',
    'region-at': "L'Autriche",
    'region-pt': 'le Portugal',
    'region-pl': 'Pologne',
    'region-za': 'Afrique du Sud',
    'region-dk': 'Danemark',
    'region-fi': 'Finlande',
    'region-no': 'Norvège',
    'region-se': 'Suède',
    'region-gr': 'Grèce',
    'region-lv': 'Lettonie',
    'region-my': 'Malaisie',
    'region-ro': 'Roumanie',
    'region-sg': 'Singapour',
    'region-th': 'Thaïlande',
    'region-sk': 'Slovaquie',
    'region-sl': 'Slovènie',
    'region-cy': '',
    'region-hu': '',
    'region-sa': 'Arabie Saoudite',
    'region-ae': 'Émirats Arabes Unis',
    'region-ko': 'Corée du Sud',
    copyright: '',
    terms: 'Conditions',
    privacy: 'Confidentialité',
    maintitle: 'Profite davantage de Roblox',
    mainbutton: 'Acheter des cartes-cadeaux',
    'giftcards-desc':
      "Les cartes-cadeaux Roblox sont le meilleur moyen d'ajouter des crédits que tu peux dépenser pour obtenir des Robux ou un abonnement Premium.",
    'virtual-title': 'Articles virtuels offerts',
    'virtual-desc':
      "Toutes les cartes-cadeaux donnent droit à un article virtuel gratuit lors son utilisation et  est accompagnée d'un code bonus pour un article virtuel exclusif supplémentaire.",
    'virtual-desc-multi':
      "Chaque carte-cadeau donne droit à un article virtuel gratuit lors de son utilisation et est accompagnée d'un code bonus pour deux articles virtuels exclusifs supplémentaires.",
    'item-included': 'Article virtuel inclus',
    'item-bonus': 'Article virtuel exclusif en bonus',
    'virtual-footnote': "Limite d'un article et d'un article bonus par mois et par compte.",
    //    "virtual-footnote": "Limite d'un article et d'un article bonus par mois et par compte. Images ©2022 Roblox Corporation et © 2022 Spin Master Ltd.  Tous droits réservés.",
    'cards-title': "Faire une surprise à un fan Roblox aujourd'hui",
    'cards-desc':
      'Choisis parmi des dizaines de modèles de cartes-cadeaux électroniques inspirés par tes expériences et personnages préférés et bien plus encore.',
    retailers:
      'Les cartes-cadeaux sont également <a class="link-retailers">disponibles chez un détaillant près de chez toi.</a>',
    'retailers-maintitle': 'Le cadeau parfait pour tous les fans de Roblox',
    'digital-title': 'Acheter en ligne',
    'digital-desc': "Trouver des cartes-cadeaux Roblox chez l'un de ces détaillants en ligne :",
    'digital-footnote':
      "Prendre en considération que les cartes-cadeaux numériques Roblox achetées sur Amazon ne donnent droit qu'à des Robux et ne peuvent pas être utilisées pour un abonnement Premium.",
    'in-store-title': 'Acheter en magasin',
    'in-store-desc':
      'Les cartes-cadeaux Roblox sont disponibles chez les détaillants locaux près de chez toi :',
    'free-item-desc':
      'Toutes les cartes-cadeaux donnent droit à un article virtuel gratuit lors de leur utilisation.',
    'free-item-footnote':
      'Les articles changent tous les mois et dépendent du détaillant. Limité à un par carte-cadeau par compte.',
    'exclusive-desc':
      'Obtiens un code bonus pour un article virtuel exclusif supplémentaire pour une durée limitée lorsque tu achètes une carte-cadeau directement sur Roblox.',
    bakuganevent1:
      "Obtiens l'article bonus Genesis Dragonoid et débloque les dix Bakugan dans l'expérience Bakugan Battle League sur Roblox.",
    bakuganevent2:
      'Les 10 000 premiers clients peuvent également recevoir une carte de collection Bakugan gratuite "Genesis Dragonoid" en édition limitée avec un achat.*',
    bakuganevent3:
      "Notre premier concours de cartes à collectionner Bakugan est terminé. Reste à l'écoute pour le prochain tirage qui aura lieu en octobre !",
    bakuganevent4: `Les 10 000 premiers clients peuvent également recevoir une carte de collection Bakugan gratuite "Genesis Wrath" en édition limitée avec un achat.*`,
    bakuganevent5: `Notre concours de cartes à collectionner Bakugan est terminé. Reviens nous voir à l'avenir pour d'autres promotions et offres.`,
    'special-event-footnote':
      "*Offre réservée aux résidents américains âgés de 13 ans ou plus jusqu'au 21 novembre 2022 ou jusqu'à épuisement des stocks. Il faut avoir un compte Roblox pour accéder aux articles virtuels et les utiliser, dans la limite de deux articles virtuels par mois et par compte. Les acheteurs doivent choisir de recevoir une carte d'échange au moment de l'achat d'une carte cadeau.  Roblox n'est pas responsable des cartes d'échange perdues ou volées.  Images ©2022 Roblox Corporation et © 2022 Spin Master Ltd.  Tous droits réservés.",
    b2bshop: 'Acheter des cartes-cadeaux Roblox pour les professionnels',
    b2bgiftcards: 'Cartes-cadeaux Roblox pour les professionnels',
    b2bdesc:
      'Il existe un moyen facile de commander des cartes cadeaux Roblox en grand nombre ! Célébrez les victoires, renforcez la motivation et témoignez votre reconnaissance avec les cartes cadeaux Roblox.',
    b2border: 'Acheter',
    'maintitle-more-robux': "Profite de jusqu'à <br> 25 % de Robux en plus",
    'main-subtitle-more-robux':
      'Obtiens plus de Robux avec des cartes-cadeaux, sur ordinateur et le web.'
  },
  german: {
    location: 'Standort',
    redeem: 'Gutschein einlösen',
    'region-us': 'USA',
    'region-ca': 'Kanada',
    'region-au': 'Australien',
    'region-uk': 'Vereinigtes Königreich',
    'region-fr': 'Frankreich',
    'region-de': 'Deutschland',
    'region-es': 'Spanien',
    'region-nz': 'Neuseeland',
    'region-ie': 'Republik Irland',
    'region-it': 'Italien',
    'region-ch': 'Schweiz',
    'region-nl': 'Niederlande',
    'region-be': 'Belgien',
    'region-jp': 'Japan',
    'region-mx': 'Mexiko',
    'region-br': 'Brasilien',
    'region-at': 'Österreich',
    'region-pt': 'Portugal',
    'region-pl': 'Polen',
    'region-za': 'Südafrika',
    'region-dk': 'Dänemark',
    'region-fi': 'Finnland',
    'region-no': 'Norwegen',
    'region-se': 'Schweden',
    'region-gr': 'Griechenland',
    'region-lv': 'Lettland',
    'region-my': 'Malaysia',
    'region-ro': 'Rumänien',
    'region-sg': 'Singapur',
    'region-th': 'Thailand',
    'region-sk': 'Slowakei',
    'region-sl': 'Slowenien',
    'region-cy': '',
    'region-hu': '',
    'region-sa': 'Saudi-Arabien',
    'region-ae': 'Vereinigte Arabische Emirate',
    'region-ko': 'Südkorea',
    copyright: '© 2026 Roblox Corporation. Alle Rechte vorbehalten.',
    terms: 'Bedingungen',
    privacy: 'Datenschutz',
    maintitle: 'Hol mehr aus Roblox raus',
    mainbutton: 'Geschenkgutscheine kaufen',
    'giftcards-desc':
      'Roblox-Geschenkgutscheine bieten die einfachste Möglichkeit, Guthaben aufzufüllen, das du für Robux oder ein Premium-Abo verwenden kannst.',
    'virtual-title': 'Kostenlose virtuelle Items',
    'virtual-desc':
      'Beim Einlösen jedes Geschenkgutscheins gibt es ein kostenloses virtuelles Item sowie einen Bonuscode für ein zusätzliches exklusives virtuelles Item.',
    'virtual-desc-multi':
      'Beim Einlösen jedes Geschenkgutscheins gibt es ein kostenloses virtuelles Item sowie einen Bonuscode für zwei zusätzliche exklusive virtuelle Items.',
    'item-included': 'Virtuelles Item inklusive',
    'item-bonus': 'Exklusives virtuelles Bonus-Item',
    'virtual-footnote': 'Begrenzt auf ein Item und ein Bonus-Item pro Monat pro Konto.',
    //    "virtual-footnote": "Begrenzt auf ein Item und ein Bonus-Item pro Monat pro Konto. Bilder ©2022 Roblox Corporation und © 2022 Spin Master Ltd. Alle Rechte vorbehalten.",
    'cards-title': 'Überrasche noch heute einen Roblox-Fan',
    'cards-desc':
      'Wähle aus Dutzenden digitalen Gutscheindesigns mit deinem Lieblingserlebnis, Lieblings-Charakter und mehr aus.',
    retailers:
      'Roblox-Geschenkgutscheine sind auch <a class="link-retailers">in Geschäften in deine Nähe verfügbar.</a>',
    'retailers-maintitle': 'Das perfekte Geschenk für jeden Roblox-Fan',
    'digital-title': 'Online kaufen',
    'digital-desc': 'Finde Roblox-Geschenkgutscheine bei diesen Online-Händlern:',
    'digital-footnote':
      'Bitte beachte, dass digitale Roblox-Geschenkgutscheine, die bei Amazon gekauft wurden, nur für Robux und nicht für ein Premium-Abo verwendet werden können.',
    'in-store-title': 'Im Geschäft kaufen',
    'in-store-desc':
      'Roblox-Geschenkgutscheine sind in Geschäften in deiner Nähe verfügbar, darunter:',
    'free-item-desc':
      'Beim Einlösen jedes Geschenkgutscheins gibt es ein kostenloses virtuelles Item.',
    'free-item-footnote':
      'Die Items ändern sich monatlich und unterscheiden sich je nach Händler. Begrenzt auf einen Gutschein pro Konto.',
    'exclusive-desc':
      'Nur für kurze Zeit, erhalte einen Bonuscode für ein zusätzliches exklusives virtuelles Item, wenn du einen Geschenkgutschein direkt bei Roblox kaufst.',
    bakuganevent1:
      'Hol dir das Genesis Dragonoid Bonus Item und schalte alle zehn Bakugan im Bakugan Battle League Erlebnis auf Roblox frei.',
    bakuganevent2:
      'Die ersten 10.000 Kund:innen können außerdem beim Kauf eine kostenlose, limitierte „Genesis Dragonoid“ Bakugan-Sammelkarte erhalten.*',
    bakuganevent3:
      'Unsere erste Geschenkaktion von Bakugan-Sammelkarten ist beendet. Schau im Oktober für die nächste Runde vorbei!',
    bakuganevent4: `Die ersten 10.000 Kund:innen können außerdem beim Kauf eine kostenlose, limitierte „Genesis Wrath“ Bakugan-Sammelkarte erhalten.`,
    bakuganevent5: `Unsere Geschenkaktion von Bakugan-Sammelkarten ist beendet. Schau immer mal vorbei und halte Ausschau nach neuen Aktionen und Angeboten.`,
    'special-event-footnote':
      '*Angebot ist nur für US-amerikanische Einwohner:innen im Alter von über 13 Jahren verfügbar bis zum 21. November 2022 oder solange der Vorrat reicht. Der Besitz eines Roblox-Kontos ist nötig, um auf virtuelle Items zuzugreifen und sie zu benutzen. Limitierung auf zwei virtuelle Items pro Monat pro Konto. Käufer:innen müssen beim Kauf eines Geschenkgutscheins aktiv angeben, dass sie eine Sammelkarte wünschen. Roblox ist nicht für den Verlust oder Diebstahl von Sammelkarten verantwortlich. Bilder ©2022 Roblox Corporation und © 2022 Spin Master Ltd. Alle Rechte vorbehalten.',
    'maintitle-more-robux': 'Sichere dir bis zu <br> 25 % mehr Robux',
    'main-subtitle-more-robux':
      'Hol dir mehr Robux mit Geschenkkarten, am Computer oder über die Website'
  },
  portuguese: {
    location: 'Local',
    redeem: 'Resgatar Cartão',
    'region-us': 'Estados Unidos',
    'region-ca': 'Canadá',
    'region-au': 'Austrália',
    'region-uk': 'Reino Unido',
    'region-fr': 'França',
    'region-de': 'Alemanha',
    'region-es': 'Espanha',
    'region-nz': 'Nova Zelândia',
    'region-ie': 'Irlanda',
    'region-it': 'Itália',
    'region-ch': 'Suíça',
    'region-nl': 'Holanda',
    'region-be': 'Bélgica',
    'region-jp': 'Japão',
    'region-mx': 'México',
    'region-br': 'Brasil',
    'region-at': 'Áustria',
    'region-pt': 'Portugal',
    'region-pl': 'Polônia',
    'region-za': 'África do Sul',
    'region-dk': 'Dinamarca',
    'region-fi': 'Finlândia',
    'region-no': 'Noruega',
    'region-se': 'Suécia',
    'region-gr': 'Grécia',
    'region-lv': 'Letônia',
    'region-my': 'Malásia',
    'region-ro': 'Romênia',
    'region-sg': 'Singapura',
    'region-th': 'Tailândia',
    'region-sk': 'Eslováquia',
    'region-sl': 'Eslovênia',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Coréia do Sul',
    copyright: '© 2026 Roblox Corporation. Todos os direitos reservados.',
    terms: 'Termos',
    privacy: 'Privacidade',
    maintitle: 'Ganhe mais com a Roblox',
    mainbutton: 'Comprar cartão presente',
    'giftcards-desc':
      'Cartões presente Roblox são a maneira mais fácil de adicionar créditos, que você pode usar para comprar Robux ou uma assinatura Premium.',
    'virtual-title': 'Itens virtuais grátis',
    'virtual-desc':
      'Cada cartão presente vem com um item virtual que é recebido após o resgate, além de um código bônus para um exclusivo item virtual adicional.',
    'virtual-desc-multi':
      'Cada cartão presente vem com um item virtual que é recebido após o resgate, além de um código bônus para dois exclusivos itens virtual adicionais.',
    'item-included': 'Inclui Item Virtual',
    'item-bonus': 'Bônus: Item virtual exclusivo ',
    'virtual-footnote': 'Limite de um item e um item bônus por mês por conta.',
    //    "virtual-footnote": "Limite de um item e um item bônus por mês por conta. Imagens © 2022 Roblox Corporation e © 2022 Spin Master Ltd. Todos os direitos reservados.",
    'cards-title': 'Surpreenda um fã da Roblox ',
    'cards-desc':
      'Escolha entre dezenas de designs de cartões presente eletrônicos baseados em suas experiências preferidas, personagens e muito mais.',
    retailers:
      'Cartões presente Roblox também estão disponíveis <a class="link-retailers">em uma loja perto de você.</a>',
    'retailers-maintitle': 'O presente perfeito para fãs da Roblox',
    'digital-title': 'Compre Online',
    'digital-desc': 'Encontre cartões presente Roblox em qualquer um destes revendedores:',
    'digital-footnote':
      'Observe que cartões presente digitais da Roblox comprados na Amazon só fornecem Robux e não podem ser usados para comprar assinaturas Premium.',
    'in-store-title': 'Compre em Lojas',
    'in-store-desc':
      'Cartões presente Roblox estão disponíveis em lojas físicas perto de você, incluindo:',
    'free-item-desc': 'Cada cartão presente vem com um item virtual que é recebido após o resgate.',
    'free-item-footnote':
      'Itens mudam mensalmente e dependem da loja onde foram comprados. Limite de um cartão presente por conta por mês.',
    'exclusive-desc':
      'Por tempo limitado, receba um código bônus para um item virtual adicional exclusivo quando você compra um cartão presente direto da Roblox.',
    bakuganevent1:
      'Receba o item bônus Genesis Dragonoid e desbloqueie todos os dez Bakugan na experiência Bakugan Battle League na Roblox.',
    bakuganevent2:
      'Os primeiros 10 mil clientes também podem receber gratuitamente um card Bakugan de edição limitada "Genesis Dragonoid" com a compra.*',
    bakuganevent3:
      'Nossa primeira distribuição de cards Bakugan de presente terminou. Fique de olho na próxima, que acontece em outubro!',
    bakuganevent4: `Os primeiros 10 mil clientes também podem receber gratuitamente um card Bakugan de edição limitada "Genesis Wrath" com a compra.*`,
    bakuganevent5: `Nossa distribuição de cards Bakugan de presente terminou. Confirma novamente no futuro para outras promoções e ofertas.`,
    'special-event-footnote':
      '*Oferta disponível somente para residentes dos Estados Unidos com 13 anos de idade ou mais, até 21 de novembro de 2022 ou enquanto durar o estoque. Deve possuir uma conta Robhlox para acessar e usar os itens virtuais. Limite de dois itens virtuais por mês por conta. Compradores podem optar por receber um card na hora da compra do cartão presente. A Roblox não é responsável por cards perdidos ou roubados. Imagens ©2022 Roblox Corporation e © 2022 Spin Master Ltd.  Todos os direitos reservados.',
    'maintitle-more-robux': 'Aproveite até <br> 25% Robux a mais',
    'main-subtitle-more-robux': 'Obtenha mais Robux com cartões presente, no computador e na web'
  },
  chinese_simplified: {
    location: '',
    redeem: '兑换礼品卡',
    'region-us': '美国',
    'region-ca': '加拿大',
    'region-au': '澳大利亚',
    'region-uk': '英国',
    'region-fr': '法国',
    'region-de': '德国',
    'region-es': '西班牙',
    'region-nz': '新西兰',
    'region-ie': '爱尔兰共和国',
    'region-it': '意大利',
    'region-ch': '瑞士',
    'region-nl': '荷兰',
    'region-be': '比利时',
    'region-jp': '日本',
    'region-mx': '墨西哥',
    'region-br': '巴西',
    'region-at': '奥地利',
    'region-pt': '葡萄牙',
    'region-pl': '波兰',
    'region-za': '南非',
    'region-dk': '丹麦',
    'region-fi': '芬兰',
    'region-no': '挪威',
    'region-se': '瑞典',
    'region-gr': '希腊',
    'region-lv': '拉脱维亚',
    'region-my': '马来西亚',
    'region-ro': '罗马尼亚',
    'region-sg': '新加坡',
    'region-th': '泰国',
    'region-sk': '斯洛伐克',
    'region-sl': '斯洛文尼亚',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': '韩国',
    copyright: '',
    terms: '',
    privacy: '',
    maintitle: '享受更多 Roblox 功能',
    mainbutton: '商店礼品卡',
    'giftcards-desc': '使用 Roblox 礼品卡，让你用最轻松的方式购买 Robux 或订阅 Premium 会员。',
    'virtual-title': '免费虚拟道具',
    'virtual-desc':
      '每一张礼品卡在兑换时都会赠送一个免费的虚拟道具，还会包括一个额外独家虚拟道具的代码。',
    'virtual-desc-multi':
      '每一张礼品卡在兑换时都会赠送一个免费的虚拟道具，还会包括两个额外独家虚拟道具的代码。',
    'item-included': '附赠虚拟道具',
    'item-bonus': '额外独家虚拟道具',
    'virtual-footnote': '每个帐户每个月仅限兑换一个虚拟道具和一个独家虚拟道具。',
    //    "virtual-footnote": "每个账户每月仅限领取一个道具以及一个额外道具。图像所有权 ©2022 Roblox Corporation 及 © 2022 Spin Master Ltd. 保留所有权利。",
    'cards-title': '今天就给 Roblox 的粉丝一个惊喜',
    'cards-desc': '根据你喜爱的体验、角色和更多内容选择数十种电子礼品卡的设计样式。',
    retailers: '<a class="link-retailers">Roblox 礼品卡也可以在你附近的零售商购买。</a>',
    'retailers-maintitle': '给 Roblox 粉丝的完美礼物',
    'digital-title': '网上购买',
    'digital-desc': '在下列任何一个网上零售商，都可以购买 Roblox 礼品卡：',
    'digital-footnote':
      '请注意，在 Amazon 购买的 Roblox 数字礼品卡只能用于获取 Robux，不能用于订阅 Premium 会员。',
    'in-store-title': '在商店购买实体礼品卡',
    'in-store-desc': 'Roblox 礼品卡可以在下列任何实体零售商购买：',
    'free-item-desc': '每一张礼品卡在兑换时都会赠送一个免费的虚拟道具。',
    'free-item-footnote': '道具会依据零售商的情况每月进行更换。每个帐户每张礼品卡仅限兑换一次。',
    'exclusive-desc':
      '活动限定期间，从 Roblox 直接购买一张礼品卡即可获得一个额外独家虚拟道具的代码。',
    bakuganevent1: '领取创世纪德拉根诺德额外道具，并解锁 Roblox 爆丸战斗联盟体验的所有十个爆丸。',
    bakuganevent2: '',
    bakuganevent3: '',
    bakuganevent4: ``,
    bakuganevent5: ``,
    'special-event-footnote':
      "*Offerta disponibile solo negli Stati Uniti per i residenti di età pari o superiore a 13 anni fino al 21 novembre 2022 o fino ad esaurimento scorte. È necessario disporre di un account Roblox per accedere e utilizzare gli oggetti virtuali, limite di due elementi virtuali al mese per account. Gli acquirenti devono scegliere di ricevere una carta collezionabile al momento dell'acquisto di una carta regalo. Roblox non è responsabile per lo smarrimento o il furto di carte collezionabili. Immagini ©2022 Roblox Corporation e © 2022 Spin Master Ltd. Tutti i diritti riservati.",
    'maintitle-more-robux': '',
    'main-subtitle-more-robux': ''
  },
  chinese_traditional: {
    location: '位置',
    redeem: '兌換點數卡',
    'region-us': '美國',
    'region-ca': '加拿大',
    'region-au': '澳洲',
    'region-uk': '英國',
    'region-fr': '法國',
    'region-de': '德國',
    'region-es': '西班牙',
    'region-nz': '紐西蘭',
    'region-ie': '愛爾蘭',
    'region-it': '義大利',
    'region-ch': '瑞士',
    'region-nl': '荷蘭',
    'region-be': '比利時',
    'region-jp': '日本',
    'region-mx': '墨西哥',
    'region-br': '巴西',
    'region-at': '奧地利',
    'region-pt': '葡萄牙',
    'region-pl': '波蘭',
    'region-za': '南非',
    'region-dk': '丹麥',
    'region-fi': '芬蘭',
    'region-no': '挪威',
    'region-se': '瑞典',
    'region-gr': '希臘',
    'region-lv': '拉脫維亞',
    'region-my': '馬來西亞',
    'region-ro': '羅馬尼亞',
    'region-sg': '新加坡',
    'region-th': '泰國',
    'region-sk': '斯洛伐克',
    'region-sl': '斯洛維尼亞',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': '韓國',
    copyright: '© 2026 Roblox Corporation。所有權利皆予以保留。',
    terms: '條款',
    privacy: '隱私權',
    maintitle: '升級 Roblox 享受',
    mainbutton: '購買點數卡',
    'giftcards-desc': '用 Roblox 點數卡加值，讓您輕鬆購買 Robux 或 Premium 訂閱。',
    'virtual-title': '免費虛擬道具',
    'virtual-desc': '每一張點數卡都會附贈一個免費虛擬道具，也會包括一個額外獨家虛擬道具的序號。',
    'virtual-desc-multi':
      '每一張點數卡都會附贈一個免費虛擬道具，也會包括兩個額外獨家虛擬道具的序號。',
    'item-included': '附贈虛擬道具',
    'item-bonus': '額外獨家虛擬道具',
    'virtual-footnote': '每個帳號每個月只能領取一個道具和一個額外道具。',
    //    "virtual-footnote": "每個帳號每月只能領取 1 個道具和 1 個額外道具。圖像版權：©2022 Roblox Corporation、© 2022 Spin Master Ltd。保留所有權利。",
    'cards-title': '給 Roblox 粉絲一個驚喜',
    'cards-desc': '根據您喜愛的體驗、角色等選擇最適合的電子點數卡款式。',
    retailers: 'Roblox 點數卡也可以<a class="link-retailers">在您附近的商家購買。</a>',
    'retailers-maintitle': 'Roblox 粉絲最期待的禮物',
    'digital-title': '線上購買',
    'digital-desc': '在以下網路商家購買 Roblox 點數卡：',
    'digital-footnote':
      '請注意，在 Amazon 購買的 Roblox 數位點數卡只能用來兌換 Robux，不能用來購買 Premium 訂閱。',
    'in-store-title': '購買實體點數卡',
    'in-store-desc': 'Roblox 點數卡可以在以下實體店面購買：',
    'free-item-desc': '每一張點數卡都會附贈一個免費虛擬道具。',
    'free-item-footnote': '道具種類會根據販賣商家每月替換。一個帳號只能從每張點數卡兌換一個道具。',
    'exclusive-desc': '限定期間內在 Roblox 直接購買點數卡，即可獲得一個額外獨家虛擬道具的序號。',
    bakuganevent1: '在 Roblox 爆丸戰鬥聯盟體驗獲得始祖獨角巨龍額外道具，並將 10 隻爆丸全數解鎖。',
    bakuganevent2: '前 10,000 名購買商品的客戶將會免費獲得限量版「始祖獨角巨龍」集換卡牌。*',
    bakuganevent3: '第一場爆丸集換卡牌大放送已結束。敬請期待十月的大放送！',
    bakuganevent4: `前 10,000 名購買商品的客戶將會免費獲得限量版「始祖烈虎」集換卡牌。*`,
    bakuganevent5: `爆丸集換卡牌大放送已結束。敬請期待更多促銷和優惠。`,
    'special-event-footnote':
      '* 優惠只開放給 13 歲以上的美國居民，並在 2022 年 11 月 21 日或無庫存時截止。必須擁有 Roblox 帳號才可獲得並使用虛擬道具，每個帳號每月限定 2 個虛擬道具。購買點數卡時必須選擇獲得集換卡牌。Roblox 不為遺失或遭竊的集換卡牌負責。圖像 © 2022 Roblox Corporation、© 2022 Spin Master Ltd。保留所有權利。',
    'maintitle-more-robux': '享受高達 <br> 多25% 的Robux',
    'main-subtitle-more-robux': '使用禮物卡、電腦和網頁獲得更多 Robux'
  },
  korean: {
    location: '국가',
    redeem: '카드 사용',
    'region-us': '미국',
    'region-ca': '캐나다',
    'region-au': '호주',
    'region-uk': '영국',
    'region-fr': '프랑스',
    'region-de': '독일',
    'region-es': '스페인',
    'region-nz': '뉴질랜드',
    'region-ie': '아일랜드 공화국',
    'region-it': '이탈리아',
    'region-ch': '스위스',
    'region-nl': '네덜란드',
    'region-be': '벨기에',
    'region-jp': '일본',
    'region-mx': '멕시코',
    'region-br': '브라질',
    'region-at': '오스트리아',
    'region-pt': '포르투갈',
    'region-pl': '폴란드',
    'region-za': '남아프리카',
    'region-dk': '덴마크',
    'region-fi': '핀란드',
    'region-no': '노르웨이',
    'region-se': '스웨덴',
    'region-gr': '그리스',
    'region-lv': '라트비아',
    'region-my': '말레이시아',
    'region-ro': '루마니아',
    'region-sg': '싱가포르',
    'region-th': '태국',
    'region-sk': '슬로바키아',
    'region-sl': '슬로베니아',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '사우디아라비아',
    'region-ae': '아랍 에미리트',
    'region-ko': '대한민국',
    copyright: '© 2026 Roblox Corporation. All Rights Reserved.',
    terms: '약관',
    privacy: '개인정보 보호',
    maintitle: 'Roblox를 더욱 풍성하게 즐기는 방법',
    mainbutton: '기프트 카드 구매',
    'giftcards-desc':
      'Roblox 기프트 카드는 계정에 크레딧을 추가할 수 있는 가장 편리한 방법입니다. 크레딧을 사용하면 Robux를 구매하거나 Premium에 가입할 수 있죠.',
    'virtual-title': '무료 가상 아이템 증정',
    'virtual-desc':
      '기프트 카드를 사용하면 무료 가상 아이템을 획득할 수 있습니다. 함께 제공되는 보너스 코드를 사용하면 특별 가상 아이템도 추가로 받을 수 있죠.',
    'virtual-desc-multi':
      '기프트 카드를 사용하면 무료 가상 아이템을 획득할 수 있습니다. 함께 제공되는 보너스 코드를 사용하면 추가로 2개의 특별 가상 아이템을 획득할 수도 있죠.',
    'item-included': '기본 가상 아이템',
    'item-bonus': '특별 보너스 가상 아이템',
    'virtual-footnote': '각 계정당 매월 기본 아이템 1개 및 보너스 아이템 1개만 획득할 수 있습니다.',
    //    "virtual-footnote": "각 계정당 매월 기본 아이템 1개 및 보너스 아이템 1개만 획득할 수 있습니다. Images ©2022 Roblox Corporation 및 © 2022 Spin Master Ltd. All rights reserved.",
    'cards-title': 'Roblox 팬을 위한 서프라이즈',
    'cards-desc':
      '인기 체험 및 캐릭터 등으로 꾸며진 수십여 가지 온라인 기프트 카드 중에서 원하는 디자인을 선택하세요.',
    retailers:
      'Roblox 기프트 카드는 <a class="link-retailers">근처 오프라인 매장에서도 구매할 수 있습니다.</a>',
    'retailers-maintitle': '세상의 모든 Roblox 팬을 위한 완벽한 선물',
    'digital-title': '온라인에서 구매하기',
    'digital-desc': '다음 온라인 매장에서 Roblox 기프트 카드를 구매하세요.',
    'digital-footnote':
      'Amazon에서 판매하는 Roblox 디지털 기프트 카드로는 Robux만 획득할 수 있으며, Premium 가입에는 사용할 수 없습니다.',
    'in-store-title': '매장에서 구매하기',
    'in-store-desc': 'Roblox 기프트 카드는 다음과 같은 근처 오프라인 매장에서 구매할 수 있습니다.',
    'free-item-desc': '기프트 카드를 사용하고 무료 가상 아이템을 획득하세요.',
    'free-item-footnote':
      '아이템 종류는 매월 변경되며 구매처에 따라 달라집니다. 각 계정별로 기프트 카드당 1개만 획득 가능합니다.',
    'exclusive-desc':
      '일정 기간 동안 Roblox에서 직접 기프트 카드를 구매하면 보너스 코드를 드립니다. 코드를 사용해 특별 가상 아이템을 추가로 획득하세요.',
    bakuganevent1:
      "Roblox '바쿠간 배틀 리그' 체험에서 제네시스 드래고노이드 보너스 아이템을 획득하고 바쿠간 10개를 모두 잠금 해제하세요.",
    bakuganevent2:
      "구매 고객 선착순 10,000명에 한해 한정판 '제네시스 드래고노이드' 바쿠간 트레이딩 카드를 무료로 획득할 수 있습니다.*",
    bakuganevent3:
      '첫 번째 바쿠간 트레이딩 카드 배부가 종료되었습니다. 올 10월에 공개될 다음 아이템을 기대해 주세요!',
    bakuganevent4: `구매 고객 선착순 10,000명에 한해 한정판 '제네시스 라스' 바쿠간 트레이딩 카드를 무료로 획득할 수 있습니다.*`,
    bakuganevent5: `바쿠간 트레이딩 카드 배부가 종료되었습니다. 앞으로도 계속 방문해 프로모션 및 증정 이벤트에 함께해 주세요!`,
    'special-event-footnote':
      '*본 증정 행사는 2022년 11월 21일 또는 재고 소진 시까지 13세 이상의 미국 거주자를 대상으로 합니다. 가상 아이템에 접근하고 이용하려면 Roblox 계정이 있어야 하며, 각 계정당 매월 2개의 가상 아이템만 획득할 수 있습니다. 구매자는 기프트 카드를 구매할 때 해당 옵션에서 트레이딩 카드를 받도록 선택해야 합니다. Roblox는 트레이딩 카드의 분실이나 도난에 대해 책임을 지지 않습니다. 이미지 ©2022 Roblox Corporation 및 © 2022 Spin Master Ltd. All rights reserved.',
    'maintitle-more-robux': 'Robux를 최대 25% <br> 더 획득하세요',
    'main-subtitle-more-robux':
      '기프트 카드 사용 시, 컴퓨터 및 웹사이트에서 더 많은 Robux를 획득하세요'
  },
  japanese: {
    location: '国/地域',
    redeem: 'カードを引き換える',
    'region-us': 'アメリカ',
    'region-ca': 'カナダ',
    'region-au': 'オーストラリア',
    'region-uk': 'イギリス',
    'region-fr': 'フランス',
    'region-de': 'ドイツ',
    'region-es': 'スペイン',
    'region-nz': 'ニュージーランド',
    'region-ie': 'アイルランド',
    'region-it': 'イタリア',
    'region-ch': 'スイス',
    'region-nl': 'オランダ',
    'region-be': 'ベルギー',
    'region-jp': '日本',
    'region-mx': 'メキシコ',
    'region-br': 'ブラジル',
    'region-at': 'オーストリア',
    'region-pt': 'ポルトガル',
    'region-pl': 'ポーランド',
    'region-za': '南アフリカ',
    'region-dk': 'デンマーク',
    'region-fi': 'フィンランド',
    'region-no': 'ノルウェー',
    'region-se': 'スウェーデン',
    'region-gr': 'ギリシャ',
    'region-lv': 'ラトビア',
    'region-my': 'マレーシア',
    'region-ro': 'ルーマニア',
    'region-sg': 'シンガポール',
    'region-th': 'タイ',
    'region-sk': 'スロバキア',
    'region-sl': 'スロベニア',
    'region-cy': '',
    'region-hu': '',
    'region-sa': 'サウジアラビア',
    'region-ae': 'アラブ首長国連邦',
    'region-ko': '韓国',
    copyright:
      '© 2026 Roblox Corporation. All Rights Reserved.<br>すべて著作権で保護されています。',
    terms: '規約',
    privacy: 'プライバシー',
    maintitle: 'Robloxをもっとお得に',
    mainbutton: 'ギフトカードを買う',
    'giftcards-desc':
      'Robloxギフトカードは、Robux または Premium のサブスクリプションに使えるプリペイド式のクレジットを追加するのに一番簡単な方法です。',
    'virtual-title': '無料バーチャルアイテム',
    'virtual-desc':
      'それぞれのギフトカードを引き換えるときに無料のバーチャルアイテムをもらえ、追加の限定バーチャルアイテムがもらえるボーナスコードもついてきます。',
    'virtual-desc-multi':
      'それぞれのギフトカードを引き換えるときに無料のバーチャルアイテムがもらえ、さらに追加で2つの限定バーチャルアイテムがもらえるボーナスコードがついてきます。',
    'item-included': 'バーチャルアイテムつき',
    'item-bonus': 'ボーナス：限定バーチャルアイテム',
    'virtual-footnote': '1つのアカウントにつき1ヶ月にアイテム一個、ボーナスアイテム一個まで。',
    //    "virtual-footnote": "1つのアカウントにつき、1ヶ月に使えるのはアイテム1個とボーナスアイテム1点限りとさせていただきます。画像版権：©2022 Roblox Corporation と © 2022 Spin Master Ltd. All rights reserved.",
    'cards-title': '今すぐ、Roblox ファンをサプライズ',
    'cards-desc':
      'お気に入りの体験やキャラクターなどがついた何十種類もあるeギフトカードの中から選べます。',
    retailers:
      'Roblox ギフトカードは、<a class="link-retailers">最寄りの小売店でもご利用できます。 </a>',
    'retailers-maintitle': 'Roblox（ロブロックス）ファンに<br>ピッタリのプレゼント',
    'digital-title': 'ネットショップで購入',
    'digital-desc': 'Robloxギフトカードは、<br>以下のネットショップでも購入できます。',
    'digital-footnote':
      'Amazonで購入したRobloxデジタル・ギフトカード（Eメールタイプ）は、Robux（ロバックス）には使えますが、<br>プレミアム会員のメンバーシップには使えませんのでご注意ください。',
    'in-store-title': '店舗で購入',
    'in-store-desc': 'Roblox ギフトカードは、以下をはじめとするお近くの実店舗で入手できます。 ',
    'free-item-desc':
      'それぞれのギフトカードを引き換えるときに、無料のバーチャルアイテムがもらえます。',
    'free-item-footnote':
      'アイテムは月ごとに変わりますが、内容は小売店により違います。アカウント一つにつきギフトカードからの無料アイテムは一ヶ月につき一個まで。',
    'exclusive-desc':
      'Robloxから直接ギフトカードを購入すると、<br>期間限定で追加の限定バーチャルアイテム用のボーナスコードがもらえます。',
    bakuganevent1:
      'Robloxの「爆丸バトルリーグ」体験で爆丸を10個全部アンロックして、オリジナルドラゴノイドのボーナスアイテムをゲットしよう。',
    bakuganevent2:
      'ご購入先着10,000様に限定「オリジナルドラゴノイド」の爆丸取引カードも無料でプレゼント。*',
    bakuganevent3:
      '第一回目の爆丸取引カードプレゼント企画は終了しました。次回の予定は10月なのでお楽しみにどうぞ。',
    bakuganevent4: `ご購入先着10,000様に限定「ジェネシスラス」の爆丸取引カードも無料でプレゼント。*`,
    bakuganevent5: `爆丸取引カードプレゼント企画は終了しました。今後もプロモーションやプレゼント企画をお楽しみにどうぞ。`,
    'special-event-footnote':
      '*この企画は、2022年11月21日まで13歳以上のアメリカ合衆国在住者か、在庫が続く間しかご利用できません。アクセスしてバーチャルアイテムを使うには、Robloxアカウントが必要です。1つのアカウントにつき1ヶ月にアイテム2点まで。ご購入される方は、ギフトカードのご購入時に取引カードを受け取る選択を必ずする必要があります。Robloxは、カードの紛失や盗難については責任を持ちかねます。画像版権 ©2022 Roblox Corporation および © 2022 Spin Master Ltd.  All rights reserved. 無断転載厳禁',
    'maintitle-more-robux': 'Robuxが<br>最大25％増',
    'main-subtitle-more-robux': 'ギフトカード、パソコン、ウェブサイト経由でRobuxが増量'
  },
  danish: {
    mainbutton: 'Køb gavekort',
    redeem: 'Indløs kort',
    copyright: '© 2026 Roblox Corporation. Alle rettigheder forbeholdes.',
    terms: 'Vilkår',
    privacy: 'Privatliv',
    location: 'Lokation',
    'region-us': 'USA',
    'region-ca': 'Canada',
    'region-au': 'Australien',
    'region-uk': 'UK',
    'region-fr': 'Frankrig',
    'region-de': 'Tyskland',
    'region-es': 'Spanien',
    'region-nz': 'New Zealand',
    'region-ie': 'Irland',
    'region-it': 'Italien',
    'region-ch': 'Schweiz',
    'region-nl': 'Nederlandene',
    'region-be': 'Belgien',
    'region-jp': 'Japan',
    'region-mx': 'Mexico',
    'region-br': 'Brasilien',
    'region-at': 'Østrig',
    'region-dk': 'Danmark',
    'region-fi': 'Finland',
    'region-no': 'Norge',
    'region-pt': 'Portugal',
    'region-se': 'Sverige',
    'region-gr': 'Grækenland',
    'region-lv': 'Letland',
    'region-pl': 'Polen',
    'region-ro': 'Rumænien',
    'region-my': 'Malaysia',
    'region-sg': 'Singapore',
    'region-th': 'Thailand',
    'region-za': 'Sydafrika',
    'region-sk': 'Slovakiet',
    'region-sl': 'Slovenien',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Sydkorea',
    maintitle: 'Få mere ud af Roblox',
    'giftcards-desc':
      'Roblox-gavekort er den letteste måde at tilføje kredit, som du kan bruge til Robux eller luksusabonnementer.',
    'virtual-title': 'Gratis virtuelle genstande',
    'virtual-desc':
      'Hvert gavekort tildeler en gratis virtuel genstand ved indløsning og kommer med en bonuskode, som giver en ekstra eksklusiv, virtuel genstand.',
    'virtual-desc-multi':
      'Hvert gavekort tildeler en gratis virtuel genstand ved indløsning og kommer med en bonuskode, som giver to ekstra eksklusive, virtuelle genstande.',
    'item-included': 'Virtuel genstand medfølger',
    'item-bonus': 'Eksklusiv virtuel bonusgenstand',
    'virtual-footnote': 'Begrænset til én genstand og én bonusgenstand per måned per konto.',
    'cards-title': 'Overrask en Roblox-fan i dag',
    'cards-desc':
      'Vælg mellem dusinvis af eGift-gavekort med motiver baseret på dine yndlingsoplevelser og -figurer og meget mere.',
    retailers:
      'Roblox-gavekort kan også <a class="link-retailers">fås hos en forhandler i nærheden.</a>',
    'retailers-maintitle': 'Den perfekte gave til enhver Roblox-fan',
    'digital-title': 'Køb online',
    'digital-desc': 'Find roblox-gavekort hos en af disse online forhandlere:',
    'digital-footnote':
      'Bemærk venligst, at digitale Roblox-gavekort, købt hos Amazon, kun tildeler Robux og ikke kan bruges på et luksusabonnement.',
    'in-store-title': 'Køb i butikken',
    'in-store-desc': 'Roblox-gavekort kan også fås hos en fysisk forhandler i nærheden, inklusive:',
    'free-item-desc': 'Hvert gavekort tildeler en gratis virtuel genstand ved indløsning.',
    'free-item-footnote':
      'Genstande udskiftes månedligt og afhænger af forhandleren. Begrænsning på én per gavekort per konto.',
    'exclusive-desc':
      'I en begrænset periode kan du få en bonuskode som en ekstra eksklusiv, virtuel genstand, når du køber et gavekort direkte fra Roblox.',
    'special-event-footnote': '',
    'maintitle-more-robux': 'Nyd op til <br> 25% flere Robux',
    'main-subtitle-more-robux': 'Få flere Robux med gavekort, og på computer og web'
  },
  dutch: {
    location: 'Locatie',
    redeem: 'Kaart verzilveren',
    'region-us': 'Verenigde Staten',
    'region-ca': 'Canada',
    'region-au': 'Australië',
    'region-uk': 'Verenigd Koninkrijk',
    'region-fr': 'Frankrijk',
    'region-de': 'Duitsland',
    'region-es': 'Spanje',
    'region-nz': 'Nieuw-Zeeland',
    'region-ie': 'Republiek Ierland',
    'region-it': 'Italië',
    'region-ch': 'Zwitserland',
    'region-nl': 'Nederland',
    'region-be': 'België',
    'region-jp': 'Japan',
    'region-mx': 'Mexico',
    'region-br': 'Brazilië',
    'region-at': 'Oostenrijk',
    'region-pt': 'Portugal',
    'region-pl': 'Polen',
    'region-za': 'Zuid-Afrika',
    'region-dk': 'Denemarken',
    'region-fi': 'Finland',
    'region-no': 'Noorwegen',
    'region-se': 'Zweden',
    'region-gr': 'Griekenland',
    'region-lv': 'Letland',
    'region-my': 'Maleisië',
    'region-ro': 'Roemenië',
    'region-sg': 'Singapore',
    'region-th': 'Thailand',
    'region-sk': 'Slowakije',
    'region-sl': 'Slovenië',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Zuid-Korea',
    copyright: '© 2026 Roblox Corporation. Alle rechten voorbehouden.',
    terms: 'Gebruiksvoorwaarden',
    privacy: 'Privacy',
    maintitle: 'Haal meer uit Roblox',
    mainbutton: 'Cadeaubonnen kopen',
    'giftcards-desc':
      'Roblox-cadeaubonnen zijn de makkelijkste manier om tegoed toe te voegen dat je kunt uitgeven aan Robux of een Premium-abonnement.',
    'virtual-title': 'Gratis virtuele items',
    'virtual-desc':
      'Je ontvangt een gratis virtueel item voor elke cadeaubon die je verzilvert en elke cadeaubon heeft een bonuscode voor een extra exclusief virtueel item.',
    'virtual-desc-multi':
      'Je ontvangt een gratis virtueel item voor elke cadeaubon die je verzilvert, en elke cadeaubon heeft een bonuscode voor twee extra exclusieve virtuele items.',
    'item-included': 'Virtueel item inbegrepen',
    'item-bonus': 'Bonus exclusief virtueel item',
    'virtual-footnote': 'Maximaal één item en één bonusitem per maand per account.',
    //    "virtual-footnote": "Maximaal één item en één bonusitem per maand per account. Afbeeldingen ©2022 Roblox Corporation en © 2022 Spin Master Ltd. Alle rechten voorbehouden.",
    'cards-title': 'Verras vandaag nog een Roblox-fan',
    'cards-desc':
      'Kies uit tientallen ontwerpen van eCadeaubonnen op basis van je favoriete ervaringen, personages en meer.',
    retailers:
      '<a class="link-retailers">Roblox-cadeaubonnen zijn ook verkrijgbaar in een winkel bij jou in de buurt.</a>',
    'retailers-maintitle': 'Het perfecte geschenk voor elke Roblox-fan',
    'digital-title': 'Online kopen',
    'digital-desc': 'Vind Roblox-cadeaubonnen in deze online winkels:',
    'digital-footnote':
      'Onthoud dat digitale cadeaubonnen van Roblox die gekocht zijn bij Amazon alleen Robux bieden en niet kunnen worden gebruikt voor een Premium-abonnement.',
    'in-store-title': 'In de winkel kopen',
    'in-store-desc':
      'Roblox-cadeaubonnen zijn verkrijgbaar in fysieke winkels bij jou in de buurt, waaronder:',
    'free-item-desc': 'Je ontvangt een gratis virtueel item voor elke cadeaubon die je verzilvert.',
    'free-item-footnote':
      'Items veranderen per maand en zijn afhankelijk van de winkel. Maximaal één cadeaubon per account.',
    'exclusive-desc':
      'Krijg tijdelijk een bonuscode voor een extra exclusief virtueel item wanneer je een cadeaubon rechtstreeks van Roblox koopt.',
    bakuganevent1:
      'Krijg het bonusitem Genesis Dragonoid en ontgrendel alle tien Bakugan in de Bakugan Battle League-ervaring op Roblox.',
    bakuganevent2: '',
    bakuganevent3:
      'Onze eerste weggeefactie van een Bakugan-ruilkaart is afgelopen. Blijf op de volgende letten die in oktober verschijnt.',
    bakuganevent4: ``,
    bakuganevent5: `Onze weggeefactie van een Bakugan-ruilkaart is afgelopen. Blijf in de nabije toekomst letten op andere acties en aanbiedingen.`,
    'special-event-footnote': '',
    'maintitle-more-robux': 'Geniet van tot <br> 25% meer Robux',
    'main-subtitle-more-robux': 'Krijg meer Robux met cadeaubonnen en op computer en web'
  },
  finnish: {
    mainbutton: 'Osta lahjakortteja',
    redeem: 'Lunasta kortti',
    copyright: '© 2026 Roblox Corporation. Kaikki oikeudet pidätetään.',
    terms: 'Ehdot',
    privacy: 'Tietosuoja',
    location: 'Sijainti',
    'region-us': 'USA',
    'region-ca': 'Kanada',
    'region-au': 'Australia',
    'region-uk': 'UK',
    'region-fr': 'Ranska',
    'region-de': 'Saksa',
    'region-es': 'Espanja',
    'region-nz': 'Uusi-Seelanti',
    'region-ie': 'Irlanti',
    'region-it': 'Italia',
    'region-ch': 'Sveitsi',
    'region-nl': 'Alankomaat',
    'region-be': 'Belgia',
    'region-jp': 'Japani',
    'region-mx': 'Meksiko',
    'region-br': 'Brasilia',
    'region-at': 'Itävalta',
    'region-dk': 'Tanska',
    'region-fi': 'Suomi',
    'region-no': 'Norja',
    'region-pt': 'Portugali',
    'region-se': 'Ruotsi',
    'region-gr': 'Kreikka',
    'region-lv': 'Latvia',
    'region-pl': 'Puola',
    'region-ro': 'Romania',
    'region-my': 'Malesia',
    'region-sg': 'Singapore',
    'region-th': 'Thaimaa',
    'region-za': 'Etelä-Afrikka',
    'region-sk': 'Slovakia',
    'region-sl': 'Slovenia',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Etelä-Korea',
    maintitle: 'Ota enemmän irti Robloxista',
    'giftcards-desc':
      'Roblox-lahjakortit ovat helpoin tapa lisätä krediittejä Robuxeja tai premium-tilausta varten.',
    'virtual-title': 'Maksuttomat virtuaaliesineet',
    'virtual-desc':
      'Kullakin lahjakortilla saa sen lunastamisen yhteydessä virtuaaliesineen maksutta sekä bonuskoodin, jolla saa rajoitetun lisävirtuaaliesineen.',
    'virtual-desc-multi':
      'Kullakin lahjakortilla saa sen lunastamisen yhteydessä virtuaaliesineen maksutta ja bonuskoodin, jolla saa lisäksi kaksi rajoitettua virtuaaliesinettä.',
    'item-included': 'Mukana virtuaaliesine',
    'item-bonus': 'Rajoitettu virtuaaliesine bonuksena',
    'virtual-footnote':
      'Kullekin tilille voi lunastaa enintään yhden esineen ja yhden bonusesineen kuukaudessa.',
    'cards-title': 'Yllätä Robloxin ystävä',
    'cards-desc':
      'Valitse kymmenistä eGift-korttidesigneista, jotka pohjautuvat esimerkiksi suosikkipeleihisi tai -hahmoihisi.',
    retailers:
      'Roblox-lahjakortteja <a class="link-retailers">myydään myös jälleenmyyjäliikkeissä.</a>',
    'retailers-maintitle': 'Täydellinen lahja Robloxin ystävälle',
    'digital-title': 'Osta verkosta',
    'digital-desc': 'Seuraavat verkkoliikkeet myyvät Roblox-lahjakortteja:',
    'digital-footnote':
      'Huomaa, että Amazonilta ostetuilla Roblox-lahjakorteilla saa vain robuxeja. Niillä ei voi lunastaa premium-tilausta.',
    'in-store-title': 'Osta kaupasta',
    'in-store-desc':
      'Roblox-lahjakortteja myydään myös fyysisissä jälleenmyyjäliikkeissä, kuten seuraavissa:',
    'free-item-desc':
      'Kullakin lahjakortilla saa sen lunastamisen yhteydessä maksuttoman virtuaaliesineen.',
    'free-item-footnote':
      'Esineet vaihtuvat kuukausittain ja vaihtelevat jälleenmyyjän mukaan. Rajoituksena yksi lahjakorttilunastus tiliä kohti.',
    'exclusive-desc':
      'Rajoitetun ajan etuna saat lahjakortin suoraan Robloxilta ostaessasi bonuskoodin, jolla saat rajoitetun lisävirtuaaliesineen.',
    'special-event-footnote': '',
    'maintitle-more-robux': 'Nauti jopa <br> 25% enemmän Robux',
    'main-subtitle-more-robux': 'Hanki lisää Robuxia lahjakorteilla, ja tietokoneella ja webissä'
  },
  italian: {
    location: 'Paese',
    redeem: 'Attiva la carta',
    'region-us': 'USA',
    'region-ca': 'Canada',
    'region-au': 'Australia',
    'region-uk': 'UK',
    'region-fr': 'Francia',
    'region-de': 'Germania',
    'region-es': 'Spagna',
    'region-nz': 'Nuova Zelanda',
    'region-ie': "Repubblica d'Irlanda",
    'region-it': 'Italia',
    'region-ch': 'Svizzera',
    'region-nl': 'Olanda',
    'region-be': 'Belgio',
    'region-jp': 'Giappone',
    'region-mx': 'Messico',
    'region-br': 'Brasile',
    'region-at': 'Austria',
    'region-pt': 'Portogallo',
    'region-pl': 'Polonia',
    'region-za': 'Sud Africa',
    'region-dk': 'Danimarca',
    'region-fi': 'Finlandia',
    'region-no': 'Norvegia',
    'region-se': 'Svezia',
    'region-gr': 'Grecia',
    'region-lv': 'Lettonia',
    'region-my': 'Malaysia',
    'region-ro': 'Romania',
    'region-sg': 'Singapore',
    'region-th': 'Tailandia',
    'region-sk': 'Slovacchia',
    'region-sl': 'Slovenia',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Corea del Sud',
    copyright: '',
    terms: 'Termini',
    privacy: 'Privacy',
    maintitle: 'Ottieni di più da Roblox',
    mainbutton: 'Acquista Carte Regalo',
    'giftcards-desc':
      'Le carte regalo Roblox sono il modo più semplice per aggiungere credito che puoi spendere verso Robux o un abbonamento Premium.',
    'virtual-title': 'Oggetti virtuali gratuiti',
    'virtual-desc':
      'Ogni carta regalo garantisce un oggetto virtuale gratuito al momento della riscossione e viene fornita con un codice bonus per un oggetto virtuale esclusivo aggiuntivo.',
    'virtual-desc-multi':
      'Ogni carta regalo garantisce un oggetto virtuale gratuito al momento del riscatto e viene fornita con un codice bonus per due oggetti virtuali esclusivi aggiuntivi.',
    'item-included': 'Oggetto virtuale incluso',
    'item-bonus': 'Bonus oggetto virtuale esclusivo',
    'virtual-footnote': 'Limita un articolo e un articolo bonus al mese per account.',
    //    "virtual-footnote": "Limite un articolo e un articolo bonus al mese per account. Images ©2022 Roblox Corporation e © 2022 Spin Master Ltd. Tutti i diritti riservati.",
    'cards-title': 'Sorprendi un fan di Roblox oggi',
    'cards-desc':
      'Scegli tra dozzine di design di carte eGift in base alle tue esperienze, personaggi  preferiti, e altro ancora',
    retailers:
      '<a class="link-retailers">Le carte regalo Roblox sono disponibili anche presso un rivenditore vicino a te.</a>',
    'retailers-maintitle': 'Il regalo perfetto per ogni fan di Roblox',
    'digital-title': 'Comprare online',
    'digital-desc':
      'Trova le carte regalo Roblox presso uno qualsiasi di questi rivenditori online:',
    'digital-footnote':
      'Tieni presente che le carte regalo digitali Roblox acquistate da Amazon garantiscono solo Robux e non possono essere utilizzate per un abbonamento Premium.',
    'in-store-title': 'Acquista in negozio',
    'in-store-desc':
      'Le carte regalo Roblox sono disponibili presso i negiozi rivenditori vicino a te, tra cui:',
    'free-item-desc':
      'Ogni carta regalo garantisce un oggetto virtuale gratuito al momento della riscossione.',
    'free-item-footnote':
      'Gli articoli cambiano su base mensile e dipendono dal rivenditore. Limita uno per carta regalo per account.',
    'exclusive-desc':
      'Per un periodo di tempo limitato, ottieni un codice bonus per un oggetto virtuale esclusivo aggiuntivo quando acquisti una carta regalo direttamente da Roblox.',
    bakuganevent1:
      "Ottieni l'oggetto bonus Genesis Dragonoid e sblocca tutti e dieci i Bakugan nell'esperienza Bakugan Battle League su Roblox.",
    bakuganevent2:
      'I primi 10.000 clienti possono anche ricevere gratuitamente una carta collezionabile Bakugan "Genesis Dragonoid" in edizione limitata con l\'acquisto.*',
    bakuganevent3:
      'Il nostro primo giveaway di carte collezionabili Bakugan è terminato. Resta sintonizzato per il prossimo in arrivo questo ottobre!',
    bakuganevent4: `I primi 10.000 clienti possono anche ricevere gratuitamente una carta collezionabile Bakugan "Genesis Wrath" in edizione limitata con l'acquisto.*`,
    bakuganevent5: `Il nostro giveaway di carte collezionabili Bakugan è terminato. Si prega di ricontrollare in futuro per altre promozioni e offerte.`,
    'special-event-footnote': '',
    'maintitle-more-robux': 'Robux. Goditi fino al 25% in più',
    'main-subtitle-more-robux': 'Ottieni più Robux con le carte regalo, su computer e sul web'
  },
  norwegian_bokmal: {
    mainbutton: 'Handle gavekort',
    redeem: 'Løs inn kort',
    copyright: '© 2026 Roblox Corporation. Med enerett.',
    terms: 'Vilkår',
    privacy: 'Personvern',
    location: 'Sted',
    'region-us': 'USA',
    'region-ca': 'Canada',
    'region-au': 'Australia',
    'region-uk': 'Storbritannia',
    'region-fr': 'Frankrike',
    'region-de': 'Tyskland',
    'region-es': 'Spania',
    'region-nz': 'New Zealand',
    'region-ie': 'Irland',
    'region-it': 'Italia',
    'region-ch': 'Sveits',
    'region-nl': 'Nederland',
    'region-be': 'Belgia',
    'region-jp': 'Japan',
    'region-mx': 'Mexico',
    'region-br': 'Brasil',
    'region-at': 'Østerrike',
    'region-dk': 'Danmark',
    'region-fi': 'Finland',
    'region-no': 'Norge',
    'region-pt': 'Portugal',
    'region-se': 'Sverige',
    'region-gr': 'Hellas',
    'region-lv': 'Latvia',
    'region-pl': 'Polen',
    'region-ro': 'Romania',
    'region-my': 'Malaysia',
    'region-sg': 'Singapore',
    'region-th': 'Thailand',
    'region-za': 'Sør-Afrika',
    'region-sk': 'Slovakia',
    'region-sl': 'Slovenia',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Sør-Korea',
    maintitle: 'Få mer ut av Roblox',
    'giftcards-desc':
      'Roblox-gavekort er en enkel metode for å legge til kreditt du kan bruke på Robux eller et premiumabonnement.',
    'virtual-title': 'Gratis virtuelt innhold',
    'virtual-desc':
      'Hvert gavekort gir deg en gratis virtuell gjenstand når du løser det inn og leveres med en bonuskode du kan bruke til å låse opp én eksklusiv virtuell gjenstand til.',
    'virtual-desc-multi':
      'Hvert gavekort gir deg en gratis virtuell gjenstand når du løser det inn og leveres med en bonuskode du kan bruke til å låse opp to eksklusive virtuelle gjenstander til.',
    'item-included': 'Inneholder en virtuell gjenstand',
    'item-bonus': 'Eksklusiv virtuell gjenstand som bonus',
    'virtual-footnote': 'Kun én gjenstand og ett bonuselement per måned per konto.',
    'cards-title': 'Overrask en Roblox-fan i dag',
    'cards-desc':
      'Velg mellom flere titalls e-gavekortdesign basert på spillene og figurene du liker best med mer.',
    retailers:
      'Roblox-gavekort er også <a class="link-retailers">tilgjengelig fra en forhandler der du bor.</a>',
    'retailers-maintitle': 'En perfekt gave til alle Roblox-fans',
    'digital-title': 'Kjøp på nett',
    'digital-desc': 'Du kan kjøpe Roblox-gavekort hos disse forhandlerne:',
    'digital-footnote':
      'Merk at digitale Roblox-gavekort kjøpt fra Amazon bare gir deg Robux. De kan ikke brukes til å kjøpe et premiumabonnement.',
    'in-store-title': 'Kjøp i butikk',
    'in-store-desc': 'Roblox-gavekort er tilgjengelig fra disse fysiske forhandlerne der du bor:',
    'free-item-desc': 'Hvert gavekort gir en gratis virtuell gjenstand ved innløsing.',
    'free-item-footnote':
      'Innholdet endres på månedlig basis og avhenger av hvilken forhandler du bruker. Kun ett gavekort per konto.',
    'exclusive-desc':
      'En begrenset periode får du en bonuskode du kan bruke til å låse opp en eksklusiv virtuell gjenstand ekstra når du kjøper gavekort direkte fra Roblox.',
    'special-event-footnote': '',
    'maintitle-more-robux': 'Nyt opptil <br> 25 % mer Robux',
    'main-subtitle-more-robux': 'Få flere Robux med gavekort, og på datamaskin og nett'
  },
  swedish: {
    mainbutton: 'Köp presentkort',
    redeem: 'Lös in kort',
    copyright: '© 2026 Roblox Corporation. Med ensamrätt.',
    terms: 'Villkor',
    privacy: 'Integritet',
    location: 'Plats',
    'region-us': 'USA',
    'region-ca': 'Kanada',
    'region-au': 'Australien',
    'region-uk': 'Storbritannien',
    'region-fr': 'Frankrike',
    'region-de': 'Tyskland',
    'region-es': 'Spanien',
    'region-nz': 'Nya Zeeland',
    'region-ie': 'Irland',
    'region-it': 'Italien',
    'region-ch': 'Schweiz',
    'region-nl': 'Nederländerna',
    'region-be': 'Belgien',
    'region-jp': 'Japan',
    'region-mx': 'Mexiko',
    'region-br': 'Brasilien',
    'region-at': 'Österrike',
    'region-dk': 'Danmark',
    'region-fi': 'Finland',
    'region-no': 'Norge',
    'region-pt': 'Portugal',
    'region-se': 'Sverige',
    'region-gr': 'Grekland',
    'region-lv': 'Lettland',
    'region-pl': 'Polen',
    'region-ro': 'Rumänien',
    'region-my': 'Malaysia',
    'region-sg': 'Singapore',
    'region-th': 'Thailand',
    'region-za': 'Sydafrika',
    'region-sk': 'Slovakien',
    'region-sl': 'Slovenien',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Sydkorea',
    maintitle: 'Få ut mer av Roblox',
    'giftcards-desc':
      'Roblox-presentkort är det enklaste sättet att få krediter till Robux eller en Premium-prenumeration.',
    'virtual-title': 'Kostnadsfria virtuella föremål',
    'virtual-desc':
      'Varje presentkort ger ett kostnadsfritt virtuellt föremål och en bonuskod för ytterligare ett exklusivt föremål vid inlösen.',
    'virtual-desc-multi':
      'Varje presentkort ger ett kostnadsfritt virtuellt föremål och en bonuskod för ytterligare två exklusiva föremål vid inlösen.',
    'item-included': 'Virtuellt föremål ingår',
    'item-bonus': 'Exklusivt virtuellt föremål som bonus',
    'virtual-footnote': 'Endast ett föremål och ett exklusivt föremål per konto varje månad.',
    'cards-title': 'Överraska ett Roblox-fan idag',
    'cards-desc':
      'Välj bland dussintals eGift-kortdesigner baserade på dina favoritspel, karaktärer och mer därtill.',
    retailers:
      'Roblox-presentkort kan även <a class="link-retailers">köpas från en återförsäljare nära dig.</a>',
    'retailers-maintitle': 'Den perfekta presenten för alla Roblox-fans',
    'digital-title': 'Köp online',
    'digital-desc': 'Hitta Roblox-presentkort hos någon av följande butiker online:',
    'digital-footnote':
      'Obs! Amazons digitala Roblox-presentkort endast ger Robux och kan inte användas till en Premium-prenumeration.',
    'in-store-title': 'Köp i butik',
    'in-store-desc': 'Roblox-presentkort kan även köpas från en återförsäljare nära dig:',
    'free-item-desc': 'Varje presentkort ger ett kostnadsfritt föremål vid inlösen.',
    'free-item-footnote':
      'Föremålen byts ut månadsvis och beror på återförsäljaren. Endast ett föremål per konto och månad.',
    'exclusive-desc':
      'Under begränsad tid får du en bonuskod för ett exklusivt virtuellt föremål när du köper ett presentkort direkt från Roblox.',
    'special-event-footnote': '',
    'maintitle-more-robux': 'Njut av upp till <br> 25% mer Robux',
    'main-subtitle-more-robux': 'Få mer Robux med presentkort, och på dator och webb'
  },
  polish: {
    location: 'Lokalizacja',
    redeem: 'Wykorzystaj kartę',
    copyright: '© 2026 Roblox Corporation. Wszelkie prawa zastrzeżone.',
    terms: 'Warunki',
    privacy: 'Prywatność',
    'region-us': 'Stany Zjednoczone',
    'region-ca': 'Kanada',
    'region-au': 'Australia',
    'region-uk': 'Wielka Brytania',
    'region-fr': 'Francja',
    'region-de': 'Niemcy',
    'region-es': 'Hiszpania',
    'region-nz': 'Nowa Zelandia',
    'region-ie': 'Irlandia',
    'region-it': 'Włochy',
    'region-ch': 'Szwajcaria',
    'region-nl': 'Holandia',
    'region-be': 'Belgia',
    'region-jp': 'Japonia',
    'region-mx': 'Meksyk',
    'region-br': 'Brazylia',
    'region-at': 'Austria',
    'region-pt': 'Portugalia',
    'region-pl': 'Polska',
    'region-za': 'Republika Południowej Afryki',
    'region-dk': 'Dania',
    'region-fi': 'Finlandia',
    'region-no': 'Norwegia',
    'region-se': 'Szwecja',
    'region-gr': 'Grecja',
    'region-lv': 'Łotwa',
    'region-my': 'Malezja',
    'region-ro': 'Rumunia',
    'region-sg': 'Singapur',
    'region-th': 'Tajlandia',
    'region-sk': 'Słowacja',
    'region-sl': 'Słowenia',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Korea Południowa',
    maintitle: 'Więcej korzyści z Roblox',
    mainbutton: 'Karty podarunkowe ze sklepu',
    'giftcards-desc':
      'Karty podarunkowe Roblox to najłatwiejszy sposób na dodanie środków, które możesz wydać na Robuxy lub subskrypcję Premium.',
    'virtual-title': 'Darmowe wirtualne przedmioty',
    'virtual-desc':
      'Wykorzystując dowolną kartę podarunkową, otrzymasz darmowy wirtualny przedmiot wraz z dodatkowym kodem na kolejny wyjątkowy wirtualny przedmiot.',
    'virtual-desc-multi':
      'Wykorzystując dowolną kartę podarunkową, otrzymasz darmowy wirtualny przedmiot wraz z dodatkowym kodem na dwa kolejne wyjątkowe wirtualne przedmioty.',
    'item-included': 'Zawiera wirtualny przedmiot',
    'item-bonus': 'Dodatkowy, wyjątkowy wirtualny przedmiot',
    'virtual-footnote':
      'Limit wynosi jeden przedmiot i jeden dodatkowy przedmiot miesięcznie na konto.',
    'cards-title': 'Zaskocz fana serwisu Roblox już dziś',
    'cards-desc':
      'Wybieraj spośród dziesiątków projektów elektronicznych kart podarunkowych na podstawie ulubionych doświadczeń, postaci i innych.',
    retailers:
      'Karty podarunkowe Roblox są także <a class="link-retailers">sprzedawane w pobliżu Ciebie.</a>',
    'retailers-maintitle': 'To idealny prezent dla fana serwisu Roblox',
    'digital-title': 'Kup online',
    'digital-desc': 'Znajdź karty podarunkowe Roblox u jednego z poniższych sprzedawców online:',
    'digital-footnote':
      'Należy pamiętać, że cyfrowe karty podarunkowe Roblox kupione na Amazon zapewniają wyłącznie Robuxy i nie mogą być używane w celu zamówienia subskrypcji Premium.',
    'in-store-title': 'Kup w sklepie',
    'in-store-desc':
      'Karty podarunkowe Roblox są dostępne w pobliżu Ciebie u stacjonarnych sprzedawców, takich jak:',
    'free-item-desc': 'Wykorzystując dowolną kartę podarunkową, otrzymasz wirtualny przedmiot.',
    'free-item-footnote':
      'Przedmioty zmieniają się co miesiąc i zależą od sprzedawcy. Obowiązuje limit jednej karty podarunkowej na jedno konto.',
    'exclusive-desc':
      'Po zakupie karty podarunkowej bezpośrednio w serwisie Roblox przez limitowany czas możesz zdobyć dodatkowy kod na kolejny wyjątkowy wirtualny przedmiot.',
    'special-event-footnote': '',
    'maintitle-more-robux': 'Ciesz się do <br> 25% więcej Robuxów',
    'main-subtitle-more-robux':
      'Zdobądź więcej Robuxów dzięki kartom podarunkowym, na komputerze i w sieci'
  },
  greek: {
    mainbutton: 'Κατάστημα τώρα',
    redeem: 'Εξαργύρωση κάρτας',
    copyright: '© 2026 Roblox Corporation. Με την επιφύλαξη κάθε δικαιώματος.',
    terms: 'Όροι',
    privacy: 'Απόρρητο',
    location: 'Τοποθεσία',
    'region-us': 'ΗΠΑ',
    'region-ca': 'Καναδάς',
    'region-au': 'Αυστραλία',
    'region-uk': 'ΗΒ',
    'region-fr': 'Γαλλία',
    'region-de': 'Γερμανία',
    'region-es': 'Ισπανία',
    'region-nz': 'Νέα Ζηλανδία',
    'region-ie': 'Ιρλανδία',
    'region-it': 'Ιταλία',
    'region-ch': 'Ελβετία',
    'region-nl': 'Κάτω Χώρες',
    'region-be': 'Βέλγιο',
    'region-jp': 'Ιαπωνία',
    'region-mx': 'Μεξικό',
    'region-br': 'Βραζιλία',
    'region-at': 'Αυστρία',
    'region-dk': 'Δανία',
    'region-fi': 'Φινλανδία',
    'region-no': 'Νορβηγία',
    'region-pt': 'Πορτογαλία',
    'region-se': 'Σουηδία',
    'region-gr': 'Ελλάδα',
    'region-lv': 'Λετονία',
    'region-pl': 'Πολωνία',
    'region-ro': 'Ρουμανία',
    'region-my': 'Μαλαισία',
    'region-sg': 'Σιγκαπούρη',
    'region-th': 'Ταϊλάνδη',
    'region-za': 'Νότια Αφρική',
    'region-sk': 'Σλοβακία',
    'region-sl': 'Σλοβενία',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Νότια Κορέα',
    maintitle: 'Αξιοποιήστε περισσότερο το Roblox',
    'giftcards-desc':
      'Οι δωροκάρτες του Roblox είναι ο ευκολότερος τρόπος να προσθέσετε πίστωση, την οποία μπορείτε να ξοδέψετε για Robux ή μια συνδρομή Premium.',
    'virtual-title': 'Δωρεάν εικονικά προϊόντα',
    'virtual-desc':
      'Κάθε δωροκάρτα παρέχει ένα δωρεάν εικονικό προϊόν κατά την εξαργύρωση και διαθέτει έναν κωδικό μπόνους για ένα επιπλέον αποκλειστικό εικονικό προϊόν.',
    'virtual-desc-multi':
      'Κάθε δωροκάρτα παρέχει ένα δωρεάν εικονικό προϊόν κατά την εξαργύρωση και διαθέτει έναν κωδικό μπόνους για δύο επιπλέον αποκλειστικά εικονικά προϊόντα.',
    'item-included': 'Περιλαμβάνεται εικονικό προϊόν',
    'item-bonus': 'Μπόνους αποκλειστικό εικονικό προϊόν',
    'virtual-footnote': 'Όριο ενός προϊόντος κι ενός προϊόντος μπόνους ανά μήνα ανά λογαριασμό.',
    'cards-title': 'Κάντε έκπληξη σε έναν φίλο του Roblox σήμερα',
    'cards-desc':
      'Επιλέξτε ανάμεσα σε δεκάδες σχέδια ηλεκτρονικών δωροκαρτών ανάλογα με τις αγαπημένες σας εμπειρίες, χαρακτήρες και πολλά άλλα.',
    retailers:
      'Οι δωροκάρτες Roblox είναι επίσης <a class="link-retailers">διαθέσιμες σε καταστήματα κοντά σας.</a>',
    'retailers-maintitle': 'Το τέλειο δώρο για κάθε φανατικό φίλο του Roblox.',
    'digital-title': 'Αγορά στο διαδίκτυο',
    'digital-desc': 'Θα βρείτε δωροκάρτες Roblox σε αυτά τα καταστήματα:',
    'digital-footnote':
      'Έχετε υπόψη ότι οι ψηφιακές δωροκάρτες Roblox που αγοράζονται από την Amazon παρέχουν μόνο Robux και δεν μπορούν να χρησιμοποιηθούν για μια συνδρομή Premium.',
    'in-store-title': 'Αγορά σε κατάστημα',
    'in-store-desc': 'Οι δωροκάρτες Roblox είναι διαθέσιμες σε καταστήματα κοντά σας, όπως τα:',
    'free-item-desc': 'Κάθε δωροκάρτα παρέχει ένα δωρεάν εικονικό προϊόν κατά την εξαργύρωση.',
    'free-item-footnote':
      'Τα προϊόντα αλλάζουν κάθε μήνα και εξαρτώνται από τον πωλητή. Το όριο είναι ένα ανά δωροκάρτα ανά λογαριασμό.',
    'exclusive-desc':
      'Για περιορισμένο χρονικό διάστημα λαμβάνετε έναν κωδικό μπόνους για ένα επιπλέον αποκλειστικό εικονικό προϊόν, όταν αγοράζετε μια δωροκάρτα απευθείας από το Roblox.',
    'special-event-footnote': '',
    'maintitle-more-robux': 'Απολαύστε έως και <br> 25% περισσότερα Robux',
    'main-subtitle-more-robux':
      'Αποκτήστε περισσότερα Robux με δωροκάρτες και σε υπολογιστή και web'
  },
  latvian: {
    mainbutton: 'Veikala dāvanu kartes',
    redeem: 'Izmantot karti',
    copyright: '© 2026 Roblox Corporation. Visas tiesības ir aizsargātas.',
    terms: 'Nosacījumi',
    privacy: 'Privātums',
    location: 'Atrašanās vieta',
    'region-us': 'ASV',
    'region-ca': 'Kanāda',
    'region-au': 'Austrālija',
    'region-uk': 'Apvienotā Karaliste',
    'region-fr': 'Francija',
    'region-de': 'Vācija',
    'region-es': 'Spānija',
    'region-nz': 'Jaunzēlande',
    'region-ie': 'Īrijas Republika',
    'region-it': 'Itālija',
    'region-ch': 'Šveice',
    'region-nl': 'Nīderlande',
    'region-be': 'Beļģija',
    'region-jp': 'Japāna',
    'region-mx': 'Meksika',
    'region-br': 'Brazīlija',
    'region-at': 'Austrija',
    'region-dk': 'Dānija',
    'region-fi': 'Somija',
    'region-no': 'Norvēģija',
    'region-pt': 'Portugāle',
    'region-se': 'Zviedrija',
    'region-gr': 'Grieķija',
    'region-lv': 'Latvija',
    'region-pl': 'Polija',
    'region-ro': 'Rumānija',
    'region-my': 'Malaizija',
    'region-sg': 'Singapūra',
    'region-th': 'Taizeme',
    'region-za': 'Dienvidāfrika',
    'region-sk': 'Slovākija',
    'region-sl': 'Slovēnija',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Dienvidkoreja',
    maintitle: 'Iegūt vairāk no Roblox',
    'giftcards-desc':
      'Roblox dāvanu kartes ir vienkāršākais veids, kā pievienot kredītu, kuru varat izmantot Robux vai Premium abonementa iegādei.',
    'virtual-title': 'Bezmaksas virtuālie produkti',
    'virtual-desc':
      'Katra dāvanu karte pēc tās izmantošanas ļauj iegādāties bezmaksas virtuālo produktu, un tai ir pievienots bonusa kods papildu ekskluzīvajam virtuālajam produktam.',
    'virtual-desc-multi':
      'Ierobežota laika ietvaros saņemiet bonusa kodu papildu ekskluzīvajam virtuālajam produktam, ja iegādājaties dāvanu karti tieši no Roblox.',
    'item-included': 'Iekļautie virtuālie produkti',
    'item-bonus': 'Bonusa ekskluzīvie virtuālie produkti',
    'virtual-footnote':
      'Ierobežota iegāde — viens produkts un viens bonusa produkts mēnesī vienam kontam.',
    'cards-title': 'Pārsteidziet Roblox fanu jau šodien',
    'cards-desc':
      'Izvēlieties no vairākiem dučiem eGift karšu dizainu, kas attēlo jūsu mīļākos piedzīvojumus, personāžus un citus tēlus.',
    retailers:
      'Roblox dāvanu kartes ir <a class="link-retailers">pieejamas arī jūsu tuvākajā veikalā.</a>',
    'retailers-maintitle': 'Lieliska dāvana ikvienam Roblox fanam',
    'digital-title': 'Iegāde tiešsaistes veikalā',
    'digital-desc': 'Roblox dāvanu kartes ir pieejamas jebkurā no šiem tiešsaistes veikaliem:',
    'digital-footnote':
      'Lūdzu, ņemiet vērā, ka Roblox digitālās dāvanu kartes, kuras ir iegādātas Amazon veikalā, dod iespēju iegādāties bezmaksas tikai Robux, un tās nevar izmantot Premium abonementa iegādei.',
    'in-store-title': 'Iegāde veikalā',
    'in-store-desc':
      'Roblox dāvanu kartes ir pieejamas arī jūsu tuvākajā veikalā ar sekojošiem nosacījumiem:',
    'free-item-desc':
      'Katra izmantotā dāvanu karte dod iespēju iegādāties bezmaksas virtuālo produktu.',
    'free-item-footnote':
      'Preces mainās katru mēnesi un ir atkarīgas no mazumtirgotāja noteikumiem. Ierobežojums — viena prece vienai dāvanu kartei un vienam kontam.',
    'exclusive-desc':
      'Ierobežota laika ietvaros saņemiet bonusa kodu papildu ekskluzīvajam virtuālajam produktam, ja iegādājaties dāvanu karti tieši no Roblox.',
    'special-event-footnote': '',
    'maintitle-more-robux': 'Izbaudiet līdz pat <br>par 25% vairāk Robux',
    'main-subtitle-more-robux': 'Iegūstiet vairāk Robux ar dāvanu kartēm un datorā un tīmeklī'
  },
  malay: {
    mainbutton: 'Beli kad hadiah',
    redeem: 'Kad Tebusan',
    copyright: '© 2026 Roblox Corporation. Hak Cipta Terpelihara.',
    terms: 'Terma',
    privacy: 'Privasi',
    location: 'Lokasi',
    'region-us': 'AS',
    'region-ca': 'Kanada',
    'region-au': 'Australia',
    'region-uk': 'UK',
    'region-fr': 'Perancis',
    'region-de': 'Jerman',
    'region-es': 'Sepanyol',
    'region-nz': 'New Zealand',
    'region-ie': 'Republik Ireland',
    'region-it': 'Itali',
    'region-ch': 'Switzerland',
    'region-nl': 'Belanda',
    'region-be': 'Belgium',
    'region-jp': 'Jepun',
    'region-mx': 'Mexico',
    'region-br': 'Brazil',
    'region-at': 'Austria',
    'region-dk': 'Denmark',
    'region-fi': 'Finland',
    'region-no': 'Norway',
    'region-pt': 'Portugal',
    'region-se': 'Sweden',
    'region-gr': 'Greece',
    'region-lv': 'Latvia',
    'region-pl': 'Poland',
    'region-ro': 'Romania',
    'region-my': 'Malaysia',
    'region-sg': 'Singapura',
    'region-th': 'Thailand',
    'region-za': 'Afrika Selatan',
    'region-sk': 'Slovakia',
    'region-sl': 'Slovenia',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Korea Selatan',
    maintitle: 'Dapatkan lagi daripada Roblox',
    'giftcards-desc':
      'Kad Hadiah Roblox adalah cara termudah untuk menambah kredit yang boleh anda belanjakan pada langganan Robux atau Premium.',
    'virtual-title': 'Item Maya Percuma',
    'virtual-desc':
      'Setiap kad hadiah memberi item maya percuma semasa penebusan dan didatangkan bersama kod bonus untuk item maya eksklusif tambahan.',
    'virtual-desc-multi':
      'Setiap kad hadiah memberi item maya percuma semasa penebusan dan didatangkan bersama kod bonus untuk dua item maya eksklusif tambahan.',
    'item-included': 'Item Maya Disertakan',
    'item-bonus': 'Item Maya Eksklusif Bonus',
    'virtual-footnote': 'Terhad kepada satu item dan satu bonus sebulan bagi setiap akaun.',
    'cards-title': 'Berikan kejutan kepada peminat Roblox hari ini',
    'cards-desc':
      'Pilih daripada berdozen-dozen rekaan kad eHadiah berdasarkan pengalaman, watak kegemaran anda, dan banyak lagi.',
    retailers:
      'Kad Hadiah Roblox juga <a class="link-retailers">boleh didapati pada peruncit berdekatan anda.</a>',
    'retailers-maintitle': 'Hadiah sempurna untuk mana-mana peminat Roblox',
    'digital-title': 'Belian Dalam Talian',
    'digital-desc': 'Dapatkan Kad Hadiah Roblox pada mana-mana peruncit dalam talian ini.',
    'digital-footnote':
      'Harap maklum bahawa Kad Hadiah Digital Roblox yang dibeli daripada Amazon hanya memberikan Robux dan tidak boleh digunakan pada langganan Premium.',
    'in-store-title': 'Belian di Gedung',
    'in-store-desc':
      'Kad Hadiah Roblox boleh didapati di peruncit fizikal berdekatan anda, termasuk:',
    'free-item-desc': 'Setiap kad hadiah memberi item maya semasa penebusan.',
    'free-item-footnote':
      'Item ditukar setiap bulanan dan bergantung pada peruncit. Terhad kepada satu item setiap kad bagi setiap akaun.',
    'exclusive-desc':
      'Untuk masa terhad, dapatkan kod bonus untuk item maya eksklusif tambahan apabila anda membeli kad hadiah terus daripada Roblox.',
    'special-event-footnote': '',
    'maintitle-more-robux': 'Nikmati hingga <br> 25% lebih banyak Robux',
    'main-subtitle-more-robux':
      'Dapatkan lebih banyak Robux dengan kad hadiah dan pada komputer serta web'
  },
  romanian: {
    mainbutton: 'Cumpără carduri cadou',
    redeem: 'Valorifică un card',
    copyright: '© 2026 Roblox Corporation. Toate drepturile rezervate.',
    terms: 'Termeni',
    privacy: 'Confidențialitate',
    location: 'Locație',
    'region-us': 'SUA',
    'region-ca': 'Canada',
    'region-au': 'Australia',
    'region-uk': 'Regatul Unit',
    'region-fr': 'Franța',
    'region-de': 'Germania',
    'region-es': 'Spania',
    'region-nz': 'Noua Zeelandă',
    'region-ie': 'Republica Irlanda',
    'region-it': 'Italia',
    'region-ch': 'Elveția',
    'region-nl': 'Țările de Jos',
    'region-be': 'Belgia',
    'region-jp': 'Japonia',
    'region-mx': 'Mexic',
    'region-br': 'Brazilia',
    'region-at': 'Austria',
    'region-dk': 'Danemarca',
    'region-fi': 'Finlanda',
    'region-no': 'Norvegia',
    'region-pt': 'Portugalia',
    'region-se': 'Suedia',
    'region-gr': 'Grecia',
    'region-lv': 'Letonia',
    'region-pl': 'Polonia',
    'region-ro': 'România',
    'region-my': 'Malaysia',
    'region-sg': 'Singapore',
    'region-th': 'Thailanda',
    'region-za': 'Africa de Sud',
    'region-sk': 'Slovacia',
    'region-sl': 'Slovenia',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Coreea de Sud',
    maintitle: 'Beneficiază mai mult de Roblox',
    'giftcards-desc':
      'Cardurile cadou Roblox sunt modalitatea cea mai simplă de a adăuga credit pe care îl poți folosi pentru monede Robux sau un abonament Premium.',
    'virtual-title': 'Articole virtuale gratuite',
    'virtual-desc':
      'Fiecare card cadou acordă un articol virtual gratuit la momentul valorificării și include un cod bonus pentru un articol virtual exclusiv suplimentar.',
    'virtual-desc-multi':
      'Fiecare card cadou acordă un articol virtual gratuit la momentul valorificării și include un cod bonus pentru două articole virtuale exclusive suplimentare.',
    'item-included': 'Articol virtual inclus',
    'item-bonus': 'Articol virtual exclusiv bonus',
    'virtual-footnote': 'Maximum un articol și un articol bonus pe lună per cont.',
    'cards-title': 'Fă o surpriză unui fan Roblox azi',
    'cards-desc':
      'Alege unul dintre zecile de modele de card cadou electronic în funcție de experiențele, personajele preferate și multe altele.',
    retailers:
      'Cardurile cadou Roblox sunt <a class="link-retailers">disponibile și la un comerciant din apropierea ta.</a>',
    'retailers-maintitle': 'Cadoul perfect pentru orice fan Roblox',
    'digital-title': 'Cumpără online',
    'digital-desc': 'Găsești cardurile cadou Roblox la oricare dintre acești comercianți online:',
    'digital-footnote':
      'Reține: cardurile cadou Roblox cumpărate de pe Amazon oferă doar monede Robux și nu pot fi utilizate pentru un abonament Premium.',
    'in-store-title': 'Cumpără în magazin',
    'in-store-desc':
      'Cardurile cadou Roblox sunt disponibile la comercianți fizici din apropierea ta, inclusiv:',
    'free-item-desc':
      'Fiecare card cadou acordă un articol virtual gratuit la momentul valorificării.',
    'free-item-footnote':
      'Articolele se modifică lunar și sunt în funcție de comerciant. Maximum un articol per card cadou per cont.',
    'exclusive-desc':
      'Pentru o perioadă limitată, obții un cod bonus pentru un articol virtual exclusiv suplimentar atunci când cumperi un card cadou direct din Roblox.',
    'special-event-footnote': '',
    'maintitle-more-robux': 'Bucură-te de până la <br> 25% mai multe Robux',
    'main-subtitle-more-robux': 'Obțineți mai multe Robux cu carduri cadou, și pe calculator și web'
  },
  thai: {
    mainbutton: 'ซื้อตอนนี้เลย',
    redeem: 'แลกใช้บัตร',
    copyright: '© 2026 Roblox Corporation. สงวนสิทธิ์ทุกประการ',
    terms: 'ข้อกำหนด',
    privacy: 'ความเป็นส่วนตัว',
    location: 'ประเทศ/ภูมิภาค',
    'region-us': 'สหรัฐอเมริกา',
    'region-ca': 'แคนาดา',
    'region-au': 'ออสเตรเลีย',
    'region-uk': 'สหราชอาณาจักร',
    'region-fr': 'ฝรั่งเศส',
    'region-de': 'เยอรมนี',
    'region-es': 'สเปน',
    'region-nz': 'นิวซีแลนด์',
    'region-ie': 'สาธารณรัฐไอร์แลนด์',
    'region-it': 'อิตาลี',
    'region-ch': 'สวิตเซอร์แลนด์',
    'region-nl': 'เนเธอร์แลนด์',
    'region-be': 'เบลเยียม',
    'region-jp': 'ญี่ปุ่น',
    'region-mx': 'เม็กซิโก',
    'region-br': 'บราซิล',
    'region-at': 'ออสเตรีย',
    'region-dk': 'เดนมาร์ก',
    'region-fi': 'ฟินแลนด์',
    'region-no': 'นอร์เวย์',
    'region-pt': 'โปรตุเกส',
    'region-se': 'สวีเดน',
    'region-gr': 'กรีซ',
    'region-lv': 'ลัตเวีย',
    'region-pl': 'โปแลนด์',
    'region-ro': 'โรมาเนีย',
    'region-my': 'มาเลเซีย',
    'region-sg': 'สิงคโปร์',
    'region-th': 'ไทย',
    'region-za': 'แอฟริกาใต้',
    'region-sk': 'สโลวาเกีย',
    'region-sl': 'สโลวีเนีย',
    'region-cy': '',
    'region-hu': '',
    'region-sa': 'ซาอุดีอาระเบีย',
    'region-ae': 'สหรัฐอาหรับเอมิเรตส์',
    'region-ko': 'เกาหลีใต้',
    maintitle: 'รับประโยชน์จาก Roblox เพิ่มมากขึ้น',
    'giftcards-desc':
      'บัตรของขวัญ Roblox เป็นวิธีที่ง่ายที่สุดในการเพิ่มเครดิตไปยังบัญชีของคุณ ซึ่งคุณสามารถนำเครดิตนี้ไปแลกเป็น Robux หรือสมัครสมาชิก Premium ได้',
    'virtual-title': 'รับฟรีไอเท็มเสมือน',
    'virtual-desc':
      'บัตรของขวัญแต่ละใบจะมอบไอเท็มเสมือนให้แก่คุณฟรีหนึ่งชิ้นเมื่อทำการแลกใช้ และรหัสโบนัสเพื่อแลกไอเท็มเสมือนสุดพิเศษเพิ่มเติมได้อีกหนึ่งชิ้น',
    'virtual-desc-multi':
      'บัตรของขวัญแต่ละใบจะมอบไอเท็มเสมือนให้แก่คุณฟรีหนึ่งชิ้นเมื่อทำการแลกใช้ และรหัสโบนัสเพื่อแลกไอเท็มเสมือนสุดพิเศษเพิ่มเติมได้อีกสองชิ้น',
    'item-included': 'พร้อมรับไอเท็มเสมือน',
    'item-bonus': 'รับโบนัสไอเท็มเสมือนสุดพิเศษ',
    'virtual-footnote':
      'แต่ละบัญชีสามารถรับไอเท็มและไอเท็มโบนัสได้อย่างละหนึ่งชิ้นต่อเดือนเท่านั้น',
    'cards-title': 'เซอร์ไพรส์สำหรับแฟนๆ Roblox',
    'cards-desc':
      'เลือกลายบัตรของขวัญอิเล็กทรอนิกส์ที่มีอยู่มากมายได้ตามประสบการณ์ ตัวละคร และอื่นๆ ที่คุณชื่นชอบได้แล้ววันนี้',
    retailers:
      'บัตรของขวัญ Roblox <a class="link-retailers">มีจำหน่ายแล้วที่ร้านค้าใกล้บ้านคุณ</a>',
    'retailers-maintitle': 'ของขวัญที่สมบูรณ์แบบ<br>สำหรับแฟนๆ Roblox',
    'digital-title': 'ซื้อออนไลน์',
    'digital-desc': 'ซื้อบัตรของขวัญ Roblox ได้ที่ร้านค้าปลีกออนไลน์เหล่านี้:',
    'digital-footnote':
      'โปรดทราบว่าบัตรของขวัญดิจิทัล Roblox ที่ซื้อจาก Amazon สามารถใช้แลก Robux ได้เท่านั้น โดยไม่สามารถใช้ในการสมัครสมาชิก Premium ได้',
    'in-store-title': 'ซื้อในร้านค้า',
    'in-store-desc': 'บัตรของขวัญ Roblox มีจำหน่ายแล้วที่ร้านค้าปลีกใกล้บ้านคุณ รวมถึง:',
    'free-item-desc': 'บัตรของขวัญแต่ละใบจะมอบไอเท็มเสมือนให้แก่คุณฟรีหนึ่งชิ้นเมื่อทำการแลกใช้',
    'free-item-footnote':
      'ไอเท็มจะถูกเปลี่ยนทุกเดือนและขึ้นอยู่กับร้านค้า โดยจำกัดจำนวนที่หนึ่งชิ้นต่อบัตรของขวัญต่อบัญชี',
    'exclusive-desc':
      'รับรหัสโบนัสเพื่อแลกไอเท็มเสมือนสุดพิเศษเพิ่มเติมอีกหนึ่งชิ้นเมื่อคุณซื้อบัตรของขวัญจาก Roblox โดยตรง ข้อเสนอมีระยะเวลาจำกัด ',
    'special-event-footnote': '',
    'maintitle-more-robux': 'รับ Robux <br> เพิ่มสูงสุด 25%',
    'main-subtitle-more-robux':
      'รับ Robux เพิ่มเมื่อซื้อบัตรของขวัญ หรือเมื่อซื้อ Robux บนคอมพิวเตอร์หรือผ่านเว็บ'
  },
  slovak: {
    mainbutton: 'Nakupovať darčekové karty',
    redeem: 'Uplatnenie karty',
    copyright: '© 2023 Roblox Corporation. Všetky práva vyhradené.',
    terms: 'Podmienky',
    privacy: 'Ochrana údajov',
    location: 'Lokalita',
    'region-us': 'USA',
    'region-ca': 'Kanada',
    'region-au': 'Austrália',
    'region-uk': 'Spojené kráľovstvo',
    'region-fr': 'Francúzsko',
    'region-de': 'Nemecko',
    'region-es': 'Španielsko',
    'region-nz': 'Nový Zéland',
    'region-ie': 'Írsko',
    'region-it': 'Taliansko',
    'region-ch': 'Švajčiarsko',
    'region-nl': 'Holandsko',
    'region-be': 'Belgicko',
    'region-jp': 'Japonsko',
    'region-mx': 'Mexiko',
    'region-br': 'Brazília',
    'region-at': 'Rakúsko',
    'region-dk': 'Dánsko',
    'region-fi': 'Fínsko',
    'region-no': 'Nórsko',
    'region-pt': 'Portugalsko',
    'region-se': 'Švédsko',
    'region-gr': 'Grécko',
    'region-lv': 'Lotyšsko',
    'region-pl': 'Poľsko',
    'region-ro': 'Rumunsko',
    'region-my': 'Malajzia',
    'region-sg': 'Singapur',
    'region-th': 'Thajsko',
    'region-za': 'Juhoafrická republika',
    'region-sk': 'Slovensko',
    'region-sl': 'Slovinsko',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Kórejská republika',
    maintitle: 'Získaj viac zo svojej platformy Roblox',
    'giftcards-desc':
      'Darčekové karty Roblox predstavujú ten najľahší spôsob pridania kreditov, ktoré môžeš míňať na Robux alebo predplatné Premium.',
    'virtual-title': 'Virtuálne predmety zdarma',
    'virtual-desc':
      'Každá darčeková karta poskytuje po uplatnení virtuálny predmet zdarma a obsahuje bonusový kód na ďalší exkluzívny virtuálny predmet.',
    'virtual-desc-multi':
      'Každá darčeková karta poskytuje po uplatnení virtuálny predmet zdarma a obsahuje bonusový kód na ďalšie dva exkluzívne virtuálne predmety.',
    'item-included': 'S virtuálnym predmetom',
    'item-bonus': 'Bonusový exkluzívny virtuálny predmet',
    'virtual-footnote':
      'Uplatňuje sa obmedzenie jedného predmetu a jedného bonusového predmetu mesačne na účet.',
    'cards-title': 'Prekvap fanúšika platformy Roblox ešte dnes',
    'cards-desc':
      'Vyber si z desiatok dizajnov elektronických darčekových kariet, ktoré sa zakladajú na tvojich obľúbených skúsenostiach, postavičkách a ďalších faktoroch.',
    retailers:
      'Darčekové karty Roblox <a class="link-retailers">nájdeš aj u predajcu vo svojom okolí.</a>',
    'retailers-maintitle': 'Dokonalý darček pre fanúšika platformy Roblox',
    'digital-title': 'Nákup online',
    'digital-desc': 'Nájdi darčekové karty Roblox u ktoréhokoľvek z týchto online predajcov:',
    'digital-footnote':
      'Nezabúdaj, že digitálne darčekové karty Roblox zakúpené v Amazone poskytujú len Robux a nedajú sa použiť v rámci predplatného Premium.',
    'in-store-title': 'Nákup v predajni',
    'in-store-desc': 'Darčekové karty Roblox nájdeš v kamenných obchodoch vo svojom okolí vrátane:',
    'free-item-desc': 'Každá darčeková karta poskytuje po uplatnení virtuálny predmet zdarma.',
    'free-item-footnote':
      'Predmety sa v jednotlivých mesiacoch menia a závisia od predajcu. Uplatňuje sa obmedzenie jednej darčekovej karty na účet.',
    'exclusive-desc':
      'Po zakúpení darčekovej karty priamo na platforme Roblox môžeš získať obmedzený čas aj bonusový kód na ďalší exkluzívny virtuálny predmet.',
    'special-event-footnote': '',
    'maintitle-more-robux': 'Užite si až <br> o 25% viac Robux',
    'main-subtitle-more-robux': 'Získajte viac Robuxov s darčekovými kartami a na počítači a webe'
  },
  slovene: {
    mainbutton: 'Kupite darilne kartice',
    redeem: 'Unovčite kartico',
    copyright: '© 2023 Roblox Corporation. Vse pravice pridržane.',
    terms: 'Pogoji',
    privacy: 'Zasebnost',
    location: 'Lokacija',
    'region-us': 'ZDA',
    'region-ca': 'Kanada',
    'region-au': 'Avstralija',
    'region-uk': 'Združeno kraljestvo',
    'region-fr': 'Francija',
    'region-de': 'Nemčija',
    'region-es': 'Španija',
    'region-nz': 'Nova Zelandija',
    'region-ie': 'Republika Irska',
    'region-it': 'Italija',
    'region-ch': 'Švica',
    'region-nl': 'Nizozemska',
    'region-be': 'Belgija',
    'region-jp': 'Japonska',
    'region-mx': 'Mehika',
    'region-br': 'Brazilija',
    'region-at': 'Avstrija',
    'region-dk': 'Danska',
    'region-fi': 'Finska',
    'region-no': 'Norveška',
    'region-pt': 'Portugalska',
    'region-se': 'Švedska',
    'region-gr': 'Grčija',
    'region-lv': 'Latvija',
    'region-pl': 'Poljska',
    'region-ro': 'Romunija',
    'region-my': 'Malezija',
    'region-sg': 'Singapur',
    'region-th': 'Tajska',
    'region-za': 'Južna Afrika',
    'region-sk': 'Slovaška',
    'region-sl': 'Slovenija',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Južna Koreja',
    maintitle: 'Dobite še več v platformi Roblox',
    'giftcards-desc':
      'Darilne kartice Roblox so najlažji način dodajanja dobroimetja, ki ga lahko porabite za Robux ali naročnino Premium.',
    'virtual-title': 'Brezplačni virtualni predmeti',
    'virtual-desc':
      'Vsaka darilna kartica ob unovčenju zagotavlja brezplačen virtualni predmet in vsebuje bonusno kodo za dodatni ekskluzivni virtualni predmet.',
    'virtual-desc-multi':
      'Vsaka darilna kartica ob unovčenju zagotavlja brezplačen virtualni predmet in vsebuje bonusno kodo za dva dodatna ekskluzivna virtualna predmeta.',
    'item-included': 'Vključen virtualni predmet',
    'item-bonus': 'Bonusni ekskluzivni virtualni predmet',
    'virtual-footnote': 'Omejite en predmet in en bonusni predmet na mesec na račun.',
    'cards-title': 'Presenetite ljubitelja platforme Roblox že danes',
    'cards-desc':
      'Izbirate lahko med več deset oblikami e-darilnih kartic, ki temeljijo na vaših najljubših izkušnjah, likih in drugem.',
    retailers:
      'Darilne kartice Roblox so na <a class="link-retailers">voljo tudi pri trgovcu v vaši bližini.</a>',
    'retailers-maintitle': 'Popolno darilo za vse ljubitelje platforme Roblox',
    'digital-title': 'Spletno nakupovanje',
    'digital-desc':
      'Darilne kartice Roblox poiščite pri katerem koli od naslednjih spletnih trgovcev:',
    'digital-footnote':
      'Upoštevajte, da digitalne darilne kartice Roblox, kupljene pri Amazonu, prinašajo samo Robuxe in jih ni mogoče uporabiti za naročnino Premium.',
    'in-store-title': 'Nakupovanje v trgovini',
    'in-store-desc':
      'Darilne kartice Roblox so na voljo tudi pri fizičnih trgovcih v vaši bližini, vključno z naslednjimi:',
    'free-item-desc': 'Vsaka darilna kartica ob unovčenju prinaša brezplačen virtualni predmet.',
    'free-item-footnote':
      'Predmeti se spreminjajo vsak mesec in so odvisni od trgovca. Omejitev je ena darilna kartica na račun.',
    'exclusive-desc':
      'Ob nakupu darilne kartice neposredno v platformi Roblox lahko za omejen čas prejmete bonusno kodo za dodaten ekskluziven virtualni predmet.',
    'special-event-footnote': '',
    'maintitle-more-robux': 'Uživajte do <br> 25% več Robux',
    'main-subtitle-more-robux':
      'Pridobite več Robuxa z darilnimi karticami ter na računalniku in spletu'
  },
  hungarian: {
    mainbutton: 'Vásárolj ajándékkártyákat',
    redeem: 'Kártya beváltása',
    copyright: '© 2023 Roblox Corporation. Minden jog fenntartva.',
    terms: 'Feltételek',
    privacy: 'Adatvédelem',
    location: 'Helyszín',
    'region-us': 'Egyesült Államok',
    'region-ca': 'Kanada',
    'region-au': 'Ausztrália',
    'region-uk': 'Egyesült Királyság',
    'region-fr': 'Franciaország',
    'region-de': 'Németország',
    'region-es': 'Spanyolország',
    'region-nz': 'Új-Zéland',
    'region-ie': 'Írország',
    'region-it': 'Olaszország',
    'region-ch': 'Svájc',
    'region-nl': 'Hollandia',
    'region-be': 'Belgium',
    'region-jp': 'Japán',
    'region-mx': 'Mexikó',
    'region-br': 'Brazília',
    'region-at': 'Ausztria',
    'region-dk': 'Dánia',
    'region-fi': 'Finnország',
    'region-no': 'Norvégia',
    'region-pt': 'Portugália',
    'region-se': 'Svédország',
    'region-gr': 'Görögország',
    'region-lv': 'Lettország',
    'region-pl': 'Lengyelország',
    'region-ro': 'Románia',
    'region-my': 'Malajzia',
    'region-sg': 'Szingapúr',
    'region-th': 'Thaiföld',
    'region-za': 'Dél-Afrika',
    'region-sk': 'Szlovákia',
    'region-sl': 'Szlovénia',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    'region-ko': 'Dél-Korea',
    maintitle: 'Hozz ki többet a Robloxból',
    'giftcards-desc':
      'A Roblox-ajándékkártyák a legegyszerűbb módja annak, hogy keretet adj hozzá, amelyet Robuxra vagy Premium előfizetésre költhetsz el.',
    'virtual-title': 'Ingyenes virtuális tárgyak',
    'virtual-desc':
      'Minden ajándékkártya egy ingyenes virtuális tárgyat biztosít a beváltáskor, és egy további, exkluzív virtuális tárgyhoz tartozó bónuszkódot is tartalmaz.',
    'virtual-desc-multi':
      'Minden ajándékkártya egy ingyenes virtuális tárgyat biztosít a beváltáskor, és két további, exkluzív virtuális tárgyhoz tartozó bónuszkódot is tartalmaz.',
    'item-included': 'Virtuális tárggyal',
    'item-bonus': 'Bónusz exkluzív virtuális tárgy',
    'virtual-footnote': 'Legfeljebb egy tárgy és egy bónusztárgy szerezhető fiókonként havonta.',
    'cards-title': 'Lepj meg egy Roblox-rajongót',
    'cards-desc':
      'Válassz az e-ajándékkártyák több tucat kinézete közül a kedvenc élményeid, karaktereid és egyebek szerint.',
    retailers:
      'A Roblox-ajándékkártyák a <a class="link-retailers">közeli kiskereskedőknél is elérhetők.</a>',
    'retailers-maintitle': 'Tökéletes ajándék minden Roblox-rajongónak',
    'digital-title': 'Vásárolj online',
    'digital-desc': 'Keresd a Roblox-ajándékkártyákat az alábbi online kiskereskedőknél:',
    'digital-footnote':
      'Tartsd szem előtt, hogy az Amazontól vásárolt Roblox digitális ajándékkártyák csak Robuxot biztosítanak, és nem használhatók fel Premium előfizetéshez.',
    'in-store-title': 'Vásárolj áruházakban',
    'in-store-desc': 'A Roblox-ajándékkártyák a közeli kiskereskedők üzleteiben is elérhetők:',
    'free-item-desc': 'Minden ajándékkártya egy ingyenes virtuális tárgyat biztosít a beváltáskor.',
    'free-item-footnote':
      'A tárgyal havonta változnak, és a kiskereskedőtől függnek. Fiókonként legfeljebb egy érhető el ajándékkártyánként.',
    'exclusive-desc':
      'Korlátozott ideig bónuszkódot kapsz egy további exkluzív virtuális tárgyhoz, ha ajándékutalványt vásárolsz közvetlenül a Robloxtól.',
    'special-event-footnote': '',
    'maintitle-more-robux': 'Élvezze az akár <br> 25% -kal több Robux',
    'main-subtitle-more-robux':
      'Szerezz több Robuxot ajándékkártyákkal, és a számítógépen és a weben'
  },
  arabic: {
    mainbutton: 'تسوق بطاقات الهدايا',
    redeem: 'تحصيل قيمة بطاقة هدايا',
    copyright: '© 2026 شركة Roblox. جميع الحقوق محفوظة.',
    terms: 'الشروط',
    privacy: 'الخصوصية',
    location: 'الموقع',
    'region-us': 'الولايات المتحدة الأمريكية',
    'region-ca': 'كندا',
    'region-au': 'أستراليا',
    'region-uk': 'المملكة المتحدة',
    'region-fr': 'فرنسا',
    'region-de': 'ألمانيا',
    'region-es': 'إسبانيا',
    'region-nz': 'نيوزيلندا',
    'region-ie': 'جمهورية ايرلندا',
    'region-it': 'إيطاليا',
    'region-ch': 'سويسرا',
    'region-nl': 'هولندا',
    'region-be': 'بلجيكا',
    'region-jp': 'اليابان',
    'region-mx': 'المكسيك',
    'region-br': 'البرازيل',
    'region-at': 'النمسا',
    'region-dk': 'الدنمارك',
    'region-fi': 'فنلندا',
    'region-no': 'النرويج',
    'region-pt': 'البرتغال',
    'region-se': 'السويد',
    'region-gr': 'اليونان',
    'region-lv': 'لاتفيا',
    'region-pl': 'بولندا',
    'region-ro': 'رومانيا',
    'region-my': 'ماليزيا',
    'region-sg': 'سنغافورة',
    'region-th': 'تايلاند',
    'region-za': 'جنوب أفريقيا',
    'region-sk': 'سلوفاكيا',
    'region-sl': 'سلوفينيا',
    'region-cy': '',
    'region-hu': '',
    'region-sa': 'المملكة العربية السعودية',
    'region-ae': 'الإمارات العربية المتحدة',
    'region-ko': 'كوريا الجنوبية',
    maintitle: 'حصّل أكثر من Roblox',
    'giftcards-desc':
      'تعد بطاقات هدايا Roblox أسهل طريقة لإضافة رصيد للحساب لاستخدامه في شراء Robux أو للاشتراك في Premium.',
    'virtual-title': 'عنصر مجاني افتراضي',
    'virtual-desc':
      'تمنحك كل بطاقة هدايا عنصرًا افتراضيًا مجانيًا عند تحصيل قيمتها وتأتي مع رمز لعنصر افتراضي حصري إضافي.',
    'virtual-desc-multi':
      'تمنحك كل بطاقة هدايا عنصرًا افتراضيًا مجانيًا عند تحصيل قيمتها وتأتي مع رمز مكافأة لعنصرين افتراضيين حصريين إضافيين.',
    'item-included': 'تتضمن عنصرًا افتراضيًا',
    'item-bonus': 'عنصر افتراضي حصري إضافي',
    'virtual-footnote': 'محدودة بعنصر واحد شهريًا لكل حساب وعنصر مكافأة إضافي.',
    'cards-title': 'فاجئ محب Roblox اليوم',
    'cards-desc':
      'اختر من بين العشرات من تصاميم بطاقات الهدايا الإلكترونية التي تعكس نوع تجاربك وشخصياتك المفضلة والمزيد.',
    retailers:
      'تتوفر أيضًا بطاقات هدايا Roblox <a class="link-retailers">لدى بائع تجزئة قريب منك.</a>',
    'retailers-maintitle': 'الهدية المثالية لعشاق Roblox',
    'digital-title': 'شراء عبر الإنترنت',
    'digital-desc': 'ابحث عن بطاقات هدايا Roblox لدى أي من بائعي التجزئة عبر الإنترنت:',
    'digital-footnote':
      'يرجى ملاحظة أن بطاقات هدايا Roblox الرقمية التي تم شراؤها من Amazon تمنحك عملة Robux فقط ولا يمكن استخدامها للاشتراك في Premium.',
    'in-store-title': 'شراء في المتجر',
    'in-store-desc': 'تتوفر بطاقات هدايا Roblox لدى بائعي التجزئة الفعليين بالقرب منك:',
    'free-item-desc': 'تمنحك كل بطاقة هدايا عنصرًا افتراضيًا مجانيًا عند تحصيل قيمتها.',
    'free-item-footnote':
      'تتغير العناصر شهريًّا وتعتمد أيضًا على بائع التجزئة. كل بطاقة هدايا محدودة بعنصر واحد لكل حساب.',
    'exclusive-desc':
      'لفترة محدودة، احصل على رمز مكافأة لعنصر افتراضي إضافي وحصري عند شراء بطاقة هدايا مباشرة من Roblox.',
    'special-event-footnote': '',
    'maintitle-more-robux': 'استمتع بما يصل إلى 25% أكثر Robux',
    'main-subtitle-more-robux': 'احصل على المزيد من Robux ببطاقات الهدايا وعلى الكمبيوتر والويب'
  },
  empty_template: {
    mainbutton: '',
    redeem: '',
    copyright: '',
    terms: '',
    privacy: '',
    location: '',
    'region-us': '',
    'region-ca': '',
    'region-au': '',
    'region-uk': '',
    'region-fr': '',
    'region-de': '',
    'region-es': '',
    'region-nz': '',
    'region-ie': '',
    'region-it': '',
    'region-ch': '',
    'region-nl': '',
    'region-be': '',
    'region-jp': '',
    'region-mx': '',
    'region-br': '',
    'region-at': '',
    'region-dk': '',
    'region-fi': '',
    'region-no': '',
    'region-pt': '',
    'region-se': '',
    'region-gr': '',
    'region-lv': '',
    'region-pl': '',
    'region-ro': '',
    'region-my': '',
    'region-sg': '',
    'region-th': '',
    'region-za': '',
    'region-ko': '',
    'region-sk': '',
    'region-sl': '',
    'region-cy': '',
    'region-hu': '',
    'region-sa': '',
    'region-ae': '',
    maintitle: '',
    'giftcards-desc': '',
    'virtual-title': '',
    'virtual-desc': '',
    'virtual-desc-multi': '',
    'item-included': '',
    'item-bonus': '',
    'virtual-footnote': '',
    'cards-title': '',
    'cards-desc': '',
    retailers: '<a class="link-retailers"></a>',
    'retailers-maintitle': '',
    'digital-title': '',
    'digital-desc': '',
    'digital-footnote': '',
    'in-store-title': '',
    'in-store-desc': '',
    'free-item-desc': '',
    'free-item-footnote': '',
    'exclusive-desc': '',
    'special-event-footnote': '',
    'maintitle-more-robux': '',
    'main-subtitle-more-robux': ''
  }
};

// main.js
$(window).load(async () => {
  const isLandingPage = currentPath.indexOf('retailers') === -1;

  function updateHeroImage(type) {
    const background = $(`.herobg-${type}`).css('background-image');
    const url = background.replace('url(', '').replace(')', '').replace(/"/gi, '');
    $(`.hero-${type}`).find('img').attr('src', url);
  }
  function getItemNames(callback, csrfToken) {
    if (csrfToken === undefined) csrfToken = '';
    const items = [
      {
        itemType: 'Asset',
        id: bonusItemInfo.id
      },
      {
        itemType: 'Asset',
        id: eventItemInfo.id
      }
    ];
    if (eventItemInfo2.id) {
      items.push({
        itemType: 'Asset',
        id: eventItemInfo2.id
      });
    }
    const xhr = $.ajax({
      type: 'POST',
      url: `${EnvironmentUrls.catalogApi}/v1/catalog/items/details`,
      data: JSON.stringify({
        items
      }),
      headers:
        csrfToken != ''
          ? { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' },
      success(data) {
        const reward_names = {};
        // data.forEach(item => rewardNames.push(item.name));
        $.each(data.data, function (idx, item) {
          reward_names[item.id] = item.name.split(' - ')[0];
        });
        callback(reward_names);
      },
      error(output, status) {
        let csrfToken = xhr.getAllResponseHeaders();
        csrfToken = csrfToken.match(/(?:x-csrf-token: )(\S*)/);
        if (csrfToken && csrfToken.length > 0) {
          csrfToken = csrfToken[1];
          getItemNames(callback, csrfToken);
        }
      }
    });
  }
  /** *****************
   * Canvas utilities *
   ****************** */
  function drawItemToCanvasV2(canvasElement, imageUrl, assetId) {
    if (!canvasElement) return;
    if (assetId) {
      const getClass = assetidThumbnailPresets[assetId];
      if (getClass) {
        $(canvasElement).addClass(getClass);
        return;
      }
    }
    const image = new Image(250, 250);
    image.crossOrigin = 'Anonymous';
    image.src = imageUrl;

    image.onload = function () {
      const ctx = canvasElement.getContext('2d');
      const { canvas } = ctx;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const hRatio = canvas.width / image.width;
      const vRatio = canvas.height / image.height;
      const ratio = Math.min(hRatio, vRatio);
      const centerShiftX = (canvas.width - image.width * ratio) / 2;
      const centerShiftY = (canvas.height - image.height * ratio) / 2;

      ctx.clearRect(0, 0, 250, 250);
      ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        centerShiftX,
        centerShiftY,
        image.width * ratio,
        image.height * ratio
      );
      trimCanvas(canvasElement);
    };
  }
  // https://gist.github.com/timdown/021d9c8f2aabc7092df564996f5afbbf
  const trimCanvas = (function () {
    function rowBlank(imageData, width, y) {
      for (let x = 0; x < width; ++x) {
        if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
      }
      return true;
    }

    function columnBlank(imageData, width, x, top, bottom) {
      for (let y = top; y < bottom; ++y) {
        if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
      }
      return true;
    }

    return function (canvas) {
      const ctx = canvas.getContext('2d');
      const { width } = canvas;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let top = 0;
      let bottom = imageData.height;
      let left = 0;
      let right = imageData.width;

      while (top < bottom && rowBlank(imageData, width, top)) ++top;
      while (bottom - 1 > top && rowBlank(imageData, width, bottom - 1)) --bottom;
      while (left < right && columnBlank(imageData, width, left, top, bottom)) ++left;
      while (right - 1 > left && columnBlank(imageData, width, right - 1, top, bottom)) --right;

      const trimmed = ctx.getImageData(left, top, right - left, bottom - top);
      const centerShiftX = (canvas.width - trimmed.width) / 2;
      const centerShiftY = (canvas.height - trimmed.height) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(trimmed, centerShiftX, centerShiftY, 0, 0, trimmed.width, trimmed.height);
    };
  })();

  function getAllThumbnails() {
    getItemNames(function (names) {
      $('.virtual-item-container').each(function () {
        const { assetId } = $(this).data();
        const name = names[assetId] || '';
        $(this).find('.virtual-item-name').text(name);
      });
    });
    let assetIdList = '';
    for (const assetId in multigetThumbnailIds) {
      assetIdList += `&assetIds=${multigetThumbnailIds[assetId]}`;
    }
    $.get(
      `${EnvironmentUrls.thumbnailsApi}/v1/assets?${assetIdList.slice(1)}&size=250x250&format=Png`
    ).success(function (thumbnails) {
      thumbnails.data.forEach(function (v) {
        for (const i in virtual_carousel_info) {
          if (virtual_carousel_info[i].id == v.targetId && v.imageUrl) {
            virtual_carousel_info[i].thumbnailUrl = v.imageUrl;
            const itemImage = $(`[carousel-index=${i}]`).find('.background-image');
            const currentSrc = itemImage.attr('src');
            if (itemImage.length && currentSrc != v.imageUrl) {
              itemImage.attr('src', v.imageUrl);
            }
          }
        }
        if (eventItemInfo.id === v.targetId && v.imageUrl) {
          const thisContainer = $('.item-container.event-item')[0];
          $(thisContainer).find('.background-image').attr('src', v.imageUrl);
          drawItemToCanvasV2($(thisContainer).find('.background-image')[0], v.imageUrl, v.targetId);
        }
        if (eventItemInfo2.id === v.targetId && v.imageUrl) {
          const thisContainer = $('.item-container.event-item')[1];
          $(thisContainer).find('.background-image').attr('src', v.imageUrl);
          drawItemToCanvasV2($(thisContainer).find('.background-image')[0], v.imageUrl, v.targetId);
        }
        if (bonusItemInfo.id === v.targetId && v.imageUrl) {
          $('.item-container.bonus-item').find('.background-image').attr('src', v.imageUrl);
          drawItemToCanvasV2(
            $('.item-container.bonus-item').find('.background-image')[0],
            v.imageUrl,
            v.targetId
          );
        }
      });
    });
    if (multigetBundleIds.length > 0) {
      $.get(
        `${EnvironmentUrls.thumbnailsApi}/v1/bundles/thumbnails?bundleIds=${multigetBundleIds}&size=150x150&format=Png&isCircular=false`
      ).success(function (thumbnails) {
        thumbnails.data.forEach(function (v) {
          for (const i in virtual_carousel_info) {
            if (virtual_carousel_info[i].id == v.targetId && v.imageUrl) {
              virtual_carousel_info[i].thumbnailUrl = v.imageUrl;
              const itemImage = $(`[carousel-index=${i}]`).find('.background-image');
              const currentSrc = itemImage.attr('src');
              if (itemImage.length && currentSrc != v.imageUrl) {
                itemImage.attr('src', v.imageUrl);
              }
            }
          }
          if (eventItemInfo.id === v.targetId && v.imageUrl) {
            const thisContainer = $('.item-container.event-item')[0];
            $(thisContainer).find('.background-image').attr('src', v.imageUrl);
            drawItemToCanvasV2(
              $(thisContainer).find('.background-image')[0],
              v.imageUrl,
              v.targetId
            );
          }
          if (eventItemInfo2.id === v.targetId && v.imageUrl) {
            const thisContainer = $('.item-container.event-item')[1];
            $(thisContainer).find('.background-image').attr('src', v.imageUrl);
            drawItemToCanvasV2(
              $(thisContainer).find('.background-image')[0],
              v.imageUrl,
              v.targetId
            );
          }
          if (bonusItemInfo.id === v.targetId && v.imageUrl) {
            $('.item-container.bonus-item').find('.background-image').attr('src', v.imageUrl);
            drawItemToCanvasV2(
              $('.item-container.bonus-item').find('.background-image')[0],
              v.imageUrl,
              v.targetId
            );
          }
        });
      });
    }
  }

  function getQueryParameters() {
    const search = window.location.search.substr(1);
    if (!search) {
      return {};
    }
    const entries = search.split('&');
    const params = {};
    entries.forEach(function (v) {
      if (!v) {
        return;
      }
      const kv = v.split('+').join(' ').split('=');
      const key = kv.shift();
      const val = kv.join('=');
      params[decodeURIComponent(key)] = decodeURIComponent(val);
    });
    return params;
  }
  const queryParameters = getQueryParameters();

  function addSearchParams(href) {
    if (!href || href.length == 0 || window.location.search.length == 0) {
      return href;
    }

    try {
      const url = new URL(href);
      for (const param in queryParameters) {
        url.searchParams.set(param, queryParameters[param]);
      }

      return url.href;
    } catch (e) {
      return href;
    }
  }

  $('#magic-line').remove();
  function applylinks() {
    $("[class*='link-']").each(function (o, n) {
      const section = this.className
        .split(' ')
        .find(function (v) {
          return v.startsWith('link-');
        })
        .substring(5);
      let href = links[section];
      if (section === 'mainbutton') {
        // check for links[section-region-language], otherwise use links[section-region]
        href =
          links[`${section}-${currentPage}-${currentLanguage}`] ||
          links[`${section}-${currentPage}`] ||
          href;
      }
      if (section === 'retailers' && currentPage) {
        href += `-${currentPage}`;
      }
      if (NO_REFERRER_LINKS.indexOf(section) > -1) {
        $(this).attr('rel', 'noreferrer');
      }
      if (EMPTY_LINKS.indexOf(section) > -1) {
        href = '#';
        $(this).addClass('unselectable');
      }

      href = addSearchParams(href);

      if (href && href != $(this).attr('href')) {
        $(this).attr('href', href);
      }
    });
  }

  function applysources() {
    $("[class*='source-']").each(function (o, n) {
      const section = this.className
        .split(' ')
        .find(function (v) {
          return v.startsWith('source-');
        })
        .substring(7);
      const src = sources[section];
      const currentsrc = $(this).attr('src');
      if (src && src != currentsrc) {
        $(this).attr('src', src);
      }
    });
  }

  function adjustLanguageStyle(language) {
    const languageAdjustments = {
      arabic: {
        '.text-note': {
          property: 'font-size',
          value: '12px'
        },
        '.section .main-btn': {
          property: 'font-weight',
          value: '600'
        },
        '.header .headerLeft .header-box .redeem-button .main-btn': {
          property: 'font-weight',
          value: '600'
        }
      }
    };
    if (languageAdjustments[language]) {
      for (const selector in languageAdjustments[language]) {
        const adjustment = languageAdjustments[language][selector];
        $(selector).css(adjustment.property, adjustment.value);
      }
    }
  }
  function translate(language, shrink) {
    if (supportedLanguages.indexOf(language) < 0) {
      language = 'english';
    }
    if (language !== 'english') {
      $('.translated').removeClass('english').addClass(language.toLowerCase());
      $('.coming-soon-container').hide();
      $('.prize-label').hide();
    }
    $("[class*='lang-']").each(function (o, n) {
      const section = this.className
        .split(' ')
        .filter(function (v) {
          return v.startsWith('lang-');
        })[0]
        .substring(5);
      if (shrink) {
        $(this).addClass('tinytext');
      }
      const copy =
        (lang[language] && lang[language][section]) || (lang.english && lang.english[section]);
      if (copy && copy != $(this).text()) {
        this.innerHTML = copy;
        if (language == 'arabic') {
          $(this).css('direction', 'rtl');
        }
      }
      if (copy === '' && section !== 'coypright') {
        $(this).hide();
      }
    });

    adjustLanguageStyle(language);
  }

  let animating = false;
  let carouselAnimationTimeout;

  const animationTimeout = 100;

  const carouselLengths = {
    '.virtual-item-carousel': 8,
    '.instore-item-carousel': 8,
    '.giftcard-carousel': 8
  };
  const giftcardImages = [
    'giftcard1',
    'giftcard2',
    'giftcard3',
    'giftcard4',
    'giftcard5',
    'giftcard6',
    'giftcard7',
    'giftcard8'
  ];

  function changeCarousel(classname, info, right) {
    const carouselContainer = $(classname);
    if (classname === '.background-item-carousel') {
      if (right) {
        carouselContainer.append(carouselContainer.children().first());
        const filledIndex = $('.indicator.filled').index();
        $('.indicator')
          .removeClass('filled')
          .eq((filledIndex + 1) % $('.indicator').length)
          .addClass('filled');
      } else {
        carouselContainer.prepend(carouselContainer.children().last());
        const filledIndex = $('.indicator.filled').index();
        $('.indicator')
          .removeClass('filled')
          .eq(filledIndex === 0 ? $('.indicator').length - 1 : filledIndex - 1)
          .addClass('filled');
      }
      return;
    }

    let { currentCarouselIndex } = info;
    let thisCarouselLength = carouselLengths[classname];
    if (info.length == 3) {
      /// special case where currentCarouselLength is incorrect
      thisCarouselLength = 3;
    }
    if (right) {
      var beingReplaced = carouselContainer.find('.carousel-item').first();
      var beingReplacedInfo = info[currentCarouselIndex];
      var nextCarouselIndex = (currentCarouselIndex + thisCarouselLength) % info.length;
      var nextInfo = info[nextCarouselIndex];
      currentCarouselIndex = (currentCarouselIndex + 1) % info.length;
      var shownCarouselIndex = (currentCarouselIndex + 2) % info.length;
      var shownInfo = info[shownCarouselIndex];
    } else {
      var beingReplaced = carouselContainer.find('.carousel-item').last();
      var beingReplacedInfo = info[(currentCarouselIndex + (thisCarouselLength - 1)) % info.length];
      var nextCarouselIndex =
        currentCarouselIndex == 0 ? info.length - 1 : currentCarouselIndex - 1;
      var nextInfo = info[nextCarouselIndex];
      currentCarouselIndex = nextCarouselIndex;
      var shownCarouselIndex = (currentCarouselIndex + 2) % info.length;
      var shownInfo = info[shownCarouselIndex];
    }
    if (classname === '.instore-item-carousel') {
      beingReplaced
        .find('.background-image')
        .removeClass(beingReplacedInfo.classname)
        .addClass(nextInfo.classname);
      beingReplaced
        .find('a')
        .attr('href', nextInfo.linkhref)
        .removeClass()
        .addClass(`link-${nextInfo.linkname}`);
      beingReplaced.attr('carousel-index', nextCarouselIndex);
    }
    if (classname === '.giftcard-carousel') {
      beingReplaced
        .find('.background-image')
        .removeClass(beingReplacedInfo.classname)
        .addClass(nextInfo.classname);
      beingReplaced.attr('carousel-index', nextCarouselIndex);
    }

    if (classname === '.virtual-item-carousel') {
      beingReplaced.find('a').attr('href', nextInfo.linkhref);
      beingReplaced.attr('carousel-index', nextCarouselIndex);
      if (nextInfo.thumbnailUrl) {
        beingReplaced.find('.background-image').attr('src', nextInfo.thumbnailUrl);
      } else {
        beingReplaced.find('.background-image').removeAttr('src');
      }
    }

    if (right) {
      carouselContainer.append(beingReplaced);
    } else {
      carouselContainer.prepend(beingReplaced);
    }

    info.currentCarouselIndex = currentCarouselIndex;

    animating = true;
    clearTimeout(carouselAnimationTimeout);
    carouselAnimationTimeout = setTimeout(function () {
      animating = false;
    }, animationTimeout);
  }

  $('.arrow-container-instore').on('click', function (e) {
    if (animating) {
      return;
    }

    const t = $(this);
    const right = t.hasClass('right');
    changeCarousel('.instore-item-carousel', store_carousel_info, right);
  });

  $('.arrow-container-giftcards').on('click', function (e) {
    if (animating) {
      return;
    }

    const t = $(this);
    const right = t.hasClass('right');
    changeCarousel('.giftcard-carousel', giftcard_carousel_info, right);
  });

  $('.arrow-container-virtual').on('click', function (e) {
    if (animating) {
      return;
    }

    const t = $(this);
    const right = t.hasClass('right');
    changeCarousel('.virtual-item-carousel', virtual_carousel_info, right);
  });

  const carouselIdToInfoMap = {
    '.virtual-item-carousel': virtual_carousel_info,
    '.instore-item-carousel': store_carousel_info,
    '.giftcard-carousel': giftcard_carousel_info
  };

  $('.arrow-container-background').on('click', function (e) {
    const t = $(this);
    const right = t.hasClass('right');
    changeCarousel('.background-item-carousel', null, right);
  });

  $('.indicator').on('click', async function (e) {
    const t = $(this);
    if (t.hasClass('filled')) {
      return;
    }
    const leftIndex = t.index();
    let fromIndex = $('.indicator.filled').index();

    const pageCount = $('.indicator').length;
    const rightIndex = pageCount * 2 + t.index();
    fromIndex += pageCount;

    function wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    const rightDiff = Math.abs(rightIndex - fromIndex) % pageCount;
    const leftDiff = Math.abs(leftIndex - fromIndex) % pageCount;

    if (rightDiff <= leftDiff) {
      changeCarousel('.background-item-carousel', null, true);
      for (var i = 1; i < rightDiff; i++) {
        await wait(150).then(function () {
          changeCarousel('.background-item-carousel', null, true);
        });
      }
    } else {
      changeCarousel('.background-item-carousel', null, false);
      for (var i = 1; i < leftDiff; i++) {
        await wait(150).then(function () {
          changeCarousel('.background-item-carousel', null, false);
        });
      }
    }
  });

  if (queryParameters.ref) {
    $('#cashstar-form')
      .eq(0)
      .attr('action', `${$('#cashstar-form').eq(0).attr('action')}?ref=${queryParameters.ref}`);
  }

  $('.large-button').on('click', function (e) {
    const t = $(this);
    const price = +t.find('.price').text().replace(/\D/g, '');
    if (price) {
      $('#cashstar-form input[name=amount]').val(price);
    }
    $('#cashstar-form').eq(0).submit();
  });

  $('.video-tab').on('click', function (e) {
    $('.video-tab.active').removeClass('active');
    const $this = $(this);
    $this.addClass('active');
    const src = $this.data().source;
    const tabid = $this.data().tabId;
    const currentsource = $('.iframe-container iframe').attr('src');
    const newsource = sources[src];
    if (currentsource != newsource) {
      $('.iframe-container iframe').removeClass().addClass(`source-${src}`).attr('src', newsource);
      $('.iframe-container').removeClass('tab1 tab2').addClass(tabid);
    }
  });

  if (!retailerInfo[currentPage]) {
    currentPage = 'us';
  }
  if (isLandingPage) {
    if (cashstarUnsupportedCountries.includes(currentPage)) {
      window.location.href = Endpoints.getAbsoluteUrl(`/giftcards-retailers-${currentPage}`);
    }
  }

  const currentPageInfo = retailerInfo[currentPage];
  const currentPrizeInfo = prizes && prizes[currentPage];
  if (currentPageInfo.event_section) {
    $('.event-section:eq(1)').removeClass('hide').show();
    $('.lang-virtual-footnote')
      .removeClass('lang-virtual-footnote')
      .addClass('lang-special-event-footnote');
    $('.lang-virtual-title').hide();
  }
  if (!currentPageInfo.instore.length) {
    if ($('.section.in-store').length > 0) {
      $('.section.in-store').hide();
      $('.section:not(.top):not(.digital)').toggleClass('dark light');
    }
  }
  let hidDigital = false;
  if (!currentPageInfo.online.length && $('.section.digital').length > 0) {
    hidDigital = true;
    $('.section.digital').hide();
    $('.section:not(.top)').toggleClass('dark light');
  }
  if (
    !currentPageInfo.cashstar ||
    !currentPrizeInfo ||
    currentPrizeInfo.cashstar_items.length == 0
  ) {
    if (!hidDigital) {
      if (isLandingPage) {
        $('.section.digital').hide();
        $('.section:not(.top)').toggleClass('dark light');
      }
      $('.section.virtual-items').hide();
    }
  }
  if (currentPageInfo.instore.length > 6) {
    while (store_carousel_info.length < 8 && currentPageInfo) {
      for (const i in currentPageInfo.instore) {
        var storeName = retailers[currentPageInfo.instore[i]];
        store_carousel_info.push({
          classname: storeName,
          linkname: storeName,
          linkhref: addSearchParams(
            EMPTY_LINKS.indexOf(storeName) > -1 ? '#' : links[`locator-${storeName}-${currentPage}`]
          )
        });
      }
    }
  } else {
    for (const i in currentPageInfo.instore) {
      var storeName = retailers[currentPageInfo.instore[i]];
      store_carousel_info.push({
        classname: storeName,
        linkname: storeName,
        linkhref: addSearchParams(
          EMPTY_LINKS.indexOf(storeName) > -1 ? '#' : links[`locator-${storeName}-${currentPage}`]
        )
      });
    }
  }
  if (giftcardImages.length > 6) {
    while (giftcard_carousel_info.length < 8) {
      for (const i in giftcardImages) {
        giftcard_carousel_info.push({
          classname: giftcardImages[i]
        });
      }
    }
  } else {
    for (const i in giftcardImages) {
      giftcard_carousel_info.push({
        classname: giftcardImages[i]
      });
    }
  }

  let multigetThumbnailIds = [];
  let multigetBundleIds = '';
  const amazonIds = [6, 7, 10, 12, 14, 24, 39];
  const prizeInfo = prizes && prizes[currentPage];
  const uniquePrizes =
    prizeInfo &&
    prizeInfo.items.filter(function (v, i, a) {
      return a.indexOf(v) === i;
    });
  var eventItemInfo = {
    id: (prizeInfo && prizeInfo.bonus_items[0]) || '',
    thumbnailUrl: ''
  };
  var eventItemInfo2 = {
    id: (prizeInfo && prizeInfo.bonus_items[1]) || '',
    thumbnailUrl: ''
  };

  var bonusItemInfo = {
    id: (prizeInfo && prizeInfo.cashstar_items[0]) || '',
    thumbnailUrl: ''
  };

  if (eventItemInfo2.id) {
    $('.items-container.row-column').toggleClass('multi-bonus', true);
    $('.lang-virtual-desc').toggleClass('lang-virtual-desc-multi', true);
    $('.lang-virtual-desc').removeClass('lang-virtual-desc');
  }

  if (uniquePrizes.length > 6) {
    while (virtual_carousel_info.length < 8) {
      for (const i in uniquePrizes) {
        var id = uniquePrizes[i];
        if (!id) {
          continue;
        }
        var isBundle = bundleIds.indexOf(id) >= 0;
        if (isBundle) {
          if (multigetBundleIds.indexOf(+id) < 0) {
            multigetBundleIds += `${id},`;
          }
        } else if (multigetThumbnailIds.indexOf(+id) < 0) {
          multigetThumbnailIds.push(+id);
        }
        virtual_carousel_info.push({
          id: +id,
          thumbnailUrl: '',
          linkhref: addSearchParams(
            Endpoints.getAbsoluteUrl(`/${isBundle ? 'bundles' : 'catalog'}/${id}`)
          )
        });
      }
    }
  } else {
    for (const i in uniquePrizes) {
      var id = uniquePrizes[i];
      if (!id) {
        continue;
      }
      var isBundle = bundleIds.indexOf(id) >= 0;
      if (isBundle) {
        if (multigetBundleIds.indexOf(+id) < 0) {
          multigetBundleIds += `${id},`;
        }
      } else if (multigetThumbnailIds.indexOf(+id) < 0) {
        multigetThumbnailIds.push(+id);
      }
      virtual_carousel_info.push({
        id: +id,
        thumbnailUrl: '',
        linkhref: addSearchParams(
          Endpoints.getAbsoluteUrl(`/${isBundle ? 'bundles' : 'catalog'}/${id}`)
        )
      });
    }
  }
  if (eventItemInfo.id) {
    if (multigetThumbnailIds.indexOf(eventItemInfo.id) < 0) {
      multigetThumbnailIds.push(eventItemInfo.id);
    }
  }
  if (eventItemInfo2.id) {
    if (multigetThumbnailIds.indexOf(eventItemInfo2.id) < 0) {
      multigetThumbnailIds.push(eventItemInfo2.id);
    }
  }
  if (multigetThumbnailIds.indexOf(bonusItemInfo.id) < 0) {
    multigetThumbnailIds.push(bonusItemInfo.id);
  }

  const touchEventRouter = {};

  function getTouches(e) {
    return e.touches || e.originalEvent.touches;
  }

  function getFingerprint(e) {
    return (
      (e.currentTarget && e.currentTarget.className) || e.originalEvent.currentTarget.className
    );
  }

  function handleTouchStart(e) {
    if ($(this).hasClass('nocarousel')) return;
    const firstTouch = getTouches(e)[0];
    const fingerprint = getFingerprint(e);
    touchEventRouter[fingerprint] = touchEventRouter[fingerprint] || {};
    touchEventRouter[fingerprint].xDown = firstTouch.clientX;
    touchEventRouter[fingerprint].yDown = firstTouch.clientY;
  }

  function handleTouchMove(e) {
    if ($(this).hasClass('nocarousel')) return;
    const fingerprint = getFingerprint(e);
    if (!touchEventRouter[fingerprint]) {
      return;
    }
    const xd = touchEventRouter[fingerprint].xDown;
    const yd = touchEventRouter[fingerprint].yDown;
    if (!xd || !yd) {
      return;
    }

    const touches = e.touches || e.originalEvent.touches;

    const xu = touches[0].clientX;
    const yu = touches[0].clientY;

    const xdiff = xd - xu;
    const ydiff = yd - yu;

    let carouselId = fingerprint
      .replace(/(linear|perspective)-carousel/g, '')
      .match(/([\w-]+-carousel)/i)[1];

    if (carouselId) {
      carouselId = `.${carouselId}`;

      if (Math.abs(xdiff) > Math.abs(ydiff)) {
        if (xdiff > 0) {
          changeCarousel(carouselId, carouselIdToInfoMap[carouselId], true);
        } else {
          changeCarousel(carouselId, carouselIdToInfoMap[carouselId], false);
        }
      }
    }

    touchEventRouter[fingerprint].xDown = null;
    touchEventRouter[fingerprint].yDown = null;
  }
  function init() {
    const amountsContainer = $('.amounts-container');
    const onlineStoreContainer = $('.online-store-container');
    const storeCarousel = $('.instore-item-carousel');
    const giftcardCarousel = $('.giftcard-carousel');
    const virtualItemCarousel = $('.virtual-item-carousel');
    const newAmount = amountsContainer.find('>.template').clone();
    newAmount
      .removeClass('template')
      .find('.template')
      .toggleClass(`template digital-cards ${currentPage}`);
    amountsContainer.append(newAmount);
    for (const i in currentPageInfo.online) {
      if (+i >= 4) {
        break;
      }
      const storeToAdd = retailers[currentPageInfo.online[i]];
      const newStore = onlineStoreContainer.find('>.template').clone();
      newStore.removeClass('template').find('.template').toggleClass(`template ${storeToAdd}`);
      newStore
        .find('.link-template')
        .toggleClass(`link-template link-online-${storeToAdd}-${currentPage}`);
      onlineStoreContainer.append(newStore);
    }
    // don't let them stack vertically if there's only two (visible) elements
    if (onlineStoreContainer.children().length <= 3) {
      onlineStoreContainer.find('.store-logo-container').addClass('no-stack');
    }

    const largeButtons = $('.large-button');
    if (currentPageInfo.cashstar) {
      const { amounts } = currentPageInfo.cashstar;
      largeButtons.each(function (n, o) {
        o = $(o);
        const amount = amounts[n];
        o.find('.price').text(currentPageInfo.cashstar.currencyFormat.replace(/%d/, amount));
      });
    }

    if (!currentPageInfo.online.reduce((a, v) => a + amazonIds.includes(v), 0)) {
      $('.digital-container .right-section .text-note').hide();
    }

    const eventItemContainer = $('.item-container.event-item');
    const bonusItemContainer = $('.item-container.bonus-item');
    $(eventItemContainer.find('a')[0]).attr(
      'href',
      addSearchParams(Endpoints.getAbsoluteUrl(`/catalog/${eventItemInfo.id}`))
    );
    $(eventItemContainer.find('a')[1]).attr(
      'href',
      addSearchParams(Endpoints.getAbsoluteUrl(`/catalog/${eventItemInfo2.id}`))
    );
    bonusItemContainer
      .find('a')
      .attr('href', addSearchParams(Endpoints.getAbsoluteUrl(`/catalog/${bonusItemInfo.id}`)));
    if (eventItemInfo.id) {
      $(eventItemContainer[0]).removeClass('template');
    }
    if (eventItemInfo2.id) {
      $(eventItemContainer[1]).removeClass('template');
      $(eventItemContainer[1]).show();
    }
    eventItemContainer.find('.virtual-item-container').data('assetId', eventItemInfo.id);
    $(eventItemContainer.find('.virtual-item-container')[1]).data('assetId', eventItemInfo2.id);
    bonusItemContainer.find('.virtual-item-container').data('assetId', bonusItemInfo.id);

    var carouselContainers = giftcardCarousel.find('.carousel-item');
    var noCarousel = giftcard_carousel_info.length < 6;
    if (noCarousel) {
      $('.arrow-container-giftcards').hide();
    }
    carouselContainers.each(function (n, o) {
      o = $(o);
      const info =
        giftcard_carousel_info[
          (n + giftcard_carousel_info.length - 1) % giftcard_carousel_info.length
        ];
      if (!giftcard_carousel_info[n]) {
        o.hide();
        return;
      }
      o.attr(
        'carousel-index',
        (n + giftcard_carousel_info.length - 1) % giftcard_carousel_info.length
      );
      o.removeClass('template').find('.template').toggleClass(`template ${info.classname}`);
      o.find('.background-image').addClass(info.classname);
    });

    var carouselContainers = storeCarousel.find('.carousel-item');
    var noCarousel = store_carousel_info.length < 7;
    if (noCarousel) {
      storeCarousel.addClass('nocarousel');
      carouselContainers.toggleClass('no-transform');
      $('.arrow-container-instore').hide();
    }
    carouselContainers.each(function (n, o) {
      o = $(o);

      const info =
        store_carousel_info[(n + store_carousel_info.length - 1) % store_carousel_info.length];
      if (!store_carousel_info[n]) {
        o.remove();
        return;
      }
      o.attr('carousel-index', (n + store_carousel_info.length - 1) % store_carousel_info.length);
      o.removeClass('template').find('.template').toggleClass(`template ${info.classname}`);
      o.find('.link-template')
        .toggleClass(`link-template link-${info.classname}`)
        .attr('href', info.linkhref);
    });

    var carouselContainers = virtualItemCarousel.find('.carousel-item');
    var noCarousel = virtual_carousel_info.length < 7;
    if (noCarousel) {
      virtualItemCarousel.addClass('nocarousel');
      carouselContainers.toggleClass('no-transform');
      $('.arrow-container-virtual').hide();
    }
    carouselContainers.each(function (n, o) {
      o = $(o);
      const info =
        virtual_carousel_info[
          (n + virtual_carousel_info.length - 1) % virtual_carousel_info.length
        ];
      o.attr(
        'carousel-index',
        (n + virtual_carousel_info.length - 1) % virtual_carousel_info.length
      );
      if (noCarousel) {
        o.addClass('nocarousel');
      }
      if (virtual_carousel_info[n]) {
        o.find('a').attr('href', info.linkhref);
      } else {
        o.remove();
      }
    });
    $('.translated').removeClass('us').addClass(currentPage.toLowerCase());
    store_carousel_info.currentCarouselIndex = store_carousel_info.length - 1;
    giftcard_carousel_info.currentCarouselIndex = giftcard_carousel_info.length - 1;
    virtual_carousel_info.currentCarouselIndex = virtual_carousel_info.length - 1;

    $('.perspective-carousel').on('touchstart', handleTouchStart);
    $('.perspective-carousel').on('touchmove', handleTouchMove);
    $('.linear-carousel').on('touchstart', handleTouchStart);
    $('.linear-carousel').on('touchmove', handleTouchMove);
    let PrevSmallWindow = null;
    function AdjustCarousels() {
      const IsSmallWindow = $(window).width() <= 767;
      if (PrevSmallWindow == IsSmallWindow) return;
      PrevSmallWindow = IsSmallWindow;
      if (IsSmallWindow) {
        // If 2 or more items in each carousel container, now carousel must be shown even if it was hidden before
        if (store_carousel_info.length > 2) {
          storeCarousel.removeClass('nocarousel');
          var carouselContainers = storeCarousel.find('.carousel-item');
          carouselContainers.removeClass('no-transform');
          $('.arrow-container-instore').show();
        }
        if (virtual_carousel_info.length > 2) {
          virtualItemCarousel.removeClass('nocarousel');
          var carouselContainers = virtualItemCarousel.find('.carousel-item');
          carouselContainers.each(function () {
            if ($(this).hasClass('nocarousel')) {
              $(this).toggleClass('was-nocarousel', true);
              $(this).removeClass('nocarousel');
            }
          });
          carouselContainers.removeClass('no-transform');
          $('.arrow-container-virtual').show();
        }
      } else {
        if (store_carousel_info.length < 7) {
          storeCarousel.toggleClass('nocarousel', true);
          var carouselContainers = storeCarousel.find('.carousel-item');
          carouselContainers.toggleClass('no-transform', true);
          $('.arrow-container-instore').hide();
        }
        if (virtual_carousel_info.length < 7) {
          virtualItemCarousel.toggleClass('nocarousel', true);
          var carouselContainers = virtualItemCarousel.find('.carousel-item');
          carouselContainers.each(function () {
            if ($(this).hasClass('was-nocarousel')) {
              $(this).toggleClass('nocarousel', true);
              $(this).removeClass('was-nocarousel');
            }
          });
          carouselContainers.toggleClass('no-transform', true);
          $('.arrow-container-virtual').hide();
        }
      }
    }
    $(window).on('resize', function () {
      AdjustCarousels();
    });
    AdjustCarousels();
  }

  const languages = {
    'en-au': {
      language: 'english',
      location: 'au',
      dropdown: 'AUSTRALIA'
    },
    'en-be': {
      language: 'english',
      location: 'be',
      dropdown: 'BELGIUM'
    },
    'en-ca': {
      language: 'english',
      location: 'ca',
      dropdown: 'CANADA'
    },
    'en-gb': {
      language: 'english',
      location: 'uk',
      dropdown: 'UNITED KINGDOM'
    },
    'en-ie': {
      language: 'english',
      location: 'ie',
      dropdown: 'IRELAND'
    },
    'en-nz': {
      language: 'english',
      location: 'nz',
      dropdown: 'NEW ZEALAND'
    },
    'en-us': {
      language: 'english',
      location: 'us',
      dropdown: 'UNITED STATES'
    },
    'gd-ie': {
      language: 'english',
      location: 'ie',
      dropdown: 'IRELAND'
    },
    en: {
      language: 'english',
      dropdown: 'LOCATION'
    },
    'fr-fr': {
      language: 'french',
      location: 'fr',
      dropdown: 'FRANCE'
    },
    'fr-ca': {
      language: 'french_canada',
      location: 'ca',
      dropdown: 'CANADA'
    },
    'fr-ch': {
      language: 'french',
      location: 'ch',
      dropdown: 'Suisse'
    },
    'fr-be': {
      language: 'french',
      location: 'be',
      dropdown: 'BELGES'
    },
    fr: {
      language: 'french',
      dropdown: 'LOCATION'
    },
    'de-de': {
      language: 'german',
      location: 'de',
      dropdown: 'DEUSCHLAND'
    },
    'de-be': {
      language: 'german',
      location: 'be',
      dropdown: 'BELGIER'
    },
    'de-ch': {
      language: 'german',
      location: 'ch',
      dropdown: 'DIE SCHWEIZ'
    },
    de: {
      language: 'german',
      dropdown: 'STANDORT'
    },
    'es-es': {
      language: 'spanish',
      location: 'es',
      dropdown: 'EspaÃƒÂ±a'
    },
    es: {
      language: 'spanish',
      dropdown: 'UBICACIÃƒâ€œN'
    },
    'it-it': {
      language: 'italian',
      location: 'it',
      dropdown: 'Italia'
    },
    'it-ch': {
      language: 'italian',
      location: 'ch',
      dropdown: 'SVIZZERA'
    },
    it: {
      language: 'italian',
      dropdown: 'localizzazione'
    },
    'nl-nl': {
      language: 'dutch',
      location: 'nl',
      dropdown: 'Nederlands'
    },
    'nl-be': {
      language: 'dutch',
      location: 'be',
      dropdown: 'BELGEN'
    },
    nl: {
      language: 'dutch',
      dropdown: 'LOCATIE'
    },
    nb: {
      language: 'norwegian_bokmal',
      dropdown: 'STED'
    },
    no: {
      language: 'norwegian_bokmal',
      dropdown: 'STED'
    },
    'sv-ca': {
      language: 'swedish',
      location: 'ca',
      dropdown: 'Kanada'
    },
    'sv-us': {
      language: 'swedish',
      location: 'us',
      dropdown: 'FÃƒÂ¶renta staterna'
    },
    sv: {
      language: 'swedish',
      dropdown: 'plats'
    },
    da: {
      language: 'danish',
      dropdown: 'LOKATION'
    },
    jp: {
      language: 'japanese',
      dropdown: '国/地域'
    },
    ja: {
      language: 'japanese',
      dropdown: '国/地域'
    },
    pl: {
      language: 'polish',
      dropdown: 'Lokalizacja'
    },
    el: {
      language: 'greek',
      dropdown: 'Τοποθεσία'
    },
    lv: {
      language: 'latvian',
      dropdown: 'Atrašanās vieta'
    },
    ms: {
      language: 'malaysian',
      dropdown: 'Lokasi'
    },
    ro: {
      language: 'romanian',
      dropdown: 'Locație'
    },
    th: {
      language: 'thai',
      dropdown: ''
    },
    sk: {
      language: 'slovak',
      dropdown: ''
    },
    sl: {
      language: 'slovene',
      dropdown: ''
    },
    hu: {
      language: 'hungarian',
      dropdown: ''
    },
    ar: {
      language: 'arabic',
      dropdown: ''
    }
  };
  var currentLanguage = 'english';
  const supportedLanguages = [
    'english',
    'spanish',
    'french_canada',
    'french',
    'german',
    'portuguese',
    'chinese_simplified',
    'chinese_traditional',
    'korean',
    'japanese',
    // "russian",
    'danish',
    'dutch',
    'finnish',
    'italian',
    'norwegian_bokmal',
    'swedish',
    'polish',
    'greek',
    'latvian',
    'malay',
    'romanian',
    'thai',
    'slovak',
    'slovene',
    'hungarian',
    'arabic',
    ''
  ];
  for (const languageIndex in DISABLED_LANGUAGES) {
    const langName = DISABLED_LANGUAGES[languageIndex];
    const langIndex = supportedLanguages.indexOf(langName);
    if (langIndex > -1) {
      supportedLanguages.splice(langIndex, 1);
    }
  }
  for (const countryIndex in DISABLED_COUNTRIES) {
    const countryCode = DISABLED_COUNTRIES[countryIndex];
    $(`option[value="${countryCode}"`).hide();
  }

  let browserLanguage = navigator.language.toLowerCase();
  if (urlLocale) {
    browserLanguage = urlLocale;
  }
  // if (window.location.search.indexOf("location=") < 0) {
  // 	if (browserLanguage.indexOf("-") >= 0) {
  // 		for(var key in languages) {
  // 			if (browserLanguage.indexOf(key) >= 0 && window.location.search.indexOf("location=" + languages[key].location) < 0) {
  // 				window.location.search = "?location=" + languages[key].location + ref;
  // 				break;
  // 			}
  // 		}
  // 	}
  // }
  if (languages[browserLanguage]) {
    translate(languages[browserLanguage].language);
  } else {
    translate('english');
  }

  $('.headerLeft').append($('.header-box'));
  $('.invisible-select').val(currentPage);
  $('.invisible-select').on('focus', function (e) {
    $('.location-picker .location-right > div').removeClass('down-arrow').addClass('up-arrow');
  });
  $('.invisible-select').on('blur', function (e) {
    $('.location-picker .location-right > div').removeClass('up-arrow').addClass('down-arrow');
  });
  $('.invisible-select').on('change', function (e) {
    if (isLandingPage) {
      if (cashstarUnsupportedCountries.includes(this.value)) {
        window.location.href = addSearchParams(
          Endpoints.getAbsoluteUrl(`/giftcards-retailers-${this.value}`)
        );
        return;
      }
    }
    const pathSplit = currentPath.split('-');
    pathSplit.pop();
    const rootPath = pathSplit.join('-');
    window.location.href = addSearchParams(
      Endpoints.getAbsoluteUrl(`/${rootPath.split('/')[1]}-${this.value}`)
    );
  });

  getAllThumbnails();

  links = links || {};
  lang = lang || {};
  sources = sources || {};
  strings = strings || {};

  init();
  applysources();

  // SPANISH
  if (navigator.language.indexOf('es') >= 0) {
    translate((currentLanguage = 'spanish'));
  }
  // FRENCH CANADA
  if (navigator.language.indexOf('fr-CA') >= 0) {
    translate((currentLanguage = 'french_canada'));
    // FRENCH
  } else if (navigator.language.indexOf('fr') >= 0) {
    translate((currentLanguage = 'french'));
  }
  // GERMAN
  if (navigator.language.indexOf('de') >= 0) {
    translate((currentLanguage = 'german'));
  }
  // Portuguese
  if (navigator.language.indexOf('pt') >= 0) {
    translate((currentLanguage = 'portuguese'));
  }
  // CHINESE - SIMPLIFIED
  if (navigator.language.indexOf('zh-CN') >= 0) {
    translate((currentLanguage = 'chinese_simplified'));
  }
  // CHINESE - TRADITIONAL
  if (navigator.language.indexOf('zh-TW') >= 0) {
    translate((currentLanguage = 'chinese_traditional'));
  }
  // // KOREAN
  if (navigator.language.indexOf('ko') >= 0) {
    translate((currentLanguage = 'korean'));
  }
  // JAPANESE
  if (navigator.language.indexOf('ja') >= 0) {
    translate((currentLanguage = 'japanese'));
  }
  // // RUSSIAN
  // if (navigator.language.indexOf("ru") >= 0) {
  // 	translate(currentLanguage = "russian");
  // }
  // Danish
  if (navigator.language.indexOf('da') >= 0) {
    translate((currentLanguage = 'danish'));
  }
  // Dutch
  if (navigator.language.indexOf('nl') >= 0) {
    translate((currentLanguage = 'dutch'));
  }
  // Finnish
  if (navigator.language.indexOf('fi') >= 0) {
    translate((currentLanguage = 'finnish'));
  }
  // Italian
  if (navigator.language.indexOf('it') >= 0) {
    translate((currentLanguage = 'italian'));
  }
  // Norwegian Bokmal
  if (navigator.language.indexOf('nb') >= 0) {
    translate((currentLanguage = 'norwegian_bokmal'));
  }
  // Norwegian
  if (navigator.language.indexOf('no') >= 0) {
    translate((currentLanguage = 'norwegian_bokmal'));
  }
  // Swedish
  if (navigator.language.indexOf('sv') >= 0) {
    translate((currentLanguage = 'swedish'));
  }
  // POLISH
  if (navigator.language.indexOf('pl') >= 0) {
    translate((currentLanguage = 'polish'));
  }
  // GREEK
  if (navigator.language.indexOf('el') >= 0) {
    translate((currentLanguage = 'greek'));
  }
  // LATVIAN
  if (navigator.language.indexOf('lv') >= 0) {
    translate((currentLanguage = 'latvian'));
  }
  // MALAY
  if (navigator.language.indexOf('ms') >= 0) {
    translate((currentLanguage = 'malay'));
  }
  // ROMANIAN
  if (navigator.language.indexOf('ro') >= 0) {
    translate((currentLanguage = 'romanian'));
  }
  // THAI
  if (navigator.language.indexOf('th') >= 0) {
    translate((currentLanguage = 'thai'));
  }
  // SLOVAK
  if (navigator.language.indexOf('sk') >= 0) {
    translate((currentLanguage = 'slovak'));
  }
  // SLOVENE
  if (navigator.language.indexOf('sl') >= 0) {
    translate((currentLanguage = 'slovene'));
  }
  // HUNGARIAN
  if (navigator.language.indexOf('hu') >= 0) {
    translate((currentLanguage = 'hungarian'));
  }
  // ARABIC
  if (navigator.language.indexOf('ar') >= 0) {
    translate((currentLanguage = 'arabic'));
  }

  // Direct the 'Shop Gift Cards' button to roblox.com/shopgiftcards instead of CashStar
  const shopgiftcardsCountries = [
    'ae', // United Arab Emirates
    'at', // Austria
    'au', // Australia
    'be', // Belgium
    'br', // Brazil
    'ca', // Canada
    'ch', // Switzerland
    'de', // Germany
    'es', // Spain
    'fi', // Finland
    'fr', // France
    'gr', // Greece
    'ie', // Ireland
    'it', // Italy
    'jp', // Japan
    'mx', // Mexico
    'nl', // Netherlands
    'nz', // New Zealand
    'pl', // Poland
    'pt', // Portugal
    'sa', // Saudi Arabia
    'uk', // United Kingdom
    'us', // United States
    'za' // South Africa
  ];
  if (shopgiftcardsCountries.includes(currentPage) && currentLanguage === 'english') {
    links.mainbutton = Endpoints.getAbsoluteUrl(`/shopgiftcards?location=${currentPage}`);
  }

  applylinks();

  if (!isLandingPage) {
    if (currentPageInfo.hideExclusiveDesc) {
      $('.lang-exclusive-desc').hide();
      const button = $('.section-button.main-button.button-container');
      button.css('margin-top', '0px');
    }
    if (currentPageInfo.hideExclusive) {
      $('.container.exclusive-item').parent().hide();
      $('.section:nth-last-of-type(1)').toggleClass('dark light');
    }
  }
  if (
    isLandingPage &&
    B2B_LANGUAGES.indexOf(currentLanguage) > -1 &&
    B2B_COUNTRIES.indexOf(currentPage) > -1
  ) {
    if ($('.giftcards-b2b').length > 0) {
      $('.section:nth-last-of-type(2)').toggleClass('dark light');
      $('.giftcards-b2b, .giftcards-b2b-note').removeClass('hide');
    }
  }

  const partyPackEnabled = isLandingPage && currentPage === 'us';
  if (partyPackEnabled) {
    $('.section.virtual-items').toggleClass('hide', true);
    $('.section.giftcard-carousel-section').toggleClass('hide', true);
    $('.section.giftcard-party-pack').toggleClass('hide', false);
  }
});
