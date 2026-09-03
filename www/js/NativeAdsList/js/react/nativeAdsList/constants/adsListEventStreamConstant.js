import { eventStreamService } from 'core-roblox-utilities';

const { eventTypes } = eventStreamService;

const events = {
  gameListClicked: {
    name: 'gameListDropdownClicked',
    type: eventTypes.formInteraction,
    context: 'sponsoredAdsList'
  },
  createBtnClicked: {
    name: 'createBtnClicked',
    type: eventTypes.formInteraction,
    context: 'sponsoredAdsList'
  },
  oldSponsoredLinkClicked: {
    name: 'oldSponsoredLinkClicked',
    type: eventTypes.formInteraction,
    context: 'sponsoredAdsList'
  },
  stopAdClick: {
    name: 'adStopClicked',
    type: eventTypes.formInteraction,
    context: 'sponsoredAdsList'
  },
  stopAdConfirmed: {
    name: 'adStopConfirmClicked',
    type: eventTypes.formInteraction,
    context: 'sponsoredAdsList'
  },
  expandAdDetail: {
    name: 'adDetailExpandClicked',
    type: eventTypes.formInteraction,
    context: 'sponsoredAdsList'
  },
  foldAdDetail: {
    name: 'adDetailFoldClicked',
    type: eventTypes.formInteraction,
    context: 'sponsoredAdsList'
  }
};

export default events;
