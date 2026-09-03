import React from "react";
import PropTypes from "prop-types";
import { urlService } from "@rbx/core-scripts/legacy/core-utilities";
import { dataStores, eventStreamService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import {
  Dropdown as FoundationDropdown,
  Menu,
  MenuItem,
  MenuSection,
  ProgressCircle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogFooter,
  Button,
} from "@rbx/foundation-ui";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { refreshCurrentSession } from "@rbx/authentication-common/utils/authUtil";
import eventStreamEvents from "../constants/languageSelectorEventStreamConstants";
import cacheConstants from "../constants/cacheConstants";
import { languageSelectorPlaceholder } from "../constants/languageSelectorConstants";

const queryParamName = "locale";
const { localeDataStore } = dataStores;

const getLocaleLabel = supportedLocale => {
  if (supportedLocale.locale && supportedLocale.locale.nativeName) {
    return supportedLocale.isEnabledForFullExperience
      ? supportedLocale.locale.nativeName
      : `${supportedLocale.locale.nativeName}*`;
  }
  return "";
};

class LanguageSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      supportedLocales: [],
      userLocale: {},
      showUnsupportedModal: false,
      isUserLocaleUnsupported: false,
      isLocaleUpdateInProgress: false,
    };
    this.handleNativeLanguageChange = this.handleNativeLanguageChange.bind(this);
    this.hideUnsupportedModal = this.hideUnsupportedModal.bind(this);
  }

  componentDidMount() {
    this.loadSupportedLocales();
  }

  handleLanguageChange(selectedLocale) {
    const supportedLocale = { ...selectedLocale.locale };
    const { userLocale } = this.state;
    const { isAuthenticatedUser, onLanguageChange } = this.props;
    const previousSupportedLocale = { ...userLocale };
    if (isAuthenticatedUser) {
      this.setState({
        isLocaleUpdateInProgress: true,
      });
      localeDataStore
        .setUserLocale(supportedLocale.locale)
        .then(
          async () => {
            await refreshCurrentSession();
            if (selectedLocale.isEnabledForFullExperience) {
              onLanguageChange(supportedLocale);
            } else {
              this.showUnsupportedLocaleMessage();
              this.showUnsupportedLocaleModal(supportedLocale);
            }
          },
          error => {
            console.error(error);
          },
        )
        .finally(() => {
          this.setState({
            isLocaleUpdateInProgress: false,
          });
        });
    } else {
      onLanguageChange(supportedLocale);
    }

    this.setUserLocaleByLocaleCode(supportedLocale.locale);

    eventStreamService.sendEvent(eventStreamEvents.changeLanguage, {
      userId: authenticatedUser.id,
      newSupportedLocaleCode: supportedLocale.locale,
      previousSupportedLocaleCode: previousSupportedLocale.locale.locale,
    });
  }

  getFoundationSelector() {
    const { supportedLocales, userLocale, isLocaleUpdateInProgress } = this.state;
    const dict = Object.assign(
      ...supportedLocales.map(supportedLocale => ({
        [supportedLocale.locale.locale]: supportedLocale,
      })),
    );

    return (
      <FoundationDropdown
        value={userLocale?.locale?.locale}
        className="form-group"
        onValueChange={selectedLocale => this.handleLanguageChange(dict[selectedLocale])}
        size="Medium"
        placeholder={languageSelectorPlaceholder}
        isDisabled={isLocaleUpdateInProgress}
      >
        <Menu>
          <MenuSection>
            {supportedLocales.map(supportedLocale => (
              <MenuItem
                key={supportedLocale.locale.id}
                title={getLocaleLabel(supportedLocale)}
                value={supportedLocale.locale.locale}
              />
            ))}
          </MenuSection>
        </Menu>
      </FoundationDropdown>
    );
  }

  handleNativeLanguageChange(event) {
    const { supportedLocales } = this.state;
    const selectedLocaleCode = event.target.value;
    const selectedSupportedLocale = supportedLocales.find(
      supportedLocale => supportedLocale.locale.locale === selectedLocaleCode,
    );
    this.handleLanguageChange(selectedSupportedLocale);
  }

  getNativeSelector() {
    const { supportedLocales, userLocale } = this.state;
    const dropdownOptions = supportedLocales.map(supportedLocale => ({
      value: supportedLocale.locale.locale,
      key: supportedLocale.locale.id,
      label: getLocaleLabel(supportedLocale),
    }));

    const userLocaleCode = userLocale.locale && userLocale.locale.locale;

    return (
      dropdownOptions.length > 0 && (
        <select
          id="language-switcher"
          className="flex items-center justify-between width-full bg-none stroke-standard stroke-contrast-alpha cursor-pointer radius-medium height-1000 text-body-medium padding-x-medium"
          value={userLocaleCode}
          onChange={this.handleNativeLanguageChange}
        >
          {dropdownOptions.map(option => (
            <option
              key={option.key}
              value={option.value}
              className="flex width-full items-center bg-none padding-x-medium stroke-standard "
            >
              {option.label}
            </option>
          ))}
        </select>
      )
    );
  }
  getSelector() {
    const { isNative } = this.props;

    if (isNative) {
      return this.getNativeSelector();
    }

    return this.getFoundationSelector();
  }

  setUserLocaleByLocaleCode(localeCode) {
    const selectedLocale = this.findSupportedLocaleByLocaleCode(localeCode);
    this.setState({
      userLocale: {
        ...selectedLocale,
      },
    });

    if (!selectedLocale.isEnabledForFullExperience) {
      this.showUnsupportedLocaleMessage();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  sortSupportedLocalesByFullExperience(unsortedLocales) {
    if (Array.isArray(unsortedLocales)) {
      const fullExperienceLocales = unsortedLocales
        .filter(locale => locale.isEnabledForFullExperience)
        .sort((a, b) => (a.locale.nativeName > b.locale.nativeName ? 1 : -1));
      const unsupportedLocales = unsortedLocales
        .filter(locale => !locale.isEnabledForFullExperience)
        .sort((a, b) => (a.locale.nativeName > b.locale.nativeName ? 1 : -1));

      return [...fullExperienceLocales, ...unsupportedLocales];
    }
    return unsortedLocales;
  }

  // eslint-disable-next-line class-methods-use-this
  filterLocalesBySeoSupport(unsortedLocales) {
    if (Array.isArray(unsortedLocales)) {
      return unsortedLocales
        .filter(
          // SEO doesn't support extended language codes such as 'zh-hans' for now.
          locale =>
            locale.isEnabledForFullExperience && locale.locale.language.languageCode.length === 2,
        )
        .sort((a, b) => (a.locale.nativeName > b.locale.nativeName ? 1 : -1));
    }
    return unsortedLocales;
  }

  findSupportedLocaleByLocaleCode(localeCode) {
    const { supportedLocales } = this.state;
    return supportedLocales.find(supportedLocale => supportedLocale.locale.locale === localeCode);
  }

  loadSupportedLocales() {
    localeDataStore.getLocalesWithCache(cacheConstants.getLocalesCacheTimeoutInMs).then(
      response => {
        const { hideSeoUnsupportedLocales } = this.props;

        if (hideSeoUnsupportedLocales) {
          this.setState({
            supportedLocales: this.filterLocalesBySeoSupport(response.data),
          });
        } else {
          this.setState({
            supportedLocales: this.sortSupportedLocalesByFullExperience(response.data),
          });
        }

        this.loadUserLocale();
      },
      error => {
        console.error(error);
      },
    );
  }

  loadUserLocale() {
    const localeCode = urlService.getQueryParam(queryParamName);
    if (localeCode) {
      this.setUserLocaleByLocaleCode(localeCode);
    } else {
      const { isAuthenticatedUser } = this.props;
      localeDataStore.getUserLocale().then(
        response => {
          const userLocaleCode = isAuthenticatedUser
            ? response.data.ugc.locale
            : response.data.signupAndLogin.locale;
          this.setUserLocaleByLocaleCode(userLocaleCode);
        },
        error => {
          console.error(error);
        },
      );
    }
  }

  showUnsupportedLocaleModal(supportedLocale) {
    const { showWarningModalForUnsupportedLocale } = this.props;
    if (showWarningModalForUnsupportedLocale) {
      this.setState({
        showUnsupportedModal: true,
      });
      eventStreamService.sendEvent(eventStreamEvents.changeLanguageModal, {
        userId: authenticatedUser.id,
        newSupportedLocaleCode: supportedLocale.locale,
      });
    }
  }

  hideUnsupportedModal() {
    const { onLanguageChange } = this.props;
    const { userLocale } = this.state;
    onLanguageChange(userLocale);
  }

  showUnsupportedLocaleMessage() {
    const { showWarningMessageForUnsupportedLocale } = this.props;
    if (showWarningMessageForUnsupportedLocale) {
      this.setState({
        isUserLocaleUnsupported: true,
      });
    }
  }

  render() {
    const { translate } = this.props;
    const { showUnsupportedModal, isUserLocaleUnsupported, supportedLocales, userLocale } =
      this.state;

    return (
      <React.Fragment>
        {supportedLocales.length > 0 && userLocale.locale ? (
          <div className="language-selector-wrapper">{this.getSelector()}</div>
        ) : (
          <ProgressCircle variant="Indeterminate" size="Medium" />
        )}
        {showUnsupportedModal && (
          <Dialog open={showUnsupportedModal} isModal size="Medium" type="Default">
            <DialogContent>
              <DialogBody className="flex flex-col gap-y-xsmall items-center">
                <DialogTitle className="text-heading-medium">
                  {translate("Heading.UnsupportedLanguage")}
                </DialogTitle>
                <div className="text-body-medium content-default">
                  {translate("Description.UnsupportedLanguage")}
                </div>
              </DialogBody>
              <DialogFooter className="flex gap-x-small items-center">
                <Button
                  variant="Standard"
                  className="fill"
                  size="Medium"
                  onClick={this.hideUnsupportedModal}
                >
                  {translate("Action.Ok")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {isUserLocaleUnsupported && (
          <div className="row">
            <span className="text text-error">{translate("Description.UnsupportedLanguage")}</span>
          </div>
        )}
      </React.Fragment>
    );
  }
}

LanguageSelector.defaultProps = {
  onLanguageChange: () => {
    // do nothing
  },
  isAuthenticatedUser: false,
  isNative: false,
  showWarningModalForUnsupportedLocale: true,
  showWarningMessageForUnsupportedLocale: true,
  hideSeoUnsupportedLocales: false,
};

LanguageSelector.propTypes = {
  isAuthenticatedUser: PropTypes.bool,
  onLanguageChange: PropTypes.func,
  isNative: PropTypes.bool,
  showWarningModalForUnsupportedLocale: PropTypes.bool,
  showWarningMessageForUnsupportedLocale: PropTypes.bool,
  translate: PropTypes.func.isRequired,
  hideSeoUnsupportedLocales: PropTypes.bool,
};

export default LanguageSelector;
