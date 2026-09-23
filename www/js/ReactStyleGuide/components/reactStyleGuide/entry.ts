import { addExternal } from "@rbx/externals";
import {
  AvatarCardItem,
  AvatarCardList,
  ItemCard,
  itemCardUtils,
  Banner,
  Button,
  IconButton,
  DatePicker,
  NativeDropdown,
  Dropdown,
  FileUpload,
  FilterSelect,
  Form,
  FormControl,
  FormGroup,
  Image,
  Link,
  Loading,
  Modal,
  SimpleModal,
  createModal,
  Pagination,
  ProgressBar,
  Popover,
  ScrollBar,
  Section,
  SystemFeedback,
  createSystemFeedback,
  useSystemFeedback,
  SystemFeedbackProvider,
  SimpleTab,
  SimpleTabs,
  Tabs,
  Toast,
  Toggle,
  Tooltip,
  TextFormField,
} from "@rbx/core-ui";
import ExperimentationService from "@rbx/experimentation";
import * as localStorage from "@rbx/core-lib/local-storage";
import { type LocalStorageJsonSerializable } from "@rbx/core-lib/local-storage";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import "./main.css";

addExternal("ReactStyleGuide", {
  AvatarCardItem,
  AvatarCardList,
  Banner,
  Button,
  DatePicker,
  Dropdown,
  FileUpload,
  FilterSelect,
  Form,
  FormControl,
  FormGroup,
  IconButton,
  Image,
  ItemCard,
  Link,
  Loading,
  Modal,
  NativeDropdown,
  Pagination,
  Popover,
  ProgressBar,
  ScrollBar,
  Section,
  SimpleModal,
  SimpleTab,
  SimpleTabs,
  SystemFeedback,
  Tabs,
  TextFormField,
  Toast,
  Toggle,
  Tooltip,
  createSystemFeedback,
  useSystemFeedback,
  SystemFeedbackProvider,
  createModal,
  ItemCardUtils: itemCardUtils,
});

declare module "@rbx/core-lib/local-storage" {
  interface LocalStorageRegistry {
    /** Temporary field for the 20th anniversary event, caches the IXP result per user. */
    "classic-theme-variant":
      | {
          readonly version: 0;
          readonly data: string[];
        }
      | {
          readonly version: 1;
          readonly data: LocalStorageJsonSerializable;
        };
  }
}

const variantClass = "classic-theme-variant-1";

const applyClassThemeVariant = () => {
  const id = authenticatedUser()?.id?.toString();
  if (id == null) {
    return;
  }
  const themeData = localStorage.getItem("classic-theme-variant") ?? { version: 0, data: [] };
  if (themeData.version !== 0) {
    return;
  }
  const enabled = themeData.data.includes(id);
  if (enabled) {
    document.body.classList.add(variantClass);
  }

  // Always run this to reflect changes in IXP
  // eslint-disable-next-line no-void, @rbx/promises/prefer-query-mutation
  void ExperimentationService.getAllValuesForLayer("PlayerApp.R20.AccessEnrollment")
    .then(result => {
      const enabled = result.FFlagAppClassicThemeGreenButtonColors === true;
      if (enabled) {
        document.body.classList.add(variantClass);
      } else {
        document.body.classList.remove(variantClass);
      }
      const themeData = localStorage.getItem("classic-theme-variant") ?? { version: 0, data: [] };
      if (themeData.version !== 0) {
        return;
      }
      const present = themeData.data.includes(id);
      if (enabled && !present) {
        const newData = { version: 0 as const, data: [...themeData.data, id] };
        localStorage.setItem("classic-theme-variant", newData);
      } else if (!enabled && present) {
        const newData = { version: 0 as const, data: themeData.data.filter(x => x !== id) };
        localStorage.setItem("classic-theme-variant", newData);
      }
    })
    .catch(() => undefined);
};

try {
  applyClassThemeVariant();
} catch {
  // do nothing
}
