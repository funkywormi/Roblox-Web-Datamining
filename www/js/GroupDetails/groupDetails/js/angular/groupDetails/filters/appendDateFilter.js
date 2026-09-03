import groupModule from '../groupModule';

function appendDate($filter) {
  'ngInject';

  return (text, date) => {
    return `${text} | ${$filter('datetime')(date, 'full')}`;
  };
}

groupModule.filter('appendDate', appendDate);

export default appendDate;
