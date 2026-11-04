import Api from "/src/http/Request";
import { exportFileName, toLocalIsoDate } from "/src/tools/index.js";

export default {
  downloadConvocations(exerciceComptableId, params) {
    return Api.apiFileDownload(exportFileName(["convocations", toLocalIsoDate()], "pdf")).get(
      "/convocation/" + exerciceComptableId,
      { params },
    );
  },
};
