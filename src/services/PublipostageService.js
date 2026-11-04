import Api from "/src/http/Request";
import { exportFileName, toLocalIsoDate } from "/src/tools/index.js";

export default {
  downloadExcel(sapeurIds) {
    const filename = exportFileName(["publipostage-sapeurs", toLocalIsoDate()], "xlsx");
    return Api.apiFileDownload(filename).post("/publipostage", { sapeurIds });
  },
};
