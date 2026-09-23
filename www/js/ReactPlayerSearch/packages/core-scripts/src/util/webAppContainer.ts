/**
 * Finds the container a WebAppPage renders for its static content component to mount on.
 *
 * Takes the ids in the order given, so a component that has accepted more than one id over time
 * lists the current one first. Pass the result straight to `renderWithErrorBoundary`, which reports
 * a null container.
 */
const resolveWebAppContainer = (...ids: string[]): HTMLElement | null => {
  const container = ids.reduce<HTMLElement | null>(
    (found, id) => found ?? document.getElementById(id),
    null,
  );

  if (!container) {
    console.error(
      `No web app container on this page. Looked for ${ids.map(id => `#${id}`).join(", ")}.`,
    );
  }

  return container;
};

export default resolveWebAppContainer;
