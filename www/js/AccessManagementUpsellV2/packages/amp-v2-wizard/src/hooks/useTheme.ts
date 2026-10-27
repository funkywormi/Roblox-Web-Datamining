import { useEffect, useState } from "react";
import { document, window } from "@rbx/core-lib/browser";

const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";
const darkSchemeQuery = "(prefers-color-scheme: dark)";

const isDarkTheme = (): boolean => {
  if (!document) {
    return false;
  }
  if (!isNextJs) {
    return document.body.classList.contains("dark-theme");
  }
  const { classList } = document.documentElement;
  return (
    classList.contains("color-mode-dark") ||
    (classList.contains("color-mode-system") &&
      (window?.matchMedia(darkSchemeQuery).matches ?? false))
  );
};

const useTheme = (): "dark" | "light" => {
  const [darkTheme, setDarkTheme] = useState(isDarkTheme);

  useEffect(() => {
    if (!document) {
      return undefined;
    }
    const update = () => {
      setDarkTheme(isDarkTheme());
    };
    const observer = new MutationObserver(update);
    observer.observe(isNextJs ? document.documentElement : document.body, {
      attributeFilter: ["class"],
    });
    const media = isNextJs ? window?.matchMedia(darkSchemeQuery) : undefined;
    media?.addEventListener("change", update);
    return () => {
      observer.disconnect();
      media?.removeEventListener("change", update);
    };
  }, []);

  return darkTheme ? "dark" : "light";
};

export default useTheme;
