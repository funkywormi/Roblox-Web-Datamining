import * as EventType from './eventType';

const SetMetadata = data => ({
  type: EventType.SET_METADATA,
  data
});

export default SetMetadata;
