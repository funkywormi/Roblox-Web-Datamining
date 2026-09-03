import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;

const events = {
  filterFriendsByName: {
    name: 'filterFriendsByName',
    type: eventTypes.formInteraction,
    context: 'friends',
    requiredParams: ['query']
  },
  filterFriendsByStatus: {
    name: 'filterFriendsByStatus',
    type: eventTypes.formInteraction,
    context: 'friends',
    requiredParams: ['status']
  }
};

export { events as default };
