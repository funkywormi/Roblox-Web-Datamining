import { httpService } from 'core-utilities';
import { getParentInfoUrl } from '../utils/urlHelper';

function getParentInfo(userId) {
  const url = getParentInfoUrl(userId);
  return new Promise((resolve, reject) => {
    httpService.get(url).then(
      response => {
        resolve(response);
      },
      errors => {
        if (errors?.data?.errors) {
          reject(errors.data.errors);
        }
      }
    );
  });
}

export default getParentInfo;
