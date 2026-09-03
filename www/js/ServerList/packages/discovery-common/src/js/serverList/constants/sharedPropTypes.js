import PropTypes from "prop-types";

export const serverListMetadataPropType = PropTypes.shape({
  canCreateServer: PropTypes.bool.isRequired,
  placeId: PropTypes.number.isRequired,
  placeName: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  privateServerProductId: PropTypes.number.isRequired,
  privateServerLimit: PropTypes.number.isRequired,
  sellerId: PropTypes.number.isRequired,
  sellerName: PropTypes.string.isRequired,
  universeId: PropTypes.number.isRequired,
  userCanManagePlace: PropTypes.bool.isRequired,
  preopenCreatePrivateGame: PropTypes.bool.isRequired,
});

export default {
  serverListMetadataPropType,
};
