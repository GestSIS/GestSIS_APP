import Api from '/src/http/Request';

export default {
  downloadExcel(sapeurIds) {
    return Api.apiFileDownload('sapeurs.xlsx').post('/publipostage', {
      sapeurIds,
    });
  },
};
