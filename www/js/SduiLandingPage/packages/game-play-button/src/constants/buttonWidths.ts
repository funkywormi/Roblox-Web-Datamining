// Replaces core-ui Button.widths. FUI Button has no width prop, so full maps to the legacy
// btn-full-width class (which the discovery-common SCSS scopes its layout + centering to).
export const buttonWidths = { min: "min", full: "full", default: "" } as const;

export type TButtonWidth = (typeof buttonWidths)[keyof typeof buttonWidths];

export const fullWidthClassName = (buttonWidth: TButtonWidth | undefined): string | false =>
  buttonWidth === buttonWidths.full && "btn-full-width";

// `display: flex` restores content centering (legacy core-ui base .btn was inline-block). Height is
// NOT pinned here — FUI's fixed Large height (68px) is reset to auto in playButton.css so each
// surface's legacy SCSS governs height as before (EDP 60, tiles 44/27).
export const fuiButtonStyle = { display: "flex" } as const;
