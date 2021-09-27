import Api from '@/http/Request';

export default {
  downloadExcel() {
    return Api.apiFileDownload('sapeurs.xlsx').get('/publipostage/');
  },
};
