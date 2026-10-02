// React bubbles events from portals (e.g. dialogs) through the component tree, so a handler can
// receive events whose DOM target is outside the element it is attached to.
const isEventOutsideCurrentTarget = (event: React.SyntheticEvent): boolean =>
  !(event.target instanceof Node) || !event.currentTarget.contains(event.target);

export default isEventOutsideCurrentTarget;
