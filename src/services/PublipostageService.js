import Api from '@/http/Request';

export default {
  downloadExcel(sapeurIds) {
    return Api.apiFileDownload('sapeurs.xlsx').post('/publipostage', {
      sapeurIds
    });
  },
};
