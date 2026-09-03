import playerSearchModule from '../playerSearchModule';

const cardLabels = {
  aka: 'aka',
  friends: 'friends',
  following: 'following',
  presence: 'presence',
  yourself: 'yourself'
};

playerSearchModule.constant('cardLabels', cardLabels);
export default cardLabels;
