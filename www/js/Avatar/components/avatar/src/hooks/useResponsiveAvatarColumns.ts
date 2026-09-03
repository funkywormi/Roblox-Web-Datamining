import { useEffect, useState } from "react";

// Number of item columns the editor shows at a given *available* width. These
// widths mirror the full editor width (including the 300px preview column).
// The matching `.content[data-avatar-columns="N"]` rules live in avatar-non-fui.css.
const COLUMN_BREAKPOINTS: readonly { columns: number; minWidth: number }[] = [
  { columns: 7, minWidth: 1238 },
  { columns: 6, minWidth: 1104 },
  { columns: 5, minWidth: 0 },
];

// Widest layout's column count (7). Useful as a prefetch target / safe default.
export const MAX_AVATAR_COLUMNS = Math.max(...COLUMN_BREAKPOINTS.map(({ columns }) => columns));

const resolveColumns = (availableWidth: number): number =>
  COLUMN_BREAKPOINTS.find(({ minWidth }) => availableWidth >= minWidth)?.columns ?? 5;

const AVATAR_COLUMNS_ATTRIBUTE = "data-avatar-columns";

// Read the column count the grid is *actually* using from the attribute the
// writer hook sets on `.content`. This is the single source of truth, so any
// consumer (e.g. the recommendations strip) stays perfectly column-aligned with
// the item grid. When the attribute is absent the markup renders the default
// seven-column layout, so we fall back to the widest count.
const readColumnsAttribute = (): number => {
  if (typeof document === "undefined") {
    return MAX_AVATAR_COLUMNS;
  }
  const contentEl = document.querySelector<HTMLElement>(".content");
  const parsed = Number(contentEl?.getAttribute(AVATAR_COLUMNS_ATTRIBUTE));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : MAX_AVATAR_COLUMNS;
};

// Drives the responsive 7 -> 6 -> 5 column layout off the editor's actual
// available width rather than the raw viewport. The avatar editor renders inside
// the host page's `.content` element, which sits within the site shell, so its
// usable width is narrower than the window; observing the container keeps the
// column count correct regardless of surrounding chrome (nav rail, padding).
const useResponsiveAvatarColumns = (): void => {
  useEffect(() => {
    const contentEl = document.querySelector<HTMLElement>(".content");
    const containerEl = contentEl?.parentElement;
    if (!contentEl || !containerEl) {
      return undefined;
    }

    const apply = (): void => {
      const availableWidth = containerEl.getBoundingClientRect().width;
      if (!availableWidth) {
        return;
      }
      contentEl.setAttribute(AVATAR_COLUMNS_ATTRIBUTE, String(resolveColumns(availableWidth)));
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(containerEl);

    return () => {
      observer.disconnect();
      contentEl.removeAttribute(AVATAR_COLUMNS_ATTRIBUTE);
    };
  }, []);
};

// Read-only companion to `useResponsiveAvatarColumns`: returns the editor's
// current column count (5/6/7) by tracking the `data-avatar-columns` attribute
// that the writer hook maintains on `.content`. Reading the attribute (rather
// than re-measuring) guarantees consumers stay column-aligned with the grid.
// Use this to size single-row UIs (e.g. the recommendations strip).
export const useAvatarColumns = (): number => {
  const [columns, setColumns] = useState<number>(readColumnsAttribute);

  useEffect(() => {
    const contentEl = document.querySelector<HTMLElement>(".content");
    if (!contentEl) {
      return undefined;
    }

    setColumns(readColumnsAttribute());

    const observer = new MutationObserver(() => {
      setColumns(readColumnsAttribute());
    });
    observer.observe(contentEl, { attributes: true, attributeFilter: [AVATAR_COLUMNS_ATTRIBUTE] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return columns;
};

export default useResponsiveAvatarColumns;
