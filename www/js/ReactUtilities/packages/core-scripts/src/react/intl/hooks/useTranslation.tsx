import { useContext } from "react";
import { WithTranslationsProps } from "../../intl";
import { TranslationContext } from "../components/TranslationProvider";

// Legacy .NET translation hook — use `useTranslations` from `@rbx/www-common/i18n` instead.
// See docs/translation-net-to-nextjs.md.
const useTranslation: () => WithTranslationsProps = () => {
  const translationProps = useContext(TranslationContext);

  if (!translationProps) {
    throw Error(
      "invalid use of `useTranslation` hook. Ensure your component has an ancestor wrapped in `TranslationProvider`",
    );
  }

  return translationProps;
};

export default useTranslation;
