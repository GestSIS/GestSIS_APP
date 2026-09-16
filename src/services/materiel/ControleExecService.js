import Api from "/src/http/Request";

export default {
  getExecsPourArticle(articleId) {
    return Api.api().get(`articles/${articleId}/controle-execs`);
  },
  getDernieresExecutions(controleId) {
    return Api.api().get(`controles/${controleId}/dernieres-executions`);
  },
  creerExec(controleId, articleId, exec) {
    return Api.api().post(`controles/${controleId}/articles/${articleId}/execs`, exec);
  },
  creerExecsMultiple(controleId, payload) {
    return Api.api().post(`controles/${controleId}/execs-multiple`, payload);
  },
  modifierExec(execId, exec) {
    return Api.api().put(`controle-execs/${execId}`, exec);
  },
  supprimerExec(execId) {
    return Api.api().delete(`controle-execs/${execId}`);
  },
};
